import React, { useState, useEffect, useRef } from "react";
// Import icons from react-icons
import { FaShieldAlt, FaRegClock } from "react-icons/fa";

// This is a placeholder for a routing library component
const Link = ({ href, children, className }) => (
  <a href={href} className={className}>
    {children}
  </a>
);

function OtpVerification() {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const inputRefs = useRef([]);

  // Effect to handle the countdown timer
  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false; // Ensure only numbers are entered

    // Update OTP state
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // On backspace, if input is empty, focus previous input
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResendOtp = () => {
    // Logic to resend OTP would go here...
    alert("A new OTP has been sent.");
    setTimer(60); // Reset timer
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const enteredOtp = otp.join("");

    if (enteredOtp.length < 6) {
      setApiError("Please enter the complete 6-digit OTP.");
      return;
    }

    setIsLoading(true);

    // --- API Call Simulation ---
    console.log("Verifying OTP:", enteredOtp);
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay

    // Example logic
    if (enteredOtp === "123456") {
      // Replace with actual API verification
      alert("OTP Verified Successfully!");
      // Redirect to dashboard or next page
      // window.location.href = '/dashboard';
    } else {
      setApiError("Invalid OTP. Please try again.");
    }
    // --- End of Simulation ---

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen font-poppins bg-bg-light-gray flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6 text-center">
        {/* Header Section */}
        <div>
          <FaShieldAlt className="h-12 w-12 text-primary mx-auto" />
          <h1 className="text-3xl font-bold font-montserrat text-gray-800 mt-4">
            OTP Verification
          </h1>
          <p className="text-gray-500 mt-2">
            Enter the 6-digit code sent to your email.
            {/* You can pass the user's email as a prop and display it here */}
            {/* <span className="font-semibold text-gray-700">user@example.com</span> */}
          </p>
        </div>

        {/* OTP Form */}
        <form onSubmit={handleSubmit}>
          {/* OTP Input Fields */}
          <div className="flex justify-center gap-2 sm:gap-4 my-8">
            {otp.map((data, index) => {
              return (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={data}
                  ref={(el) => (inputRefs.current[index] = el)}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-12 sm:w-14 sm:h-14 text-center text-2xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition duration-300"
                />
              );
            })}
          </div>

          {apiError && <p className="text-sm text-red-600 mb-4">{apiError}</p>}

          {/* Verify Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 font-bold text-white bg-gradient-to-r from-primary to-secondary rounded-lg transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Verifying..." : "Verify Account"}
          </button>
        </form>

        {/* Resend OTP Section */}
        <div className="text-sm text-gray-500 flex items-center justify-center gap-2">
          {timer > 0 ? (
            <>
              <FaRegClock className="text-gray-400" />
              <span>
                Resend OTP in <strong>{timer}s</strong>
              </span>
            </>
          ) : (
            <button
              type="button"
              onClick={handleResendOtp}
              className="font-semibold text-primary hover:underline"
            >
              Resend OTP
            </button>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 pt-4">
          Having trouble?{" "}
          <Link
            href="/support"
            className="font-semibold text-gray-500 hover:underline"
          >
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}

export default OtpVerification;
