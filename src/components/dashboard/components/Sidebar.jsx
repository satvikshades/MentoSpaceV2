import { Link, NavLink } from "react-router-dom";
import { sidebarData } from "../../../constatnts/data.json";

import { FaBookAtlas, FaClock, FaGear, FaHouse, FaUser } from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";
import defaultProfilePic from "../../../assets/188353.jpg";
import { BiLogOut } from "react-icons/bi";
import { sidebarUserData } from "../../../constatnts/userdata.json";

const iconMap = {
  "fa-solid fa-house": <FaHouse />,
  "fa-solid fa-user": <FaUser />,
  "fa-solid fa-clock": <FaClock />,
  "fa-solid fa-book": <FaBookAtlas />,
  "fa-solid fa-gear": <FaGear />,
};

function Sidebar({ isOpen, setIsOpen }) {
  function handleLogout() {
    // logout logic
  }

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      // 1024px is the lg breakpoint in Tailwind
      setIsOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      {/* Logo and Close Button */}
      <div className="flex items-center justify-between mb-8">
        <div className="text-center">
          <Link to="/">
            <h2 className="font-montserrat text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MentoSpace<span className="text-secondary">.</span>
            </h2>
          </Link>
        </div>
        {/* Close button for mobile view */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden text-gray-500 hover:text-gray-800"
        >
          <FaTimes className="h-6 w-6" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow">
        <ul>
          {sidebarData.map((item) => (
            <li key={item.id} className="mb-2">
              <NavLink
                to={item.link}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`
                }
              >
                <span className="w-6 h-6 mt-2">{iconMap[item.icon]}</span>
                <span>{item.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* You can add a footer section here if needed, e.g., Logout button */}
      <div className="mt-auto">
        <div className="mb-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200 cursor-pointer"
          >
            <BiLogOut />
            Logout
          </button>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
          <img
            src={sidebarUserData.profilePic}
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold">{sidebarUserData.name}</h3>
            <p className="text-sm text-gray-500">{sidebarUserData.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
