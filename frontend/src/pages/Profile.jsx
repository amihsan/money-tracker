import { useState, useEffect } from "react";
import { Edit2, Trash2, Save, Camera, Upload, AlertCircle } from "lucide-react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
} from "../api/api";

export default function Profile() {
  const { user } = useAuthenticator((ctx) => [ctx.user]);
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    avatar: "",
    address: "",
  });
  const [editing, setEditing] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [hoverAvatar, setHoverAvatar] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  const toggleEdit = (field) => {
    setEditing({ ...editing, [field]: !editing[field] });
  };

  const saveField = async (field) => {
    try {
      const updated = await updateProfile({ [field]: profile[field] });
      setProfile(updated);
      toggleEdit(field);
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to update");
    }
  };

  const handleAvatarChange = (e) => {
    if (e.target.files[0]) setAvatarFile(e.target.files[0]);
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;
    try {
      const res = await uploadAvatar(avatarFile);
      setProfile({ ...profile, avatar: res.avatar });
      setAvatarFile(null);
    } catch (err) {
      console.error("Failed to upload avatar:", err);
      alert("Failed to upload avatar");
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      await deleteAvatar();
      setProfile({ ...profile, avatar: "" });
      setAvatarFile(null);
    } catch (err) {
      console.error("Failed to delete avatar:", err);
      alert("Failed to delete avatar");
    }
  };

  // Render for non-logged-in users
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-100 via-teal to-teal-100 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-lg">
          <AlertCircle className="mx-auto w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Login Required</h2>
          <p className="text-gray-700 mb-4">
            You must be logged in to access the Profile. Please log in to
            continue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-teal to-teal-100  p-6">
      <div className="max-w-3xl mx-auto p-6 bg-teal-500 shadow-xl rounded-2xl mt-6 border border-gray-200">
        {/* Avatar Section */}
        <div
          className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 relative"
          onMouseEnter={() => setHoverAvatar(true)}
          onMouseLeave={() => setHoverAvatar(false)}
        >
          <div className="relative group">
            <img
              src={
                avatarFile
                  ? URL.createObjectURL(avatarFile) // local preview
                  : profile.avatar || "/default-avatar.png" // uploaded avatar
              }
              alt="Avatar"
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-2 border-gray-300 shadow-md transition-transform transform group-hover:scale-105"
            />

            {/* Hover overlay for icons */}
            {(hoverAvatar || avatarFile) && (
              <div className="absolute inset-0 flex justify-center items-center gap-3 bg-black bg-opacity-30 rounded-full transition-opacity">
                <label
                  className="bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition"
                  title="Upload Avatar"
                >
                  <Camera className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
                {profile.avatar && !avatarFile && (
                  <button
                    className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition"
                    onClick={handleDeleteAvatar}
                    title="Delete Avatar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Upload / Cancel Buttons */}
          {avatarFile && (
            <div className="flex gap-3 mt-4 sm:mt-0">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-md"
                onClick={handleUploadAvatar}
              >
                <Upload className="w-4 h-4" /> Upload
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-xl hover:bg-gray-500 transition shadow-md"
                onClick={() => setAvatarFile(null)}
              >
                <Trash2 className="w-4 h-4" /> Cancel
              </button>
            </div>
          )}
        </div>

        {/* Profile Fields */}
        <div className="space-y-4">
          {["username", "email", "address"].map((field) => (
            <div
              key={field}
              className="flex flex-col sm:flex-row sm:items-center gap-3 bg-gray-50 p-3 rounded-lg shadow-sm border border-gray-100"
            >
              <span className="font-semibold w-28 capitalize">{field}</span>
              {editing[field] ? (
                <>
                  <input
                    type="text"
                    value={profile[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    className="border p-2 rounded w-full sm:w-auto flex-1"
                  />
                  <button
                    className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                    onClick={() => saveField(field)}
                  >
                    <Save className="w-4 h-4" /> Save
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1">{profile[field] || "-"}</span>
                  <button
                    className="flex items-center gap-2 px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                    onClick={() => toggleEdit(field)}
                  >
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
