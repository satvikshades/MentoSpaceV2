import React, { useState } from "react";
import {
  FaLock,
  FaBell,
  FaTrash,
  FaEnvelope,
  FaNewspaper,
} from "react-icons/fa";
import { FaFloppyDisk } from "react-icons/fa6";

// A reusable toggle switch component for notification settings
const ToggleSwitch = ({ id, label, icon, enabled, setEnabled }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-200">
    <div className="flex items-center gap-4">
      <div className="text-gray-500">{icon}</div>
      <label htmlFor={id} className="font-medium text-gray-700">
        {label}
      </label>
    </div>
    <button
      id={id}
      onClick={() => setEnabled(!enabled)}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                 ${enabled ? "bg-primary" : "bg-gray-300"}`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300
                   ${enabled ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  </div>
);

function Setting() {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState({ text: "", type: "" });

  // State for notification toggles
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newsletter, setNewsletter] = useState(false);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" }); // Clear previous messages

    // Basic validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ text: "New passwords do not match.", type: "error" });
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setMessage({
        text: "Password must be at least 8 characters long.",
        type: "error",
      });
      return;
    }

    // Simulate API call
    console.log("Updating password:", passwordData);
    setMessage({ text: "Password updated successfully!", type: "success" });
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }); // Clear fields

    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const handleDeleteAccount = () => {
    // In a real app, this should open a confirmation modal.
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action is irreversible."
      )
    ) {
      console.log("Account deletion initiated...");
      // Add logic to call the API for account deletion
      alert("Your account has been scheduled for deletion.");
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800">Settings</h1>

      {/* --- Change Password Section --- */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-4 flex items-center gap-3">
          <FaLock /> Change Password
        </h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
              required
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors duration-300 cursor-pointer"
            >
              <FaFloppyDisk /> Save Password
            </button>
            {message.text && (
              <p
                className={`font-medium ${
                  message.type === "success" ? "text-green-600" : "text-red-600"
                }`}
              >
                {message.text}
              </p>
            )}
          </div>
        </form>
      </div>

      {/* --- Notification Preferences Section --- */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-2 border-b border-gray-200 pb-4 flex items-center gap-3">
          <FaBell /> Notification Preferences
        </h2>
        <ToggleSwitch
          id="email-notifications"
          label="Email notifications for new sessions"
          icon={<FaEnvelope />}
          enabled={emailNotifications}
          setEnabled={setEmailNotifications}
        />
        <ToggleSwitch
          id="newsletter"
          label="Weekly Newsletter"
          icon={<FaNewspaper />}
          enabled={newsletter}
          setEnabled={setNewsletter}
        />
      </div>

      {/* --- Danger Zone Section --- */}
      <div className="bg-white p-6 rounded-lg shadow-md border-2 border-red-200">
        <h2 className="text-xl font-semibold text-red-700 mb-2 flex items-center gap-3">
          <FaTrash /> Danger Zone
        </h2>
        <p className="text-gray-600 mb-4">
          Deleting your account is a permanent action and cannot be undone. All
          your data will be removed from our servers.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-300 cursor-pointer"
        >
          Delete My Account
        </button>
      </div>
    </div>
  );
}

export default Setting;
