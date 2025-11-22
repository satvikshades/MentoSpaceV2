import React from "react";
// Import icons from react-icons
import { FaHome, FaUnlink, FaServer } from "react-icons/fa";

// This is a placeholder for a routing library component like react-router-dom's <Link>
const Link = ({ href, children, className }) => (
  <a href={href} className={className}>
    {children}
  </a>
);

// A mapping of error codes to relevant icons
const errorIcons = {
  404: <FaUnlink className="h-16 w-16 sm:h-20 sm:w-20 text-primary" />,
  500: <FaServer className="h-16 w-16 sm:h-20 sm:w-20 text-primary" />,
  default: <FaUnlink className="h-16 w-16 sm:h-20 sm:w-20 text-primary" />,
};

/**
 * A reusable error page component.
 * @param {object} props - The component props.
 * @param {string} [props.errorCode='404'] - The HTTP error code to display.
 * @param {string} [props.title='Page Not Found'] - The main title of the error message.
 * @param {string} [props.message='The page you are looking for might have been moved, deleted, or is temporarily unavailable.'] - The descriptive message for the user.
 */
function ErrorPage({
  errorCode = "404",
  title = "Page Not Found",
  message = "The page you are looking for might have been moved, deleted, or is temporarily unavailable.",
}) {
  const icon = errorIcons[errorCode] || errorIcons.default;

  return (
    <div className="min-h-screen font-poppins bg-bg-light-gray flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto">{icon}</div>

        {/* Error Code */}
        <h1 className="font-montserrat text-7xl sm:text-8xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {errorCode}
        </h1>

        {/* Title */}
        <h2 className="font-montserrat text-2xl sm:text-3xl font-bold text-gray-800">
          {title}
        </h2>

        {/* Message */}
        <p className="text-gray-500">{message}</p>

        {/* Back to Home Button */}
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto py-3 px-6 font-bold text-white bg-gradient-to-r from-primary to-secondary rounded-lg transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
        >
          <FaHome />
          <span>Go to Homepage</span>
        </Link>
      </div>

      {/* Brand Footer */}
      <div className="mt-8 text-center">
        <Link href="/" className="text-center group">
          <p className="font-montserrat text-xl font-bold text-gray-600 group-hover:text-primary transition-colors">
            MentoSpace
            <span className="text-gray-400 group-hover:text-secondary">.</span>
          </p>
        </Link>
      </div>
    </div>
  );
}

export default ErrorPage;
