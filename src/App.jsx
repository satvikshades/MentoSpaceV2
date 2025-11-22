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
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard/profile" element={<MyProfile />} />
          <Route path="/dashboard/settings" element={<Setting />} />
          <Route path="/dashboard/sessions" element={<Sessions />} />
          <Route path="/dashboard/find-mentor" element={<FindMentor />} />
        </Route>
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </>
  );
}

export default App;
