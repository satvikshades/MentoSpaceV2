import React, { useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaGraduationCap,
  FaBriefcase,
} from "react-icons/fa";
import InputField from "../components/common/InputField";
import { FaGoogle } from "react-icons/fa";
import RoleRadioButton from "../components/RoleRadioButton";

// This would typically come from react-router-dom in a real app
const Link = ({ href, children, className }) => (
  <a href={href} className={className}>
    {children}
  </a>
);

function Registration() {
  // State for all form inputs
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student", // Default role
    expertise: "",
  });

  // State for validation errors
  const [errors, setErrors] = useState({});
  // State for API submission
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error when user starts typing
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
    const { name, email, password, confirmPassword, role, expertise } =
      formData;

    if (!name) newErrors.name = "Name is required.";

    const emailRegex = /^[^\s@]+@(gmail|hotmail|yahoo)\.com$/;
    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please use a Gmail, Hotmail, or Yahoo email.";
    }

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

    if (role === "mentor" && !expertise) {
      newErrors.expertise = "Please select your area of expertise.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };

    if (userData.role === "mentor") {
      userData.expertise = formData.expertise;
    }

    // API Call
  };

  async function handleGoogleRegister() {}

  return (
    <div className="min-h-screen font-poppins bg-bg-light-gray flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center bg-gradient-to-br from-primary to-secondary text-white p-12 text-center">
        <h1 className="font-montserrat text-5xl font-bold leading-tight">
          Forge Your Future
        </h1>
        <p className="mt-4 max-w-md text-lg opacity-90">
          Connect with mentors who can guide your path or share your expertise
          to inspire the next generation. Join the MentoSpace community today!
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
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div>
            <h2 className="font-montserrat text-3xl font-bold text-gray-800">
              Create an Account
            </h2>
            <p className="text-gray-500 mt-2">
              Sign up to get started with MentoSpace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 2: Replace Heroicons with react-icons components */}
            <InputField
              id="name"
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={handleInputChange}
              error={errors.name}
              icon={<FaUser />}
            />
            <InputField
              id="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              icon={<FaEnvelope />}
            />
            <InputField
              id="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              icon={<FaLock />}
            />
            <InputField
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={errors.confirmPassword}
              icon={<FaLock />}
            />

            {/* Role Selection */}
            <div className="pt-2">
              <p className="block text-sm font-medium text-gray-700 mb-2">
                I am signing up as a:
              </p>
              <div className="flex items-center gap-4">
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

            {/* Conditional Mentor Expertise Field */}
            {formData.role === "mentor" && (
              <div className="transition-all duration-500">
                <InputField
                  id="expertise"
                  as="select"
                  value={formData.expertise}
                  onChange={handleInputChange}
                  error={errors.expertise}
                  icon={<FaGraduationCap />}
                >
                  <option value="" disabled>
                    Select your expertise
                  </option>
                  <option value="personal">Personal Development</option>
                  <option value="spiritual">Spiritual Growth</option>
                  <option value="career">Career & Business</option>
                  <option value="educational">Educational Guidance</option>
                </InputField>
              </div>
            )}

            {apiError && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {apiError}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 font-bold text-white bg-gradient-to-r from-primary to-secondary rounded-lg transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Registering..." : "Register"}
            </button>

            <p className="text-center text-sm text-gray-500 pt-2">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-primary hover:underline"
              >
                Login here
              </Link>
            </p>
          </form>
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-sm font-semibold text-gray-400">
              OR
            </span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Google Registration Button */}
          <button
            type="button"
            onClick={handleGoogleRegister}
            className="cursor-pointer w-full flex items-center justify-center gap-3 py-2.5 px-4 font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg transform hover:bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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
