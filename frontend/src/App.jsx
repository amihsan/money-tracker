import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";

// Utility to safely parse JWT
function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("JWT parsing error:", error);
    return null;
  }
}

export default function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        try {
          const body = new URLSearchParams({
            grant_type: "authorization_code",
            client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
            code,
            redirect_uri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
          });

          const res = await fetch(
            `${import.meta.env.VITE_COGNITO_DOMAIN}/oauth2/token`,
            {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: body.toString(),
            }
          );

          const data = await res.json();

          if (data.id_token) {
            Cookies.set("id_token", data.id_token, { secure: true });
            const payload = parseJwt(data.id_token);
            if (payload) setUser(payload);

            // Clean URL and navigate
            window.history.replaceState({}, document.title, "/dashboard");
            navigate("/dashboard");
          } else {
            console.error("No id_token in response", data);
          }
        } catch (err) {
          console.error("Token exchange failed", err);
        }
      } else {
        const token = Cookies.get("id_token");
        const payload = parseJwt(token);
        if (payload) setUser(payload);
      }
    };

    handleAuth();
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

// import { useState, useEffect } from "react";
// import { Routes, Route, useNavigate } from "react-router-dom";
// import Cookies from "js-cookie";
// import Navbar from "./components/Navbar";
// import Home from "./components/Home";
// import Dashboard from "./components/Dashboard";
// import Profile from "./components/Profile";

// export default function App() {
//   const [user, setUser] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const code = params.get("code");

//     if (code) {
//       // Exchange code for tokens
//       const body = new URLSearchParams({
//         grant_type: "authorization_code",
//         client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
//         code,
//         redirect_uri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
//       });

//       fetch(`${import.meta.env.VITE_COGNITO_DOMAIN}/oauth2/token`, {
//         method: "POST",
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         body: body.toString(),
//       })
//         .then((res) => res.json())
//         .then((data) => {
//           Cookies.set("id_token", data.id_token, { secure: true });
//           const payload = JSON.parse(atob(data.id_token.split(".")[1]));
//           setUser(payload);
//           window.history.replaceState({}, document.title, "/dashboard");
//           navigate("/dashboard");
//         });
//     } else {
//       const token = Cookies.get("id_token");
//       if (token) {
//         const payload = JSON.parse(atob(token.split(".")[1]));
//         setUser(payload);
//       }
//     }
//   }, [navigate]);

//   return (
//     <>
//       <Navbar user={user} setUser={setUser} />
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/dashboard" element={<Dashboard user={user} />} />
//         <Route path="/profile" element={<Profile />} />
//       </Routes>
//     </>
//   );
// }
