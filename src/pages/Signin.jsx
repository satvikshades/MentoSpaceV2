import React, { useState } from "react";
// Import icons from react-icons
import { FaEnvelope, FaLock, FaGoogle } from "react-icons/fa";

// This is a placeholder for a routing library component like react-router-dom's <Link>
const Link = ({ href, children, className }) => (
  <a href={href} className={className}>
    {children}
  </a>
);

function Signin() {
  // State to manage email and password inputs
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // State for API submission status and errors
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    // Clear previous API error when user starts typing
    if (apiError) setApiError("");
  };

  // Placeholder function for Google login
  const handleGoogleLogin = () => {
    alert("Google login functionality would be implemented here.");
    // This is where you would trigger the Google OAuth flow.
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(""); // Clear previous errors

    // Basic validation
    if (!formData.email || !formData.password) {
      setApiError("Email and password are required.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        // Store user info in local storage
        localStorage.setItem("userId", result.user_id);
        localStorage.setItem("userRole", result.role);

        // Redirect based on role
        // In a real React app, you'd use useNavigate() from react-router-dom
        if (result.role === "student") {
          window.location.href = "student-community.html";
        } else if (result.role === "mentor") {
          window.location.href = "mentor-community.html";
        }
      } else {
        setApiError(
          result.message || "Login failed. Please check your credentials."
        );
      }
    } catch (error) {
      console.error("Error during login:", error);
      setApiError("An error occurred. Please ensure the server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-poppins bg-bg-light-gray flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center bg-gradient-to-br from-primary to-secondary text-white p-12 text-center">
        <h1 className="font-montserrat text-5xl font-bold leading-tight">
          Welcome Back
        </h1>
        <p className="mt-4 max-w-md text-lg opacity-90">
          Log in to reconnect with the community and continue your journey of
          growth.
        </p>
        <div className="absolute bottom-10">
          <Link href="index.html" className="text-center group">
            <p className="font-montserrat text-3xl font-bold group-hover:text-gray-200 transition-colors">
              MentoSpace<span className="text-white">.</span>
            </p>
            <p className="text-sm opacity-90 tracking-wide">
              Building strong individuals
            </p>
          </Link>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-6">
            <div>
              <h2 className="font-montserrat text-3xl font-bold text-gray-800">
                Log In
              </h2>
              <p className="text-gray-500 mt-2">
                Enter your details to get back in.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input Fields */}
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 font-bold text-white bg-gradient-to-r from-primary to-secondary rounded-lg transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Logging In..." : "Log In"}
              </button>
            </form>

            {/* "OR" Divider */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-sm font-semibold text-gray-400">
                OR
              </span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg transform hover:bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <FaGoogle className="text-red-500" />
              Log In with Google
            </button>

            <p className="text-center text-sm text-gray-500 pt-2">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-primary hover:underline"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Input Field Component
const InputField = ({ id, type, placeholder, value, onChange, icon }) => (
  <div className="relative">
    <span className="absolute inset-y-0 left-0 flex items-center pl-4">
      {React.cloneElement(icon, { className: "h-5 w-5 text-gray-400" })}
    </span>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition duration-300"
      required
    />
  </div>
);

export default Signin;
