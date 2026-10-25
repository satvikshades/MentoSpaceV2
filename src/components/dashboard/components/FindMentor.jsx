import { useEffect, useMemo, useState } from "react";
import { EXPERTISE_LABELS, expertiseList } from "../../../lib/people";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { collection, getDocs, query, where } from "firebase/firestore";
import { sendMentorRequest } from "../../../lib/actions";
import { FiSearch, FiCheck, FiClock } from "react-icons/fi";
import { db } from "../../../firebase";
import { useDashboard } from "../../../lib/useProgress";
import { Avatar, EmptyState, PageHeader, Skeleton, Spinner } from "../../ui";

export function RequestButton({ status, busy, onRequest, className = "" }) {
  if (status === "accepted")
    return (
      <span className={`btn bg-emerald-50 text-emerald-700 ${className}`}>
        <FiCheck /> Connected
      </span>
    );
  if (status === "pending")
    return (
      <span className={`btn bg-amber-50 text-amber-700 ${className}`}>
        <FiClock /> Request sent
      </span>
    );
  return (
    <button onClick={onRequest} disabled={busy} className={`btn-primary ${className}`}>
      {busy && <Spinner />} Ask to connect
    </button>
  );
}

function FindMentor() {
  const { user } = useDashboard();
  const [mentors, setMentors] = useState(null);
  const [requests, setRequests] = useState({});
  const [search, setSearch] = useState("");
  const [area, setArea] = useState("all");
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [m, r] = await Promise.all([
          getDocs(query(collection(db, "users"), where("role", "==", "mentor"))),
          getDocs(query(collection(db, "requests"), where("studentId", "==", user.uid))),
        ]);
        setMentors(m.docs.map((d) => ({ id: d.id, ...d.data() })));
        const map = {};
        r.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((x) => x.status === "pending" || x.status === "accepted")
          .forEach((x) => (map[x.mentorId] = x.status));
        setRequests(map);
      } catch (err) {
        console.error(err);
        setMentors([]);
      }
    })();
  }, [user.uid]);

  const areas = useMemo(() => {
    const set = new Set();
    (mentors || []).forEach((m) => expertiseList(m.expertise).forEach((e) => set.add(e.key)));
    return [...set];
  }, [mentors]);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (mentors || [])
      .filter((m) => !q || `${m.name} ${m.bio || ""}`.toLowerCase().includes(q))
      .filter((m) => area === "all" || expertiseList(m.expertise).some((e) => e.key === area))
      .sort((a, b) => (requests[b.id] ? 1 : 0) - (requests[a.id] ? 1 : 0));
  }, [mentors, search, area, requests]);

  const request = async (mentor) => {
    setBusy(mentor.id);
    try {
      await sendMentorRequest(user.uid, mentor.id);
      setRequests((r) => ({ ...r, [mentor.id]: "pending" }));
      toast.success(`Request sent to ${mentor.name?.split(" ")[0] || "mentor"}`);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't send the request.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Mentors"
        title="Find someone who gets it"
        subtitle="Mentors here are people who've faced similar things and want to help. Ask to connect, and once they accept you can message them."
      />

      <div className="mb-6 space-y-3">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or what they talk about"
            className="field py-3 pl-11"
          />
        </div>
        {areas.length > 0 && (
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {["all", ...areas].map((a) => (
              <button
                key={a}
                onClick={() => setArea(a)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  area === a ? "bg-ink text-white" : "bg-white text-ink/70 ring-1 ring-line hover:text-ink"
                }`}
              >
                {a === "all" ? "Everyone" : EXPERTISE_LABELS[a] || a}
              </button>
            ))}
          </div>
        )}
      </div>

      {!mentors ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <EmptyState icon="🔍" title="No mentors match that" body="Try a different word or clear the filter." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((m, i) => {
            const count = m.myStudents?.length || 0;
            return (
              <article
                key={m.id}
                className="card flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-12px_rgba(29,31,43,0.18)] animate-rise"
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
              >
                <Link to={`/mentor/${m.id}`} className="flex items-center gap-3">
                  <Avatar person={m} size={56} />
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-bold">{m.name}</h3>
                    <p className="text-xs text-muted">
                      {count > 0 ? `Mentoring ${count} ${count === 1 ? "student" : "students"}` : "Open to new students"}
                    </p>
                  </div>
                </Link>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {expertiseList(m.expertise).map((e) => (
                    <span key={e.key} className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary">
                      {e.label}
                    </span>
                  ))}
                </div>
                <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-ink/75">
                  {m.bio || "This mentor hasn't written a bio yet."}
                </p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Link to={`/mentor/${m.id}`} className="btn-ghost text-sm">
                    Profile
                  </Link>
                  <RequestButton
                    status={requests[m.id]}
                    busy={busy === m.id}
                    onRequest={() => request(m)}
                    className="text-sm"
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FindMentor;
