import React, { useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaGraduationCap,
  FaBriefcase,
} from "react-icons/fa";

import {
  auth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  googleProvider,
  signInWithPopup,
  createUserDoc,
} from "../firebase";

import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

import InputField from "../components/common/InputField";
import { FaGoogle } from "react-icons/fa";
import RoleRadioButton from "../components/RoleRadioButton";

import { Link } from "react-router-dom"; // 🔥 FIXED

function Registration() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    expertise: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleRoleChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, role: value, expertise: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    const { name, email, password, confirmPassword, role, expertise } = formData;

    if (!name) newErrors.name = "Name is required.";

    const emailRegex = /^[^\s@]+@(gmail|hotmail|yahoo)\.com$/;
    if (!email) newErrors.email = "Email is required.";
    else if (!emailRegex.test(email))
      newErrors.email = "Please use Gmail, Hotmail, or Yahoo.";

    const specialCharRegex = /[!@#$%^&*]/;
    if (!password) newErrors.password = "Password is required.";
    else if (password.length < 8)
      newErrors.password = "Password must be at least 8 characters.";
    else if (!specialCharRegex.test(password))
      newErrors.password = "Password must contain a special character.";

    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";

    if (role === "mentor" && !expertise)
      newErrors.expertise = "Please select your expertise.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🔥 FIREBASE REGISTRATION
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      if (formData.name) {
        await updateProfile(cred.user, { displayName: formData.name });
      }

      await createUserDoc(cred.user.uid, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        expertise: formData.expertise || "",
      });

      localStorage.setItem("ms_user_role", formData.role);

      await sendEmailVerification(cred.user);

      alert("Registration successful! Please verify your email.");

      window.location.href = "/login"; // 🔥 FIXED ROUTE
      return;
    } catch (err) {
      console.error("Registration error:", err);
      setApiError(err.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 GOOGLE REGISTER
  const handleGoogleRegister = async () => {
    setApiError("");
    setIsLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        await createUserDoc(user.uid, {
          name: user.displayName || "",
          email: user.email,
          role: "student",
          expertise: "",
        });
      }

      window.location.href = "/dashboard/profile"; // 🔥 FIXED
    } catch (err) {
      console.error(err);
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-poppins bg-bg-light-gray flex">
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center bg-gradient-to-br from-primary to-secondary text-white p-12 text-center">
        <h1 className="font-montserrat text-5xl font-bold leading-tight">
          Forge Your Future
        </h1>
        <p className="mt-4 max-w-md text-lg opacity-90">
          Connect with mentors and build your path with confidence.
        </p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <h2 className="font-montserrat text-3xl font-bold text-gray-800">
            Create an Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              id="name"
              name="name"
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={handleInputChange}
              error={errors.name}
              icon={<FaUser />}
            />
            <InputField
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              icon={<FaEnvelope />}
            />
            <InputField
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              icon={<FaLock />}
            />
            <InputField
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={errors.confirmPassword}
              icon={<FaLock />}
            />

            <div>
              <p className="text-gray-700 mb-2">I am signing up as:</p>
              <div className="flex gap-4">
                <RoleRadioButton
                  id="role-student"
                  name="role"
                  value="student"
                  checked={formData.role === "student"}
                  onChange={handleRoleChange}
                  label="Student"
                  icon={<FaGraduationCap />}
                />
                <RoleRadioButton
                  id="role-mentor"
                  name="role"
                  value="mentor"
                  checked={formData.role === "mentor"}
                  onChange={handleRoleChange}
                  label="Mentor"
                  icon={<FaBriefcase />}
                />
              </div>
            </div>

            {formData.role === "mentor" && (
              <InputField
                id="expertise"
                name="expertise"
                as="select"
                value={formData.expertise}
                onChange={handleInputChange}
                error={errors.expertise}
                icon={<FaGraduationCap />}
              >
                <option value="" disabled>Select your expertise</option>
                <option value="personal">Personal Development</option>
                <option value="spiritual">Spiritual Growth</option>
                <option value="career">Career & Business</option>
                <option value="educational">Educational Guidance</option>
              </InputField>
            )}

            {apiError && (
              <p className="text-red-600 bg-red-50 p-3 rounded-lg">
                {apiError}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-lg"
            >
              {isLoading ? "Registering..." : "Register"}
            </button>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-semibold"> {/* 🔥 FIXED */}
                Login here
              </Link>
            </p>
          </form>

          <div className="flex items-center">
            <div className="flex-grow border-t" />
            <span className="px-2 text-gray-400">OR</span>
            <div className="flex-grow border-t" />
          </div>

          <button
            onClick={handleGoogleRegister}
            className="w-full flex gap-2 items-center justify-center py-3 border rounded-lg"
          >
            <FaGoogle className="text-red-500" />
            Register with Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default Registration;
