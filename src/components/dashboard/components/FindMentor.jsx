import { useState, useEffect, useMemo } from "react";
import { FaSearch, FaStar, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { db, auth } from "../../../firebase";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  getDoc,
} from "firebase/firestore";

const StarRating = ({ rating }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? "text-yellow-400" : "text-gray-300"}
      />
    ))}
  </div>
);

function FindMentor() {
  const navigate = useNavigate();

  const [allMentors, setAllMentors] = useState([]);
  const [requests, setRequests] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState("All");

  const currentUser = auth.currentUser;

  // -------------------------------------------------------
  // LOAD MENTORS
  // -------------------------------------------------------
  useEffect(() => {
    async function fetchMentors() {
      const ref = collection(db, "users");
      const snap = await getDocs(ref);

      const mentors = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((u) => u.role === "mentor");

      setAllMentors(mentors);
    }
    fetchMentors();
  }, []);

  // -------------------------------------------------------
  // LOAD EXISTING REQUESTS
  // -------------------------------------------------------
  useEffect(() => {
    if (!currentUser) return;

    async function loadRequests() {
      const q = query(
        collection(db, "requests"),
        where("studentId", "==", currentUser.uid)
      );

      const snap = await getDocs(q);

      const reqMap = {};
      snap.docs.forEach((d) => {
        reqMap[d.data().mentorId] = {
          status: d.data().status,
          id: d.id,
        };
      });

      setRequests(reqMap);
    }

    loadRequests();
  }, [currentUser]);

  // -------------------------------------------------------
  // FILTER OPTIONS
  // -------------------------------------------------------
  const allExpertiseAreas = useMemo(() => {
    const areas = [];

    allMentors.forEach((m) => {
      if (m.expertise) {
        if (Array.isArray(m.expertise)) areas.push(...m.expertise);
        else areas.push(m.expertise);
      }
    });

    return ["All", ...new Set(areas)];
  }, [allMentors]);

  const filteredMentors = useMemo(() => {
    return allMentors
      .filter((mentor) =>
        mentor.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((mentor) =>
        selectedExpertise === "All"
          ? true
          : Array.isArray(mentor.expertise)
          ? mentor.expertise.includes(selectedExpertise)
          : mentor.expertise === selectedExpertise
      );
  }, [allMentors, searchTerm, selectedExpertise]);

  // -------------------------------------------------------
  // SEND REQUEST
  // -------------------------------------------------------
  const sendRequest = async (mentorId) => {
    if (!currentUser) return alert("Please login first!");

    if (requests[mentorId])
      return alert("Already requested!");

    await addDoc(collection(db, "requests"), {
      studentId: currentUser.uid,
      mentorId,
      status: "pending",
      createdAt: new Date(),
    });

    setRequests((p) => ({
      ...p,
      [mentorId]: { status: "pending" },
    }));
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
        <h1 className="text-3xl font-bold text-gray-800">Find Your Mentor</h1>
        <p className="text-gray-600">Connect with personal mentors.</p>

        {/* SEARCH + FILTER */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Search by mentor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <select
            value={selectedExpertise}
            onChange={(e) => setSelectedExpertise(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:ring-primary/50 cursor-pointer"
          >
            {allExpertiseAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* MENTOR CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.map((mentor) => {
          const req = requests[mentor.id];

          return (
            <div
              key={mentor.id}
              className="bg-white rounded-lg shadow-md p-5 flex flex-col items-center text-center hover:shadow-xl transition-all"
            >
              <img
                src={
                  mentor.profilePic ||
                  `https://ui-avatars.com/api/?name=${mentor.name}`
                }
                className="w-28 h-28 rounded-full border-4 border-gray-200 mb-3"
              />

              <h3 className="text-xl font-bold flex items-center gap-2">
                {mentor.name}
                <FaCheckCircle className="text-blue-500" />
              </h3>

              <StarRating rating={mentor.rating || 4} />

              <div className="flex flex-wrap justify-center gap-2 my-3">
                {(Array.isArray(mentor.expertise)
                  ? mentor.expertise
                  : [mentor.expertise]
                ).map((e) => (
                  <span
                    key={e}
                    className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full"
                  >
                    {e}
                  </span>
                ))}
              </div>

              <p className="text-gray-600 text-sm mb-4">
                {mentor.bio || "No bio added yet"}
              </p>

              {/* BUTTONS */}
              <div className="w-full space-y-2">
                <button
                  onClick={() => navigate(`/mentor/${mentor.id}`)}
                  className="w-full py-2 bg-primary text-white rounded-lg"
                >
                  View Profile
                </button>

                {req?.status === "pending" ? (
                  <button
                    disabled
                    className="w-full py-2 bg-yellow-500 text-white rounded-lg"
                  >
                    Pending...
                  </button>
                ) : req?.status === "accepted" ? (
                  <button
                    disabled
                    className="w-full py-2 bg-green-600 text-white rounded-lg"
                  >
                    Accepted ✔
                  </button>
                ) : (
                  <button
                    onClick={() => sendRequest(mentor.id)}
                    className="w-full py-2 bg-violet-600 text-white rounded-lg"
                  >
                    Send Request
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FindMentor;