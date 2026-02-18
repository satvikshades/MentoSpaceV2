import React, { useState } from "react";
// Import icons from react-icons
import { FaEnvelope, FaKey } from "react-icons/fa";

// This is a placeholder for a routing library component like react-router-dom's <Link>
const Link = ({ href, children, className }) => (
  <a href={href} className={className}>
    {children}
  </a>
);

function ForgotPassword() {
  // State to manage the email input
  const [email, setEmail] = useState("");

  // State for API submission status and messages
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    // Clear previous messages when user starts typing
    if (apiError) setApiError("");
    if (apiSuccess) setApiSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setApiSuccess("");

    // Basic validation
    if (!email) {
      setApiError("Please enter your email address.");
      return;
    }

    setIsLoading(true);

    // --- API Call Simulation ---
    console.log("Sending password reset link to:", email);
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay

    // Example logic: In a real app, you'd check if the email exists
    if (email === "error@example.com") {
      setApiError("No account found with this email address.");
    } else {
      setApiSuccess(
        `A password reset link has been sent to ${email}. Please check your inbox.`
      );
    }
    // --- End of Simulation ---

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen font-poppins bg-bg-light-gray flex">
      {/* Left Panel - Branding (Consistent with other pages) */}
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center bg-gradient-to-br from-primary to-secondary text-white p-12 text-center">
        <h1 className="font-montserrat text-5xl font-bold leading-tight">
          Can't Remember?
        </h1>
        <p className="mt-4 max-w-md text-lg opacity-90">
          No worries. We'll help you get back into your account in no time.
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
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Header Section */}
          <div className="text-center">
            <FaKey className="h-10 w-10 text-primary mx-auto" />
            <h2 className="font-montserrat text-3xl font-bold text-gray-800 mt-4">
              Forgot Password
            </h2>
            <p className="text-gray-500 mt-2">
              Enter your email to receive a reset link.
            </p>
          </div>

          {/* Display success message and hide form */}
          {apiSuccess ? (
            <div className="text-center p-4 bg-green-50 text-green-700 rounded-lg">
              <p className="font-semibold">Check Your Email</p>
              <p className="text-sm mt-1">{apiSuccess}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input Field */}
              <InputField
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={handleInputChange}
                icon={<FaEnvelope />}
              />

              {/* Display API error message */}
              {apiError && (
                <p className="text-sm text-red-600 text-center">{apiError}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 font-bold text-white bg-gradient-to-r from-primary to-secondary rounded-lg transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? "Sending Link..." : "Send Reset Link"}
              </button>
            </form>
          )}

          {/* Back to Login Link */}
          <p className="text-center text-sm text-gray-500 pt-2">
            <Link
              href="login.html"
              className="font-semibold text-primary hover:underline"
            >
              &larr; Back to Login
            </Link>
          </p>
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

export default ForgotPassword;
