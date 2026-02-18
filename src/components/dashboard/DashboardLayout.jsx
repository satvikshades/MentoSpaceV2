import { Outlet, Navigate, useLocation } from "react-router-dom";
import { BiMenu } from "react-icons/bi";
import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import BottomNav from "./components/BottomNav";

import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import MoodInsights from "./components/MoodInsights";

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  const [showMoodPopup, setShowMoodPopup] = useState(false);

  const location = useLocation();

  // AUTH LISTENER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setRole(null);
        setIsAuthLoaded(true);
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setRole(snap.data().role);

      setIsAuthLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  if (!isAuthLoaded) return <div className="p-10 text-center">Loading...</div>;
  if (!auth.currentUser) return <Navigate to="/login" replace />;

  // ROLE PROTECTION
  if (role === "student" && location.pathname === "/dashboard/sessions") {
    return <Navigate to="/dashboard/profile" replace />;
  }
  if (role === "mentor" && location.pathname === "/dashboard/find-mentor") {
    return <Navigate to="/dashboard/profile" replace />;
  }

  return (
    <div className="relative min-h-screen bg-[#f0f2f5]">

      {/* ------------ DESKTOP SIDEBAR ------------ */}
      <div className="hidden lg:block">
        <div className="fixed inset-y-0 left-0 bg-white w-64 h-screen shadow-lg z-30">
          <Sidebar role={role} />
        </div>
      </div>

      {/* ------------ MOBILE SLIDE SIDEBAR ------------ */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 bg-white w-64 shadow-xl z-40 
        transform transition-transform duration-300
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar role={role} closeSidebar={() => setIsSidebarOpen(false)} />
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* ------------ TOP BAR ------------ */}
      <header className="sticky top-0 right-0 bg-[#f0f2f5]/80 backdrop-blur-sm p-4 z-10 flex items-center justify-between">

        <button
          className="cursor-pointer text-gray-700 hover:text-primary"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <BiMenu className="h-8 w-8" />
        </button>

        {role && (
          <div className="px-4 py-1 bg-white/40 backdrop-blur-md border border-white/30 rounded-full shadow text-gray-800 font-semibold text-sm">
            {role === "student" ? "Student Dashboard" : "Mentor Dashboard"}
          </div>
        )}
      </header>

      {/* ------------ MAIN CONTENT ------------ */}
      <main className="p-4 lg:ml-64 pb-24">
        <Outlet />
      </main>

      {/* ------------ BOTTOM NAV ------------ */}
      <div className="lg:hidden">
        <BottomNav role={role} />
      </div>

      
    </div>
  );
}

export default DashboardLayout;