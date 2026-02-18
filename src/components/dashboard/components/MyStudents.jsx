import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { FaUserCheck, FaUsers, FaCommentDots } from "react-icons/fa";

function MyStudents() {
  const [requests, setRequests] = useState([]);
  const [acceptedStudents, setAcceptedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentsInfo, setStudentsInfo] = useState({});
  const [mentorInfo, setMentorInfo] = useState(null);

  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "requests"),
      where("mentorId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const allReqs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      const latestReqs = {};
      allReqs.forEach((r) => {
        const key = r.studentId;
        if (!latestReqs[key] || r.createdAt > latestReqs[key].createdAt) {
          latestReqs[key] = r;
        }
      });

      const finalList = Object.values(latestReqs);

      setRequests(finalList.filter((r) => r.status === "pending"));
      setAcceptedStudents(finalList.filter((r) => r.status === "accepted"));

      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setMentorInfo(snap.data());
    })();
  }, [user]);

  useEffect(() => {
    async function fetchStudents() {
      const ids = [
        ...requests.map((r) => r.studentId),
        ...acceptedStudents.map((r) => r.studentId),
      ].filter(Boolean);

      const unique = [...new Set(ids)];
      const data = {};

      for (const id of unique) {
        const snap = await getDoc(doc(db, "users", id));
        if (snap.exists()) data[id] = snap.data();
      }

      setStudentsInfo(data);
    }

    if (requests.length || acceptedStudents.length) fetchStudents();
    else setStudentsInfo({});
  }, [requests, acceptedStudents]);

  if (loading) return <div className="p-6">Loading students...</div>;

  const handleAccept = async (req) => {
    const studentId = req.studentId;
    const mentorId = user.uid;

    try {
      await updateDoc(doc(db, "requests", req.id), {
        status: "accepted",
      });

      await updateDoc(doc(db, "users", mentorId), {
        myStudents: arrayUnion(studentId),
      });

      const chatId = `${studentId}_${mentorId}`;
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        const studentData = studentsInfo[studentId] || {};
        const studentName = studentData.name || "Student";
        const mentorName = mentorInfo?.name || "Mentor";

        await setDoc(chatRef, {
          members: [studentId, mentorId],
          userNames: {
            [studentId]: studentName,
            [mentorId]: mentorName,
          },
          createdAt: Date.now(),
        });
      }

      alert("Student Accepted!");
    } catch (error) {
      console.error(error);
      alert("Failed to accept student.");
    }
  };

  const handleRemoveStudent = async (req) => {
    const studentId = req.studentId;
    const mentorId = user.uid;

    if (!window.confirm("Remove this student?")) return;

    try {
      await updateDoc(doc(db, "users", mentorId), {
        myStudents: arrayRemove(studentId),
      });

      await updateDoc(doc(db, "requests", req.id), {
        status: "removed",
      });

      alert("Student removed.");
    } catch (error) {
      console.error(error);
      alert("Failed to remove student.");
    }
  };

  const openChatFor = async (studentId) => {
    const mentorId = user.uid;
    const chatId = `${studentId}_${mentorId}`;
    navigate(`/dashboard/chat/${chatId}`);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <FaUsers /> My Students
      </h1>

      {/* Pending Requests */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Pending Requests</h2>

        {requests.map((r) => {
          const st = studentsInfo[r.studentId];
          return (
            <div
              key={r.id}
              className="p-4 border rounded-lg flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                <img
                  src={
                    st?.profilePic ||
                    `https://ui-avatars.com/api/?name=${st?.name || "User"}`
                  }
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-semibold">{st?.name}</p>
                  <p className="text-sm text-gray-500">{st?.email}</p>
                </div>
              </div>

              <button
                onClick={() => handleAccept(r)}
                className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:scale-105 transition"
              >
                <FaUserCheck /> Accept
              </button>
            </div>
          );
        })}
      </section>

      {/* Accepted Students */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Accepted Students</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {acceptedStudents.map((r) => {
            const st = studentsInfo[r.studentId];

            return (
              <div
                key={r.id}
                className="p-4 border rounded-lg shadow-sm hover:shadow-lg transition"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      st?.profilePic ||
                      `https://ui-avatars.com/api/?name=${st?.name || "User"}`
                    }
                    className="w-14 h-14 rounded-full"
                  />

                  <div className="flex-1">
                    <p className="font-bold">{st?.name}</p>
                    <p className="text-sm text-gray-600">{st?.email}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <button
                    onClick={() => openChatFor(r.studentId)}
                    className="bg-primary text-white px-3 py-2 rounded hover:scale-105 transition"
                  >
                    Message
                  </button>

                  <button
                    onClick={() =>
                      navigate(`/dashboard/insights/${r.studentId}`)
                    }
                    className="bg-blue-500 text-white px-3 py-2 rounded hover:scale-105 transition"
                  >
                    View Mood Insights
                  </button>

                  <button
                    onClick={() => handleRemoveStudent(r)}
                    className="bg-red-500 text-white px-3 py-2 rounded hover:scale-105 transition"
                  >
                    Remove Student
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default MyStudents;