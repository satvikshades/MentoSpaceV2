import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import { FiAlertCircle } from "react-icons/fi";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 text-gray-700 shadow-inner mt-12 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start text-center md:text-left">
          {/* Brand Information */}
          <div className="space-y-2">
            <h2 className="font-montserrat text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MentoSpace<span className="text-secondary">.</span>
            </h2>
            <p className="text-sm text-gray-500">
              Connecting mentors and mentees worldwide.
            </p>
          </div>

          {/* Notice / Alert - spans 2 cols on md */}
          <div className="md:col-span-2">
            <div className="flex items-start gap-3 bg-yellow-50 border-l-4 border-yellow-300 text-yellow-700 p-4 rounded">
              <FiAlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
              <p className="text-sm leading-relaxed">
                All the Data show here are fictional and for demonstration
                purposes only. If matched with real persons, it is purely
                coincidental.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start space-y-2 font-medium text-sm">
            <a
              href="#"
              className="hover:text-primary transition-colors duration-200"
              aria-label="About Us link"
            >
              About Us
            </a>
            <a
              href="#"
              className="hover:text-primary transition-colors duration-200"
              aria-label="Contact link"
            >
              Contact
            </a>
            <a
              href="#"
              className="hover:text-primary transition-colors duration-200"
              aria-label="Privacy Policy link"
            >
              Privacy Policy
            </a>
          </div>

          {/* Social Media Icons */}
          <div className="flex items-center justify-center md:justify-end space-x-4">
            <a
              href="#"
              aria-label="Twitter"
              className="text-gray-500 hover:text-blue-400 transition transform hover:-translate-y-0.5 duration-200"
              rel="noopener noreferrer"
            >
              <FaTwitter className="h-6 w-6" />
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              className="text-gray-500 hover:text-blue-600 transition transform hover:-translate-y-0.5 duration-200"
              rel="noopener noreferrer"
            >
              <FaLinkedin className="h-6 w-6" />
            </a>
            <a
              href="#"
              aria-label="GitHub"
              className="text-gray-500 hover:text-gray-900 transition transform hover:-translate-y-0.5 duration-200"
              rel="noopener noreferrer"
            >
              <FaGithub className="h-6 w-6" />
            </a>
          </div>
        </div>

        {/* Copyright notice at the bottom */}
        <div className="mt-8 border-t border-gray-200 pt-6 text-center text-sm">
          <p>© {currentYear} MentoSpace. All Rights Reserved.</p>
        </div>
        <div className="mt-2">
          <p className="text-center text-sm text-gray-400">
            Made with ❤️ by MentoSpace Team
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
