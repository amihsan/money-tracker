import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import MoneyTracker from "./MoneyTracker";

const COGNITO_DOMAIN = import.meta.env.VITE_COGNITO_DOMAIN;
const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_COGNITO_REDIRECT_URI;

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      // Exchange code for tokens
      const body = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: CLIENT_ID,
        code,
        redirect_uri: REDIRECT_URI,
      });

      axios
        .post(`${COGNITO_DOMAIN}/oauth2/token`, body.toString(), {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        })
        .then((res) => {
          Cookies.set("id_token", res.data.id_token, { secure: true });
          const payload = JSON.parse(atob(res.data.id_token.split(".")[1]));
          setUser(payload);
          setLoading(false);
          window.history.replaceState({}, document.title, "/dashboard");
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      const token = Cookies.get("id_token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser(payload);
      }
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("id_token");
    setUser(null);
    window.location.href = `${COGNITO_DOMAIN}/logout?client_id=${CLIENT_ID}&logout_uri=${window.location.origin}/`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-700 text-lg font-medium">
          Loading your dashboard...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <h2 className="text-2xl font-semibold mb-6">You are not logged in</h2>
        <button
          onClick={() =>
            (window.location.href = `${COGNITO_DOMAIN}/login?client_id=${CLIENT_ID}&response_type=code&scope=email+openid+profile&redirect_uri=${REDIRECT_URI}`)
          }
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
        >
          Log In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Welcome Section */}
        <section className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">
            Welcome back, {user.email.split("@")[0]}!
          </h2>
          <p className="text-gray-600">
            Here’s a quick overview of your transactions and finances.
          </p>
        </section>

        {/* Money Tracker Component */}
        <section className="bg-white rounded-lg shadow p-6">
          <MoneyTracker />
        </section>
      </main>
    </div>
  );
}
