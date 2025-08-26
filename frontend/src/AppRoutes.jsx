import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuthenticator } from "@aws-amplify/ui-react";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import LoginModal from "./components/LoginModal";

// Mock fetch function
async function fetchUserData(user) {
  return {
    info: `This is data for ${user.username || user.attributes?.email}`,
  };
}

export default function AppRoutes() {
  const { user, signOut } = useAuthenticator((ctx) => [ctx.user]);
  const [authOpen, setAuthOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // NEW
  const navigate = useNavigate();

  // Sync local login state with Amplify user
  useEffect(() => {
    setIsLoggedIn(!!user);
    if (user) {
      fetchUserData(user).then((data) => setUserData(data));
    } else {
      setUserData(null);
    }
  }, [user]);

  const handleLogout = async () => {
    setAuthOpen(false);
    setIsLoggedIn(false);
    setIsLoggingOut(true); // show spinner immediately
    try {
      await signOut();
      setUserData(null);
      navigate("/"); // redirect home
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setTimeout(() => setIsLoggingOut(false), 400); // short delay to smooth out
    }
  };

  if (isLoggingOut) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600 border-solid"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-blue-50 via-white to-indigo-100" />
      <div
        className="absolute inset-0 -z-10 opacity-10"
        style={{
          backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
          backgroundSize: "12px 12px",
        }}
      />

      <Navbar
        user={user}
        onLogin={() => setAuthOpen(true)}
        onLogout={handleLogout}
      />

      <Routes>
        <Route
          path="/"
          element={
            <Home
              user={isLoggedIn ? user : null}
              userData={userData}
              onLoginClick={() => setAuthOpen(true)}
            />
          }
        />
        <Route
          path="/dashboard"
          element={<Dashboard user={user} userData={userData} />}
        />
        <Route
          path="/profile"
          element={<Profile user={user} userData={userData} />}
        />
      </Routes>

      {!isLoggedIn && authOpen && (
        <LoginModal onClose={() => setAuthOpen(false)} />
      )}
    </div>
  );
}
