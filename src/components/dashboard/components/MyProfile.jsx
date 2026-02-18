import { useState, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPen,
  FaTimes,
  FaCamera,
} from "react-icons/fa";

import { FaFloppyDisk } from "react-icons/fa6";

import MoodTracker from "./MoodTracker"; // correct path

import { auth, db, storage } from "../../../firebase";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

function MyProfile() {

  // 🔥 Mood Tracker state
  const [showMood, setShowMood] = useState(false);

  // Profile states
  const [isEditing, setIsEditing] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [formData, setFormData] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const user = auth.currentUser;

  // -----------------------------------------------------------
  // LOAD USER DATA
  // -----------------------------------------------------------
  useEffect(() => {
    async function fetchUserData() {
      if (!user) return;

      const refUser = doc(db, "users", user.uid);
      const snap = await getDoc(refUser);

      if (snap.exists()) {
        const data = snap.data();
        setUserDetails(data);
        setFormData(data);
      }
    }

    fetchUserData();
  }, [user]);

  // -----------------------------------------------------------
  // HANDLE PROFILE EDITING
  // -----------------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      const fileRef = ref(storage, `profilePics/${user.uid}.jpg`);
      await uploadBytes(fileRef, file);

      const url = await getDownloadURL(fileRef);

      await updateDoc(doc(db, "users", user.uid), {
        profilePic: url,
      });

      setUserDetails((prev) => ({ ...prev, profilePic: url }));
      setFormData((prev) => ({ ...prev, profilePic: url }));

      setSuccessMessage("Profile picture updated!");
      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (err) {
      console.error(err);
      alert("Upload failed!");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      await updateDoc(doc(db, "users", user.uid), {
        name: formData.name,
        bio: formData.bio,
      });

      setUserDetails(formData);
      setIsEditing(false);
      setSuccessMessage("Profile updated!");
      setTimeout(() => setSuccessMessage(""), 3000);

    } catch (err) {
      console.error(err);
      alert("Update failed!");
    }
  };

  const handleCancelEdit = () => {
    setFormData(userDetails);
    setIsEditing(false);
  };

  if (!userDetails) {
    return <div className="p-6">Loading profile...</div>;
  }

  return (
    <div className="space-y-8 relative">

      {/* Floating Mood Button */}
      <button
        onClick={() => setShowMood(true)}
        className="fixed bottom-6 right-6 bg-primary text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2"
      >
        😊 How are you feeling?
      </button>

      {showMood && <MoodTracker onClose={() => setShowMood(false)} />}

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>

        {successMessage && (
          <p className="text-green-600 font-medium bg-green-100 px-4 py-2 rounded-md">
            {successMessage}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT SIDE */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">

          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-xl font-semibold text-gray-700">
              Personal Information
            </h2>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg"
              >
                <FaPen />
                Edit Profile
              </button>
            )}
          </div>

          {/* Edit Mode */}
          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-6">

              {/* Profile image */}
              <div className="relative inline-block">
                <img
                  src={formData.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}`}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover shadow-md"
                />

                <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer">
                  <FaCamera />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePicUpload}
                  />
                </label>
              </div>

              {uploading && <p className="text-sm text-blue-500">Uploading...</p>}

              {/* Name */}
              <div>
                <label className="block text-sm mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm mb-1">About Me</label>
                <textarea
                  name="bio"
                  rows="3"
                  value={formData.bio || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-2 bg-gray-200 rounded-lg flex items-center gap-2"
                >
                  <FaTimes /> Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded-lg flex items-center gap-2"
                >
                  <FaFloppyDisk /> Save
                </button>
              </div>

            </form>
          ) : (
            // View Mode
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <img
                  src={userDetails.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(userDetails.name)}`}
                  className="w-24 h-24 rounded-full object-cover shadow-md"
                />

                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <h3 className="text-2xl font-bold">{userDetails.name}</h3>

                  <p className="text-sm text-gray-500 mt-2">Email</p>
                  <p>{userDetails.email}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-500">About Me</h4>
                <p className="bg-gray-50 p-4 rounded-md">
                  {userDetails.bio || "No bio added yet."}
                </p>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT SIDE */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6 border-b pb-4">
            Attended Sessions
          </h2>

          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
            {[1,2,3].map((n) => (
              <div key={n} className="p-4 border rounded-lg">
                <h3 className="font-bold">Example session {n}</h3>
                <p className="text-sm text-gray-600">Mentor: Someone</p>
                <p className="text-sm text-gray-600">Date: 2025-10-12</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default MyProfile;