import { useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPen,
  FaCalendarAlt,
  FaTimes,
} from "react-icons/fa";
import { FaBook, FaChalkboardUser, FaFloppyDisk } from "react-icons/fa6";
import defaultProfilePic from "../../../assets/188353.jpg"; // Assuming the path from your Sidebar component
import { initialUserDetails } from "../../../constatnts/userdata.json";

// --- Mock Data ---
// In a real application, you would fetch this from an API.
// const initialUserDetails = {
//   fullName: "Naruto Uzumaki",
//   email: "naruto.uzumaki@konoha.com",
//   bio: "A passionate shinobi from the Hidden Leaf Village, on a journey to become the Hokage. Believe it!",
//   profilePic: defaultProfilePic,
// };

const attendedSessions = [
  {
    id: 1,
    title: "Advanced Rasengan Techniques",
    mentor: "Jiraiya Sensei",
    date: "2025-09-26",
  },
  {
    id: 2,
    title: "Introduction to Sage Mode",
    mentor: "Fukasaku",
    date: "2025-08-15",
  },
  {
    id: 3,
    title: "Teamwork and Strategy",
    mentor: "Kakashi Hatake",
    date: "2025-07-05",
  },
  {
    id: 4,
    title: "Mastering Shadow Clone Jutsu",
    mentor: "Iruka Umino",
    date: "2025-06-10",
  },
];
// --- End Mock Data ---

function MyProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [userDetails, setUserDetails] = useState(initialUserDetails);
  const [formData, setFormData] = useState(initialUserDetails);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    // Simulate an API call to update the profile
    console.log("Updating profile with:", formData);
    setUserDetails(formData); // Update the main display details
    setIsEditing(false); // Switch back to view mode

    // Show a success message
    setSuccessMessage("Profile updated successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleCancelEdit = () => {
    setFormData(userDetails); // Revert any changes
    setIsEditing(false); // Go back to view mode
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
        {successMessage && (
          <p className="text-green-600 font-medium bg-green-100 px-4 py-2 rounded-md">
            {successMessage}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Profile Information */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
            <h2 className="text-xl font-semibold text-gray-700">
              Personal Information
            </h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary/20 transition-colors duration-300 cursor-pointer"
              >
                <FaPen />
                Edit Profile
              </button>
            )}
          </div>

          {/* --- CONDITIONAL RENDERING: VIEW OR EDIT --- */}
          {isEditing ? (
            // --- EDIT MODE ---
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="flex items-center gap-4">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    formData.name
                  )}&background=random&size=128`}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-bold text-lg">{formData.name}</h3>
                  <p className="text-sm text-gray-500">{formData.email}</p>
                </div>
              </div>
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-600 mb-1"
                >
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <FaUser />
                  </span>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-600 mb-1"
                >
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <FaEnvelope />
                  </span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-600 mb-1"
                >
                  About Me
                </label>
                <div className="relative">
                  <span className="absolute top-3 left-0 flex items-center pl-3 text-gray-400">
                    <FaPen />
                  </span>
                  <textarea
                    id="bio"
                    name="bio"
                    rows="4"
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                    placeholder="Tell us a little about yourself..."
                  ></textarea>
                </div>
              </div>
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-300 cursor-pointer"
                >
                  <FaTimes /> Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors duration-300 cursor-pointer"
                >
                  <FaFloppyDisk /> Save Changes
                </button>
              </div>
            </form>
          ) : (
            // --- VIEW MODE ---
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    userDetails.name
                  )}&background=random&size=128`}
                  alt={userDetails.name}
                  className="w-24 h-24 rounded-full object-cover shadow-md"
                />
                <div className="flex flex-col">
                  <p className="text-sm text-gray-500">Full Name</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {userDetails.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-2">Email</p>
                  <p className="text-gray-600">{userDetails.email}</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-500 mb-1">
                  About Me
                </h4>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-md border border-gray-200">
                  {userDetails.bio}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Session History */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-6 border-b border-gray-200 pb-4">
            Attended Sessions
          </h2>
          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
            {attendedSessions.map((session) => (
              <div
                key={session.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-primary/50 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <FaBook className="text-primary" />
                  <h3 className="font-bold text-gray-800">{session.title}</h3>
                </div>
                <div className="text-sm text-gray-600 space-y-1 pl-7">
                  <p className="flex items-center gap-2">
                    <FaChalkboardUser className="text-gray-400" />
                    <span>Mentor: {session.mentor}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <FaCalendarAlt className="text-gray-400" />
                    <span>{session.date}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyProfile;
