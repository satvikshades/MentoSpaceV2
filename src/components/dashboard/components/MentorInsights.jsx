import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { FiArrowLeft, FiMessageCircle } from "react-icons/fi";
import { db } from "../../../firebase";
import { useDashboard, useMoods } from "../../../lib/useProgress";
import { Avatar, EmptyState, PageSkeleton } from "../../ui";
import { MoodReport } from "./MoodInsights";
import { sharesMoods } from "../../../lib/consent";

/** A mentor looking at one student's mood history. */
export default function MentorInsights() {
  const { studentId } = useParams();
  const { user } = useDashboard();
  const [moods] = useMoods(studentId);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    getDoc(doc(db, "users", studentId)).then((s) => setStudent(s.exists() ? s.data() : { name: "Student" }));
  }, [studentId]);

  if (!moods || !student) return <PageSkeleton />;

  return (
    <div>
      <Link to="/dashboard/my-students" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
        <FiArrowLeft /> Students
      </Link>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar person={student} size={56} />
          <div>
            <p className="eyebrow">Mood history</p>
            <h1 className="text-2xl font-extrabold">{student.name}</h1>
          </div>
        </div>
        <Link to={`/dashboard/chat/${studentId}_${user.uid}`} className="btn-primary">
          <FiMessageCircle /> Message
        </Link>
      </div>
      {!sharesMoods(student) ? (
        <EmptyState icon="🔒" title="Check-ins are private" body={`${student.name} hasn't chosen to share mood check-ins with mentors. You can still message them.`} />
      ) : moods.length === 0 ? (
        <EmptyState icon="📈" title="No check-ins yet" body={`${student.name} hasn't logged a mood yet.`} />
      ) : (
        <MoodReport moods={moods} />
      )}
    </div>
  );
}
