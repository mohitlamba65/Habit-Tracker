import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  User,
  Lock,
  Trash2,
  Upload,
  Sun,
  Moon,
  CheckCircle,
} from "lucide-react";
import imageCompression from "browser-image-compression";
import { ThemeContext } from "../context/ThemeContext";
import { updateNotificationPrefs } from "../api/notification";

const Settings = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatar: "",
    language: "en",
    timezone: "UTC+5.5",
    notifications: {
      email: true,
      push: false,
      whatsapp: false,
    },
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarSuccess, setAvatarSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(true);

  const { darkMode, setDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/users/me");
        setFormData((prev) => ({
          ...prev,
          ...res.data.user,
        }));
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load user");
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggle = async() => {
    updateNotificationPrefs().then((res) => setEnabled(res.data.enabled));
    await API.patch("/notifications/preferences", formData.notifications);

  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [name]: checked,
      },
    }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const options = {
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };
      try {
        const compressedFile = await imageCompression(file, options);
        setAvatarFile(compressedFile);
        setAvatarPreview(URL.createObjectURL(compressedFile));
        setAvatarSuccess(false);
      } catch (error) {
        toast.error("Error compressing image", error);
      }
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.put("/users/update-account", {
        name: formData.name,
        email: formData.email,
        language: formData.language,
        timezone: formData.timezone,
        notifications: formData.notifications,
      });

      toast.success(res.data.message || "Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.put("/users/change-password", passwordData);
      toast.success(res.data.message || "Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "" });
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Password change failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    e.preventDefault();
    if (!avatarFile) {
      toast.error("Please select an avatar to upload.");
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append("avatar", avatarFile);

    try {
      const res = await API.post("/users/upload-avatar", formDataUpload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(res.data.message || "Avatar uploaded successfully!");
      setFormData((prev) => ({
        ...prev,
        avatar: res.data.avatarUrl,
      }));
      setAvatarSuccess(true);
      setTimeout(() => setAvatarSuccess(false), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Avatar upload failed");
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const res = await API.delete("/users/delete");
      toast.success(res.data.message || "Account deleted successfully!");
      navigate("/");
      window.location.href = "/login";
    } catch (err) {
      toast.error(err.response?.data?.message || "Account deletion failed");
    }
  };

  const bgColor = darkMode
    ? "bg-gray-900 text-white"
    : "bg-white text-gray-800";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`max-w-2xl mx-auto pt-24 p-6 shadow-xl rounded-lg ${bgColor} relative mt-[4rem]`}
    >
      {/* Dark Mode Toggle */}
      <div className="absolute top-6 right-6">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="text-xl p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {darkMode ? <Sun /> : <Moon />}
        </button>
      </div>

      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2 bg-gradient-to-r from-[#6348EB] via-[#8B36EA] to-[#2F5FEB] text-transparent bg-clip-text">
        <User /> Account Settings
      </h2>

      {/* Profile Update Form */}
      <form onSubmit={handleProfileUpdate} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Name</label>
          <input
            type="text"
            name="name"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Language */}
        <div>
          <label className="block font-medium mb-1">Language</label>
          <select
            name="language"
            value={formData.language}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="en">🇬🇧 English</option>
            <option value="hi">🇮🇳 Hindi</option>
            <option value="es">🇪🇸 Spanish</option>
            <option value="fr">🇫🇷 French</option>
          </select>
        </div>

        {/* Timezone */}
        <div>
          <label className="block font-medium mb-1">Timezone</label>
          <select
            name="timezone"
            value={formData.timezone}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="UTC+5.5">🇮🇳 IST (UTC+5:30)</option>
            <option value="UTC+1">🇪🇺 CET (UTC+1)</option>
            <option value="UTC-5">🇺🇸 EST (UTC-5)</option>
            <option value="UTC+9">🇯🇵 JST (UTC+9)</option>
          </select>
        </div>

        {/* Notifications */}
        <div>
          <label className="block font-medium mb-1">Notifications</label>
          {["email", "whatsapp", "push"].map((type) => (
            <div key={type} className="flex items-center mb-1">
              <input
                type="checkbox"
                name={type}
                checked={formData.notifications[type]}
                onChange={handleNotificationChange}
                className="mr-2"
              />
              <label className="capitalize">{type}</label>
            </div>
          ))}
          <button
            onClick={() =>
              API.post("/notifications/send-reminder").then(() =>
                toast.success("Email sent!")
              )
            }
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
          >
            🔔 Send Reminder Now
          </button>
        </div>

        <div>
          <h2 className="text-lg font-bold">Notification Settings</h2>
          <button
            onClick={handleToggle}
            className="mt-2 p-2 bg-blue-500 text-white rounded"
          >
            {enabled ? "Disable Notifications" : "Enable Notifications"}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-[#6348EB] via-[#8B36EA] to-[#2F5FEB] text-white px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>

      {/* Avatar Upload */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Change Avatar</h3>
        <div className="flex items-center gap-4">
          <motion.img
            src={avatarPreview || formData.avatar}
            alt="avatar preview"
            className="w-20 h-20 rounded-full object-cover border"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          />
          <input type="file" accept="image/*" onChange={handleAvatarChange} />
          <button
            onClick={handleAvatarUpload}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
          >
            <Upload className="mr-2" />
            Upload
          </button>
          {avatarSuccess && <CheckCircle className="text-green-600" />}
        </div>
      </div>

      {/* Change Password */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Lock />
          Change Password
        </h3>
        <form onSubmit={handleChangePassword} className="space-y-4 mt-2">
          <input
            type="password"
            name="currentPassword"
            placeholder="Current Password"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            required
          />
          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-[#6348EB] via-[#8B36EA] to-[#2F5FEB] text-white px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
          {passwordSuccess && <CheckCircle className="text-green-600 ml-2" />}
        </form>
      </div>

      {/* Delete Account */}
      <div className="mt-8">
        <button
          onClick={handleDeleteAccount}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center"
        >
          <Trash2 className="mr-2" />
          Delete Account
        </button>
      </div>
    </motion.div>
  );
};

export default Settings;
