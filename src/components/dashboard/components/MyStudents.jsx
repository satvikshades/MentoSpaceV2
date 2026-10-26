import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { arrayRemove, arrayUnion, collection, doc, getDoc, onSnapshot, query, setDoc, updateDoc, where } from "firebase/firestore";
import { FiActivity, FiCheck, FiMessageCircle, FiX } from "react-icons/fi";
import { db } from "../../../firebase";
import { useDashboard } from "../../../lib/useProgress";
import { timeAgo, toDate } from "../../../lib/progress";
import { Avatar, EmptyState, Modal, PageHeader, PageSkeleton, Spinner } from "../../ui";

function MyStudents() {
  const { user, profile } = useDashboard();
  const [reqs, setReqs] = useState(null);
  const [people, setPeople] = useState({});
  const [busy, setBusy] = useState(null);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "requests"), where("mentorId", "==", user.uid));
    return onSnapshot(q, (snap) => {
      // keep only the latest request per student
      const latest = {};
      snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .forEach((r) => {
          const prev = latest[r.studentId];
          if (!prev || (toDate(r.createdAt) || 0) > (toDate(prev.createdAt) || 0)) latest[r.studentId] = r;
        });
      setReqs(Object.values(latest));
    });
  }, [user.uid]);

  useEffect(() => {
    if (!reqs) return;
    const missing = reqs.map((r) => r.studentId).filter((id) => id && !people[id]);
    if (!missing.length) return;
    Promise.all(missing.map((id) => getDoc(doc(db, "users", id)))).then((snaps) =>
      setPeople((p) => {
        const next = { ...p };
        snaps.forEach((s) => (next[s.id] = s.exists() ? s.data() : { name: "Student" }));
        return next;
      })
    );
  }, [reqs, people]);

  if (!reqs) return <PageSkeleton />;

  const pending = reqs.filter((r) => r.status === "pending");
  const accepted = reqs.filter((r) => r.status === "accepted");

  const accept = async (r) => {
    setBusy(r.id);
    try {
      await updateDoc(doc(db, "requests", r.id), { status: "accepted" });
      await updateDoc(doc(db, "users", user.uid), { myStudents: arrayUnion(r.studentId) });
      const chatId = `${r.studentId}_${user.uid}`;
      const chatRef = doc(db, "chats", chatId);
      const existing = await getDoc(chatRef);
      if (!existing.exists()) {
        await setDoc(chatRef, {
          members: [r.studentId, user.uid],
          userNames: { [r.studentId]: people[r.studentId]?.name || "Student", [user.uid]: profile.name || "Mentor" },
          createdAt: Date.now(),
        });
      }
      toast.success(`You're now mentoring ${people[r.studentId]?.name?.split(" ")[0] || "them"}`);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't accept. Try again.");
    } finally {
      setBusy(null);
    }
  };

  const decline = async (r) => {
    setBusy(r.id);
    try {
      await updateDoc(doc(db, "requests", r.id), { status: "declined" });
      toast("Request declined");
    } catch {
      toast.error("Couldn't decline.");
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    const r = removing;
    setRemoving(null);
    try {
      await updateDoc(doc(db, "users", user.uid), { myStudents: arrayRemove(r.studentId) });
      await updateDoc(doc(db, "requests", r.id), { status: "removed" });
      toast("Student removed");
    } catch {
      toast.error("Couldn't remove.");
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Students" title="The people you're helping" />

      {pending.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
            Waiting for you
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-white">{pending.length}</span>
          </h2>
          <div className="space-y-2">
            {pending.map((r) => {
              const st = people[r.studentId];
              return (
                <div key={r.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center animate-rise">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar person={st} size={48} />
                    <div className="min-w-0">
                      <p className="truncate font-bold">{st?.name || "…"}</p>
                      <p className="truncate text-sm text-muted">
                        Asked {timeAgo(r.createdAt)}
                        {st?.bio ? ` · ${st.bio}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => decline(r)} disabled={busy === r.id} className="btn-ghost flex-1 sm:flex-none">
                      <FiX /> Decline
                    </button>
                    <button onClick={() => accept(r)} disabled={busy === r.id} className="btn-primary flex-1 sm:flex-none">
                      {busy === r.id ? <Spinner /> : <FiCheck />} Accept
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-bold">Your students</h2>
        {accepted.length === 0 ? (
          <EmptyState
            icon="🌱"
            title="No students yet"
            body="Students find you through the Mentors page. A clear bio about what you can help with makes a big difference."
            action={<Link to="/dashboard/profile" className="btn-soft">Edit your bio</Link>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {accepted.map((r) => {
              const st = people[r.studentId];
              return (
                <div key={r.id} className="card flex flex-col p-5">
                  <div className="flex items-center gap-3">
                    <Avatar person={st} size={52} />
                    <div className="min-w-0">
                      <p className="truncate font-bold">{st?.name || "…"}</p>
                      <p className="truncate text-sm text-muted">{st?.email}</p>
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <Link to={`/dashboard/chat/${r.studentId}_${user.uid}`} className="btn-primary text-sm">
                      <FiMessageCircle /> Message
                    </Link>
                    <Link to={`/dashboard/insights/${r.studentId}`} className="btn-ghost text-sm">
                      <FiActivity /> Moods
                    </Link>
                  </div>
                  <button onClick={() => setRemoving(r)} className="mt-3 text-xs font-semibold text-muted hover:text-red-600">
                    Stop mentoring
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Modal open={!!removing} onClose={() => setRemoving(null)} title="Stop mentoring?">
        <p className="text-sm text-muted">
          {people[removing?.studentId]?.name || "This student"} will no longer be in your list. They can send a new request later.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={() => setRemoving(null)} className="btn-ghost">Cancel</button>
          <button onClick={remove} className="btn bg-red-600 text-white hover:bg-red-700">Stop mentoring</button>
        </div>
      </Modal>
    </div>
  );
}

export default MyStudents;
