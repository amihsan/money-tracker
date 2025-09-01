import { useState, useEffect } from "react";
import { Edit2, Trash2, Save, Camera } from "lucide-react";
import axios from "axios";

export default function Profile({ user, onLogout }) {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    avatar: "",
    address: "",
  });
  const [editing, setEditing] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    if (!user) return;
    async function fetchProfile() {
      try {
        const res = await axios.get(`/api/profile/${user.id}`);
        setProfile(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchProfile();
  }, [user]);

  const handleChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  const toggleEdit = (field) => {
    setEditing({ ...editing, [field]: !editing[field] });
  };

  const saveField = async (field) => {
    try {
      await axios.put(`/api/profile/${user.id}`, { [field]: profile[field] });
      toggleEdit(field);
    } catch (err) {
      console.error(err);
      alert("Failed to update");
    }
  };

  const handleAvatarChange = (e) => {
    if (e.target.files[0]) setAvatarFile(e.target.files[0]);
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;
    const formData = new FormData();
    formData.append("avatar", avatarFile);
    try {
      const res = await axios.put(`/api/profile/${user.id}/avatar`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile({ ...profile, avatar: res.data.avatar });
      setAvatarFile(null);
    } catch (err) {
      console.error(err);
      alert("Failed to upload avatar");
    }
  };

  const deleteAvatar = async () => {
    try {
      await axios.delete(`/api/profile/${user.id}/avatar`);
      setProfile({ ...profile, avatar: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to delete avatar");
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-600 p-4">
        <h2 className="text-2xl font-semibold mb-2 text-center">
          You’re not logged in
        </h2>
        <p className="text-gray-500 text-center">
          Please log in to view your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-xl rounded-xl mt-6">
      {/* Avatar */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
        <div className="relative">
          <img
            src={profile.avatar || "/default-avatar.png"}
            alt="Avatar"
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border"
          />
          <label className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-2 cursor-pointer hover:bg-indigo-700">
            <Camera className="w-5 h-5" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </label>
        </div>
        <div className="flex flex-col gap-2 w-full">
          {avatarFile && (
            <div className="flex gap-2 items-center">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                onClick={uploadAvatar}
              >
                <Save className="w-4 h-4" /> Upload
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
                onClick={() => setAvatarFile(null)}
              >
                <Trash2 className="w-4 h-4" /> Cancel
              </button>
            </div>
          )}
          {profile.avatar && (
            <button
              className="text-red-600 hover:underline text-sm mt-1"
              onClick={deleteAvatar}
            >
              Delete Avatar
            </button>
          )}
        </div>
      </div>

      {/* Profile Fields */}
      <div className="space-y-4">
        {["username", "email", "address"].map((field) => (
          <div
            key={field}
            className="flex flex-col sm:flex-row sm:items-center gap-2"
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
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                  onClick={() => saveField(field)}
                >
                  <Save className="w-4 h-4" /> Save
                </button>
              </>
            ) : (
              <>
                <span className="flex-1">{profile[field] || "-"}</span>
                <button
                  className="px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-1"
                  onClick={() => toggleEdit(field)}
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="mt-6 text-center">
        <button
          className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
