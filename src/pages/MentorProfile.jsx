import { useParams } from "react-router-dom";
import { doc, getDoc, collection, addDoc, query, where, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useEffect, useState } from "react";

function MentorProfile() {
  const { id } = useParams();
  const [mentor, setMentor] = useState(null);

  const [requestStatus, setRequestStatus] = useState("none"); 
  // none | pending | accepted
  const [requestId, setRequestId] = useState(null);

  const user = auth.currentUser;

  // -------------------------------------------------------
  // FETCH MENTOR PROFILE
  // -------------------------------------------------------
  useEffect(() => {
    async function fetchMentor() {
      const ref = doc(db, "users", id);
      const snap = await getDoc(ref);

      if (snap.exists()) setMentor(snap.data());
    }
    fetchMentor();
  }, [id]);

  // -------------------------------------------------------
  // CHECK IF REQUEST ALREADY EXISTS
  // -------------------------------------------------------
  useEffect(() => {
    if (!user) return;

    async function checkRequest() {
      const q = query(
        collection(db, "requests"),
        where("studentId", "==", user.uid),
        where("mentorId", "==", id)
      );

      const snap = await getDocs(q);

      if (!snap.empty) {
        const req = snap.docs[0];
        setRequestId(req.id);
        setRequestStatus(req.data().status);
      }
    }

    checkRequest();
  }, [user, id]);

  // -------------------------------------------------------
  // SEND REQUEST
  // -------------------------------------------------------
  const handleSendRequest = async () => {
    if (!user) return alert("Login to send request!");

    if (requestStatus !== "none")
      return alert("You already sent a request!");

    const ref = await addDoc(collection(db, "requests"), {
      studentId: user.uid,
      mentorId: id,
      status: "pending",
      createdAt: new Date(),
    });

    setRequestId(ref.id);
    setRequestStatus("pending");
  };

  // -------------------------------------------------------
  // CANCEL PENDING REQUEST
  // -------------------------------------------------------
  const handleCancelRequest = async () => {
    if (!requestId) return;
    await deleteDoc(doc(db, "requests", requestId));
    setRequestStatus("none");
    setRequestId(null);
  };

  // -------------------------------------------------------
  if (!mentor) return <div className="p-10">Loading mentor...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 bg-white rounded-lg shadow">
      <img
        src={mentor.profilePic}
        className="w-32 h-32 rounded-full object-cover"
      />
      <h1 className="text-3xl font-bold">{mentor.name}</h1>
      <p className="text-gray-600">{mentor.bio || "No bio yet"}</p>

      <h3 className="font-semibold mt-4">Expertise</h3>
      <div className="flex gap-2 flex-wrap">
        {(Array.isArray(mentor.expertise) ? mentor.expertise : [mentor.expertise]).map((e) => (
          <span
            key={e}
            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
          >
            {e}
          </span>
        ))}
      </div>

      {/* ------------------------ REQUEST BUTTON ------------------------ */}
      {requestStatus === "none" && (
        <button
          onClick={handleSendRequest}
          className="w-full py-3 bg-primary text-white rounded-md mt-6"
        >
          Send Request
        </button>
      )}

      {requestStatus === "pending" && (
        <button
          onClick={handleCancelRequest}
          className="w-full py-3 bg-yellow-500 text-white rounded-md mt-6"
        >
          Pending... (Cancel?)
        </button>
      )}

      {requestStatus === "accepted" && (
        <button
          disabled
          className="w-full py-3 bg-green-600 text-white rounded-md mt-6"
        >
          Accepted ✔
        </button>
      )}
    </div>
  );
}

export default MentorProfile;