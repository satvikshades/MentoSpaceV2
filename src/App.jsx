import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Registration from "./pages/Registration";
import Signin from "./pages/Signin";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ErrorPage from "./pages/Error";
import Privacy from "./pages/Privacy";
import { Spinner } from "./components/ui";

// The dashboard is loaded on demand so the landing page stays fast.
const DashboardLayout = lazy(() => import("./components/dashboard/DashboardLayout"));
const Today = lazy(() => import("./components/dashboard/components/Today"));
const Habits = lazy(() => import("./components/dashboard/components/Habits"));
const MoodInsights = lazy(() => import("./components/dashboard/components/MoodInsights"));
const MentorInsights = lazy(() => import("./components/dashboard/components/MentorInsights"));
const MyProfile = lazy(() => import("./components/dashboard/components/MyProfile"));
const Setting = lazy(() => import("./components/dashboard/components/Setting"));
const Sessions = lazy(() => import("./components/dashboard/components/Sessions"));
const FindMentor = lazy(() => import("./components/dashboard/components/FindMentor"));
const MyStudents = lazy(() => import("./components/dashboard/components/MyStudents"));
const Chats = lazy(() => import("./components/dashboard/components/Chats"));
const ChatRoom = lazy(() => import("./components/dashboard/components/ChatRoom"));
const MentorProfile = lazy(() => import("./pages/MentorProfile"));

function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-primary">
      <Spinner className="h-6 w-6" />
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Signin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/verify-otp" element={<Navigate to="/login" replace />} />

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Today />} />
          <Route path="/dashboard/habits" element={<Habits />} />
          <Route path="/dashboard/mood" element={<MoodInsights />} />
          <Route path="/dashboard/profile" element={<MyProfile />} />
          <Route path="/dashboard/settings" element={<Setting />} />
          <Route path="/dashboard/sessions" element={<Sessions />} />
          <Route path="/dashboard/find-mentor" element={<FindMentor />} />
          <Route path="/dashboard/my-students" element={<MyStudents />} />
          <Route path="/dashboard/insights/:studentId" element={<MentorInsights />} />
          <Route path="/dashboard/chats" element={<Chats />} />
          <Route path="/dashboard/chat/:chatId" element={<ChatRoom />} />
          <Route path="/mentor/:id" element={<MentorProfile />} />
        </Route>

        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
