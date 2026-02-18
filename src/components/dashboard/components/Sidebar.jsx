// Sidebar.jsx
import { Link, NavLink } from "react-router-dom";
import { 
  FaHouse, 
  FaClock, 
  FaGear, 
  FaUser, 
  FaUsers, 
  FaBook 
} from "react-icons/fa6";
import { FaCommentDots } from "react-icons/fa"; // Comes only from FA5
import { BiLogOut } from "react-icons/bi";
import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

function Sidebar({ role }) {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    async function load() {
      if (!auth.currentUser) return;
      const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (snap.exists()) setUserData(snap.data());
    }
    load();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="flex flex-col h-full p-4">
      <Link to="/" className="mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          MentoSpace<span className="text-secondary">.</span>
        </h2>
      </Link>

      <nav className="flex-grow">
        <ul className="space-y-2">

          {/* My Profile */}
          <li>
            <NavLink
              to="/dashboard/profile"
              className={({ isActive }) =>
                isActive
                  ? "block p-3 rounded bg-primary/10 text-primary"
                  : "block p-3 rounded hover:bg-gray-100"
              }
            >
              <FaHouse className="inline mr-2" /> My Profile
            </NavLink>
          </li>

          {/* Student Only → Find Mentor */}
          {role === "student" && (
            <li>
              <NavLink
                to="/dashboard/find-mentor"
                className={({ isActive }) =>
                  isActive
                    ? "block p-3 rounded bg-primary/10 text-primary"
                    : "block p-3 rounded hover:bg-gray-100"
                }
              >
                🔎 Find Mentor
              </NavLink>
            </li>
          )}

          {/* Mentor Only → Sessions + My Students */}
          {role === "mentor" && (
            <>
              <li>
                <NavLink
                  to="/dashboard/sessions"
                  className={({ isActive }) =>
                    isActive
                      ? "block p-3 rounded bg-primary/10 text-primary"
                      : "block p-3 rounded hover:bg-gray-100"
                  }
                >
                  <FaClock className="inline mr-2" /> Sessions
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/dashboard/my-students"
                  className={({ isActive }) =>
                    isActive
                      ? "block p-3 rounded bg-primary/10 text-primary"
                      : "block p-3 rounded hover:bg-gray-100"
                  }
                >
                  <FaUsers className="inline mr-2" /> My Students
                </NavLink>
              </li>
            </>
          )}

          {/* Chats */}
          <li>
            <NavLink
              to="/dashboard/chats"
              className={({ isActive }) =>
                isActive
                  ? "block p-3 rounded bg-primary/10 text-primary"
                  : "block p-3 rounded hover:bg-gray-100"
              }
            >
              <FaCommentDots className="inline mr-2" /> Chats
            </NavLink>
          </li>

          {/* Settings */}
          <li>
            <NavLink
              to="/dashboard/settings"
              className={({ isActive }) =>
                isActive
                  ? "block p-3 rounded bg-primary/10 text-primary"
                  : "block p-3 rounded hover:bg-gray-100"
              }
            >
              <FaGear className="inline mr-2" /> Settings
            </NavLink>
          </li>

        </ul>
      </nav>

      {/* Bottom Profile Display */}
      <div className="mt-auto">
        {userData && (
          <div className="flex items-center gap-3 p-3 mt-3 bg-gray-100 rounded-lg">
            <img
              src={
                userData.profilePic ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  userData.name
                )}`
              }
              alt="profile"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="font-semibold">{userData.name}</div>
              <div className="text-sm text-gray-500">{userData.role}</div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full mt-3 p-3 bg-red-100 text-red-600 rounded-lg"
        >
          <BiLogOut /> Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;