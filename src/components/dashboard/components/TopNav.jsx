import { auth } from "../../../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function TopNav({ role }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header className="bg-white px-4 py-3 shadow-sm flex justify-between items-center">
      <h1 className="text-xl font-bold text-primary">
        MentoSpace <span className="text-gray-500 text-sm ml-2">{role}</span>
      </h1>

      <button
        onClick={handleLogout}
        className="px-4 py-1 bg-gray-100 rounded-lg text-gray-700"
      >
        Sign Out
      </button>
    </header>
  );
}

export default TopNav;