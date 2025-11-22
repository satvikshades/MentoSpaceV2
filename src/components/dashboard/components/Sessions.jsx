import React, { useState, useMemo } from "react";
import { FaClock, FaSearch, FaTag } from "react-icons/fa";
import { FaCalendarDays, FaChalkboardUser } from "react-icons/fa6";

// In a real application, this data would come from an API.
const allSessions = [
  {
    id: 1,
    title: "Advanced React Hooks",
    mentor: "Kakashi Hatake",
    date: "2025-10-20",
    time: "02:00 PM IST",
    category: "Frontend",
    status: "Upcoming",
  },
  {
    id: 2,
    title: "Building Scalable APIs with Node.js",
    mentor: "Jiraiya Sensei",
    date: "2025-10-22",
    time: "04:00 PM IST",
    category: "Backend",
    status: "Upcoming",
  },
  {
    id: 3,
    title: "UI/UX Design Fundamentals",
    mentor: "Sakura Haruno",
    date: "2025-10-15",
    time: "11:00 AM IST",
    category: "Design",
    status: "Upcoming",
  },
  {
    id: 4,
    title: "Introduction to Docker and Kubernetes",
    mentor: "Minato Namikaze",
    date: "2025-09-30",
    time: "01:00 PM IST",
    category: "DevOps",
    status: "Completed",
  },
  {
    id: 5,
    title: "State Management with Redux Toolkit",
    mentor: "Kakashi Hatake",
    date: "2025-10-25",
    time: "03:00 PM IST",
    category: "Frontend",
    status: "Upcoming",
  },
  {
    id: 6,
    title: "Database Design with PostgreSQL",
    mentor: "Itachi Uchiha",
    date: "2025-10-28",
    time: "12:00 PM IST",
    category: "Backend",
    status: "Upcoming",
  },
  {
    id: 7,
    title: "Live Q&A: DevOps Best Practices",
    mentor: "Minato Namikaze",
    date: "2025-10-13",
    time: "11:00 AM IST",
    category: "DevOps",
    status: "Live",
  },
];

// Dynamically get unique categories from the session data
const categories = ["All", ...new Set(allSessions.map((s) => s.category))];

// --- Helper Functions ---
const getStatusBadgeClass = (status) => {
  switch (status) {
    case "Upcoming":
      return "bg-blue-100 text-blue-800";
    case "Live":
      return "bg-red-100 text-red-800 animate-pulse";
    case "Completed":
      return "bg-gray-200 text-gray-700";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

function Sessions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredSessions = useMemo(() => {
    return allSessions
      .filter((session) =>
        session.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((session) =>
        selectedCategory === "All"
          ? true
          : session.category === selectedCategory
      );
  }, [searchTerm, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* --- Header and Filters --- */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Explore Sessions</h1>
          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
            />
          </div>
        </div>
        {/* Category Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 cursor-pointer ${
                selectedCategory === category
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* --- Sessions Grid --- */}
      {filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col"
            >
              <div className="p-5 flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <p className="flex items-center gap-2 text-sm text-gray-600">
                    <FaTag className="text-primary/70" /> {session.category}
                  </p>
                  <span
                    className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                      session.status
                    )}`}
                  >
                    {session.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {session.title}
                </h3>
                <div className="text-gray-600 space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <FaChalkboardUser /> <span>{session.mentor}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <FaCalendarDays /> <span>{session.date}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <FaClock /> <span>{session.time}</span>
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 mt-auto">
                <button
                  className="w-full py-2 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors duration-300 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={session.status === "Completed"}
                >
                  {session.status === "Completed"
                    ? "View Recording"
                    : "Register Now"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">
            No Sessions Found
          </h2>
          <p className="text-gray-500 mt-2">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
}

export default Sessions;
