import React, { useState, useEffect } from "react";
import { FaClock, FaSearch, FaTag, FaTrash } from "react-icons/fa";
import { FaCalendarDays, FaChalkboardUser, FaPlus } from "react-icons/fa6";
import { auth, db } from "../../../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";

function Sessions() {
  const user = auth.currentUser;

  const [sessions, setSessions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    title: "",
    category: "General",
    date: "",
    time: "",
  });

  // ---------------------------
  // Load mentor sessions
  // ---------------------------
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "sessions"),
      where("mentorId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setSessions(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [user]);

  // ---------------------------
  // Create session
  // ---------------------------
  const createSession = async () => {
    if (!form.title.trim() || !form.date || !form.time) {
      alert("Fill all fields");
      return;
    }

    await addDoc(collection(db, "sessions"), {
      ...form,
      mentorId: user.uid,
      mentorName: user.displayName || "Mentor",
      createdAt: Date.now(),
    });

    setForm({ title: "", category: "General", date: "", time: "" });
    setShowForm(false);
  };

  // ---------------------------
  // Delete session
  // ---------------------------
  const deleteSession = async (id) => {
    if (!window.confirm("Delete this session?")) return;
    await deleteDoc(doc(db, "sessions", id));
  };

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Sessions</h1>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:scale-105 transition"
        >
          <FaPlus /> Create Session
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white p-4 rounded-lg shadow space-y-3">
          <input
            placeholder="Session title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border p-2 rounded w-full"
          />

          <input
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="border p-2 rounded w-full"
          />

          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="border p-2 rounded w-full"
          />

          <input
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            className="border p-2 rounded w-full"
          />

          <button
            onClick={createSession}
            className="bg-primary text-white px-4 py-2 rounded hover:scale-105 transition"
          >
            Save Session
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative w-full md:w-72">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <FaSearch />
        </span>
        <input
          placeholder="Search sessions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 p-2 border rounded w-full"
        />
      </div>

      {/* Sessions grid */}
      {filteredSessions.length === 0 ? (
        <p>No sessions created yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition"
            >
              <p className="flex items-center gap-2 text-sm text-gray-600">
                <FaTag /> {session.category}
              </p>

              <h3 className="text-xl font-bold mt-2">{session.title}</h3>

              <p className="flex items-center gap-2 mt-2">
                <FaChalkboardUser /> {session.mentorName}
              </p>

              <p className="flex items-center gap-2">
                <FaCalendarDays /> {session.date}
              </p>

              <p className="flex items-center gap-2">
                <FaClock /> {session.time}
              </p>

              <button
                onClick={() => deleteSession(session.id)}
                className="mt-4 bg-red-500 text-white px-3 py-2 rounded flex items-center gap-2 hover:bg-red-600"
              >
                <FaTrash /> Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Sessions;