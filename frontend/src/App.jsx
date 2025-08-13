import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";

export default function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      // Exchange code for tokens
      const body = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
        code,
        redirect_uri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
      });

      fetch(`${import.meta.env.VITE_COGNITO_DOMAIN}/oauth2/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      })
        .then((res) => res.json())
        .then((data) => {
          Cookies.set("id_token", data.id_token, { secure: true });
          const payload = JSON.parse(atob(data.id_token.split(".")[1]));
          setUser(payload);
          window.history.replaceState({}, document.title, "/dashboard");
          navigate("/dashboard");
        });
    } else {
      const token = Cookies.get("id_token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser(payload);
      }
    }
  }, [navigate]);

  return (
    <>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  );
}
