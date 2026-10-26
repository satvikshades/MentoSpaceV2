import { useEffect, useState } from "react";
import { expertiseList } from "../lib/people";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { collection, deleteDoc, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { FiArrowLeft, FiMessageCircle } from "react-icons/fi";
import { db } from "../firebase";
import { useDashboard } from "../lib/useProgress";
import { Avatar, PageSkeleton } from "../components/ui";
import { RequestButton } from "../components/dashboard/components/FindMentor";
import { sendMentorRequest } from "../lib/actions";
import { qualificationLabel } from "../lib/legal";

function MentorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useDashboard();
  const [mentor, setMentor] = useState(null);
  const [req, setReq] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "users", id)).then((s) => setMentor(s.exists() ? s.data() : false));
  }, [id]);

  useEffect(() => {
    if (!user) return;
    getDocs(query(collection(db, "requests"), where("studentId", "==", user.uid))).then((snap) => {
      const mine = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((r) => r.mentorId === id && (r.status === "pending" || r.status === "accepted"));
      setReq(mine[0] || null);
    });
  }, [user, id]);

  if (mentor === null) return <PageSkeleton />;
  if (mentor === false)
    return (
      <div className="card p-10 text-center">
        <p className="font-bold">This profile doesn't exist anymore.</p>
        <Link to="/dashboard/find-mentor" className="btn-soft mt-4">Browse mentors</Link>
      </div>
    );

  const request = async () => {
    setBusy(true);
    try {
      const rid = await sendMentorRequest(user.uid, id);
      setReq({ id: rid, status: "pending" });
      toast.success("Request sent");
    } catch {
      toast.error("Couldn't send the request.");
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    if (!req?.id) return;
    setBusy(true);
    try {
      await deleteDoc(doc(db, "requests", req.id));
      setReq(null);
      toast("Request withdrawn");
    } finally {
      setBusy(false);
    }
  };

  const count = mentor.myStudents?.length || 0;

  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
        <FiArrowLeft /> Back
      </button>

      <div className="card overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-primary to-secondary sm:h-36" />
        <div className="px-6 pb-7 sm:px-8">
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <Avatar person={mentor} size={104} className="ring-4 ring-white" />
            {role !== "mentor" && (
              <div className="flex gap-2">
                {req?.status === "accepted" && (
                  <Link to={`/dashboard/chat/${user.uid}_${id}`} className="btn-primary">
                    <FiMessageCircle /> Message
                  </Link>
                )}
                {req?.status === "pending" ? (
                  <button onClick={cancel} disabled={busy} className="btn-ghost">
                    Withdraw request
                  </button>
                ) : req?.status !== "accepted" ? (
                  <RequestButton status={req?.status} busy={busy} onRequest={request} />
                ) : null}
              </div>
            )}
          </div>

          <h1 className="mt-4 text-3xl font-extrabold">{mentor.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {qualificationLabel(mentor.mentorDetails?.qualification) || "Mentor"}
            {mentor.mentorDetails?.rciNumber ? ` · RCI ${mentor.mentorDetails.rciNumber}` : ""}
            {mentor.mentorDetails?.experienceYears ? ` · ${mentor.mentorDetails.experienceYears} yrs experience` : ""}
            {count > 0 ? ` · ${count} ${count === 1 ? "student" : "students"}` : ""}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {expertiseList(mentor.expertise).map((e) => (
              <span key={e.key} className="rounded-full bg-primary-50 px-3 py-1 text-sm font-semibold text-primary">
                {e.label}
              </span>
            ))}
          </div>

          <div className="mt-6 border-t border-line pt-6">
            <h2 className="eyebrow">About</h2>
            <p className="mt-2 whitespace-pre-line text-[16px] leading-relaxed text-ink/80">
              {mentor.bio || "This mentor hasn't written a bio yet."}
            </p>
          </div>

          {req?.status === "pending" && (
            <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Your request is waiting. You'll be able to message them as soon as they accept.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MentorProfile;
