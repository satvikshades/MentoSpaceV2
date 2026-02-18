import React from "react";
import { Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Registration from "./pages/Registration";
import Signin from "./pages/Signin";
import OtpVerification from "./pages/OTP";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ErrorPage from "./pages/Error";

import DashboardLayout from "./components/dashboard/DashboardLayout";
import MyProfile from "./components/dashboard/components/MyProfile";
import Setting from "./components/dashboard/components/Setting";
import Sessions from "./components/dashboard/components/Sessions";
import FindMentor from "./components/dashboard/components/FindMentor";

import MentorProfile from "./pages/MentorProfile";
import MyStudents from "./components/dashboard/components/MyStudents";

// 🔥 IMPORTANT → you forgot these imports
import Chats from "./components/dashboard/components/Chats";
import ChatRoom from "./components/dashboard/components/ChatRoom";
import MentorInsights from "./components/dashboard/components/MentorInsights";
import MoodInsights from "./components/dashboard/components/MoodInsights";

import Habits from "./components/dashboard/components/Habits";



function App() {
  return (
    <>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Signin />} />
        <Route path="/verify-otp" element={<OtpVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Mentor Public Profile */}
        <Route path="/mentor/:id" element={<MentorProfile />} />

        {/* Dashboard Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard/insights/:studentId" element={<MoodInsights />} />

          <Route path="/dashboard/profile" element={<MyProfile />} />
          <Route path="/dashboard/settings" element={<Setting />} />
          <Route path="/dashboard/sessions" element={<Sessions />} />
          <Route path="/dashboard/find-mentor" element={<FindMentor />} />

          <Route path="/dashboard/my-students" element={<MyStudents />} />

          {/* Chats */}
          <Route path="/dashboard/chats" element={<Chats />} />
          <Route path="/dashboard/chat/:chatId" element={<ChatRoom />} />
          <Route path="/dashboard/habits" element={<Habits />} />
          <Route path="/dashboard/insights/:studentId" element={<MentorInsights />} />

        </Route>

        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </>
  );
}

export default App;