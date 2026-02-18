import { NavLink } from "react-router-dom";
import { FaHome, FaSearch, FaHeart, FaComments, FaChartLine } from "react-icons/fa";

function BottomNav({ role }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg py-2 flex justify-around z-50 lg:hidden">
      <NavItem to="/dashboard/profile" label="Home" icon={<FaHome />} />
      <NavItem to="/dashboard/find-mentor" label="Explore" icon={<FaSearch />} />
      <NavItem to="/dashboard/my-students" label="My" icon={<FaHeart />} />
      <NavItem to="/dashboard/chats" label="Chats" icon={<FaComments />} />
      <NavItem to="/dashboard/profile" label="Mood" icon={<FaChartLine />} />
    </div>
  );
}

function NavItem({ to, label, icon }) {
  return (
    <NavLink to={to} className={({isActive}) => `flex flex-col items-center text-xs ${isActive ? 'text-primary' : 'text-gray-500'}`}>
      <div className="text-xl">{icon}</div>
      <div>{label}</div>
    </NavLink>
  );
}

export default BottomNav;