import React, { useState } from "react";
import { FaEnvelope, FaLock, FaGoogle } from "react-icons/fa";
import {
  auth,
  signInWithEmailAndPassword,
  googleProvider,
  signInWithPopup,
} from "../firebase";
import { Link, useNavigate } from "react-router-dom";

function Signin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (apiError) setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!formData.email || !formData.password) {
      setApiError("Email and password are required.");
      return;
    }

    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // ❌ No window.location.href (causes refresh)
      // ✅ Use navigate
      navigate("/dashboard/profile", { replace: true });

    } catch (error) {
      let message = "Login failed.";

      if (error.code === "auth/user-not-found") message = "User not found.";
      else if (error.code === "auth/wrong-password")
        message = "Incorrect password.";
      else if (error.code === "auth/invalid-email")
        message = "Invalid email format.";

      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setApiError("");
    setIsLoading(true);

    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard/profile", { replace: true });

    } catch (error) {
      setApiError("Google login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-poppins bg-bg-light-gray flex">
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center bg-gradient-to-br from-primary to-secondary text-white p-12 text-center">
        <h1 className="font-montserrat text-5xl font-bold leading-tight">
          Welcome Back
        </h1>
        <p className="mt-4 max-w-md text-lg opacity-90">
          Log in to reconnect with the community.
        </p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-6">
            <div>
              <h2 className="font-montserrat text-3xl font-bold text-gray-800">
                Log In
              </h2>
              <p className="text-gray-500 mt-2">
                Enter your details to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                id="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                icon={<FaEnvelope />}
              />

              <InputField
                id="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                icon={<FaLock />}
              />

              {apiError && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg text-center">
                  {apiError}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 font-bold text-white bg-gradient-to-r from-primary to-secondary rounded-lg"
              >
                {isLoading ? "Logging In..." : "Log In"}
              </button>
            </form>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-sm text-gray-400">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg"
            >
              <FaGoogle className="text-red-500" />
              Log In with Google
            </button>

            <p className="text-center text-sm text-gray-500 pt-2">
              Don’t have an account?
              <Link to="/register" className="font-semibold text-primary">
                {" "}Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const InputField = ({ id, type, placeholder, value, onChange, icon }) => (
  <div className="relative">
    <span className="absolute inset-y-0 left-0 flex items-center pl-4">
      {icon}
    </span>
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
      className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none"
    />
  </div>
);

export default Signin;