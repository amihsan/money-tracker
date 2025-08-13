import { useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

export default function LoginRedirect({ setUser }) {
  const navigate = useNavigate();
  const COGNITO_DOMAIN = import.meta.env.VITE_COGNITO_DOMAIN;
  const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID;
  const REDIRECT_URI = import.meta.env.VITE_COGNITO_REDIRECT_URI;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
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
          navigate("/dashboard");
        });
    }
  }, []);

  return <p>Logging in...</p>;
}
