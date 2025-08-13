import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = Cookies.get("id_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser(payload);
      } catch (error) {
        console.error("Invalid token", error);
        setUser(null);
      }
    }
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">No user is logged in.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-semibold mb-6 text-gray-900">Profile</h1>

        <div className="space-y-4 text-gray-700">
          <div>
            <h2 className="text-sm font-medium text-gray-500">Email</h2>
            <p className="text-lg">{user.email || "N/A"}</p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500">Name</h2>
            <p className="text-lg">{user.name || "N/A"}</p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500">Username</h2>
            <p className="text-lg">{user["cognito:username"] || "N/A"}</p>
          </div>

          {/* Add more user info fields if available */}
          <div>
            <h2 className="text-sm font-medium text-gray-500">Issued At</h2>
            <p className="text-lg">
              {user.iat ? new Date(user.iat * 1000).toLocaleString() : "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
