import React, { useState } from "react";
// Import icons from react-icons
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";

// This is a placeholder for a routing library component
const Link = ({ href, children, className }) => (
  <a href={href} className={className}>
    {children}
  </a>
);

function ResetPassword() {
  // State for password inputs
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State for validation and API submission
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiSuccess, setApiSuccess] = useState(false); // Use boolean to switch views

  const validateForm = () => {
    const newErrors = {};
    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    } else if (!specialCharRegex.test(password)) {
      newErrors.password = "Password must contain a special character.";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    // In a real app, you would also send the reset token from the URL
    console.log("Submitting new password...");
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay

    // On successful API call:
    setApiSuccess(true);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen font-poppins bg-bg-light-gray flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center bg-gradient-to-br from-primary to-secondary text-white p-12 text-center">
        <h1 className="font-montserrat text-5xl font-bold leading-tight">
          Secure Your Account
        </h1>
        <p className="mt-4 max-w-md text-lg opacity-90">
          Choose a strong, new password to keep your account safe.
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
          {apiSuccess ? (
            // Success View
            <div className="text-center space-y-4">
              <FaCheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="font-montserrat text-2xl font-bold text-gray-800">
                Password Reset!
              </h2>
              <p className="text-gray-600">
                Your password has been changed successfully. You can now log in
                with your new password.
              </p>
              <Link
                href="login.html"
                className="inline-block w-full py-3 px-4 font-bold text-white bg-gradient-to-r from-primary to-secondary rounded-lg transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Proceed to Login
              </Link>
            </div>
          ) : (
            // Form View
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="font-montserrat text-3xl font-bold text-gray-800">
                  Create New Password
                </h2>
                <p className="text-gray-500 mt-2">
                  Your new password must be different from previous ones.
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <PasswordField
                  id="password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  showPassword={showPassword}
                  onToggleShowPassword={() => setShowPassword(!showPassword)}
                  error={errors.password}
                />
                <PasswordField
                  id="confirmPassword"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  showPassword={showConfirmPassword}
                  onToggleShowPassword={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  error={errors.confirmPassword}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 font-bold text-white bg-gradient-to-r from-primary to-secondary rounded-lg transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Reusable Password Field Component with Visibility Toggle
const PasswordField = ({
  id,
  placeholder,
  value,
  onChange,
  showPassword,
  onToggleShowPassword,
  error,
}) => (
  <div>
    <div className="relative">
      <span className="absolute inset-y-0 left-0 flex items-center pl-4">
        <FaLock className="h-5 w-5 text-gray-400" />
      </span>
      <input
        type={showPassword ? "text" : "password"}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full pl-12 pr-12 py-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition duration-300 ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-primary"
        }`}
      />
      <button
        type="button"
        onClick={onToggleShowPassword}
        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-primary"
      >
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
    {error && <p className="text-red-600 text-xs mt-1 ml-1">{error}</p>}
  </div>
);

export default ResetPassword;
