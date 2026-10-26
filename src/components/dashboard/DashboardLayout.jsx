import { useEffect, useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { auth, db } from "../../firebase";
import Sidebar from "./components/Sidebar";
import BottomNav from "./components/BottomNav";
import { Avatar, Spinner } from "../ui";
import ConsentGate from "./components/ConsentGate";
import { needsConsent } from "../../lib/consent";

const STUDENT_ONLY = ["/dashboard/find-mentor", "/dashboard/habits", "/dashboard/mood"];
const MENTOR_ONLY = ["/dashboard/my-students", "/dashboard/insights"];

function DashboardLayout() {
  const [user, setUser] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [pending, setPending] = useState(0);
  const location = useLocation();

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        setProfile(snap.exists() ? { id: u.uid, ...snap.data() } : { id: u.uid, name: u.displayName, email: u.email, missing: true });
      } catch (err) {
        console.error(err);
        setProfile({ id: u.uid, name: u.displayName, email: u.email, missing: true });
      }
      setUser(u);
    });
  }, []);

  // live count of pending mentee requests for mentors
  useEffect(() => {
    if (!user || profile?.role !== "mentor") return;
    const q = query(collection(db, "requests"), where("mentorId", "==", user.uid));
    return onSnapshot(q, (s) => setPending(s.docs.filter((d) => d.data().status === "pending").length));
  }, [user, profile?.role]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (user === undefined || (user && !profile)) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg-light-gray text-primary">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  if (needsConsent(profile)) {
    return <ConsentGate user={user} profile={profile.missing ? null : profile} onDone={(p) => setProfile({ id: user.uid, ...p })} />;
  }

  const role = profile.role;
  const path = location.pathname;
  if (role === "mentor" && STUDENT_ONLY.some((p) => path.startsWith(p))) return <Navigate to="/dashboard" replace />;
  if (role !== "mentor" && (MENTOR_ONLY.some((p) => path.startsWith(p)))) return <Navigate to="/dashboard" replace />;

  const ctx = { user, profile, setProfile, role, pending };

  return (
    <div className="min-h-screen bg-bg-light-gray">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-white lg:block">
        <Sidebar role={role} profile={profile} pending={pending} />
      </aside>

      {/* mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line/70 bg-white/85 px-4 py-3 backdrop-blur-md lg:hidden">
        <Link to="/dashboard" className="wordmark text-xl">
          MentoSpace<span className="text-secondary">.</span>
        </Link>
        <Link to="/dashboard/profile" aria-label="Your profile">
          <Avatar person={profile} size={34} />
        </Link>
      </header>

      <main className="px-4 pb-28 pt-6 sm:px-6 lg:ml-64 lg:px-10 lg:pb-12 lg:pt-10">
        <div className="mx-auto max-w-6xl">
          {role === "mentor" && profile.mentorStatus === "pending" && (
            <div className="mb-6 rounded-2xl bg-amber-50 px-5 py-4 text-sm text-amber-900 ring-1 ring-amber-200">
              <b>Your mentor profile is being reviewed.</b> Students can't find you yet. We'll check your details and may
              contact you at {profile.email}. Meanwhile, make sure your bio is complete.
            </div>
          )}
          {profile.ageGroup === "minor" && profile.guardianStatus === "pending" && (
            <div className="mb-6 rounded-2xl bg-primary-50 px-5 py-4 text-sm text-primary ring-1 ring-primary/20">
              We'll contact your parent or guardian to confirm their consent. You can keep using MentoSpace in the meantime.
            </div>
          )}
          <Outlet context={ctx} />
        </div>
      </main>

      <BottomNav role={role} pending={pending} />
    </div>
  );
}

export default DashboardLayout;
