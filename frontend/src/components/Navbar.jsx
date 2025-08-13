import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const COGNITO_DOMAIN = import.meta.env.VITE_COGNITO_DOMAIN;
  const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID;
  const REDIRECT_URI = import.meta.env.VITE_COGNITO_REDIRECT_URI;

  const handleLogin = () => {
    window.location.href = `${COGNITO_DOMAIN}/login?client_id=${CLIENT_ID}&response_type=code&scope=email+openid+profile&redirect_uri=${REDIRECT_URI}`;
  };

  const handleLogout = () => {
    Cookies.remove("id_token");
    setUser(null);
    navigate("/");
    // Give a small delay before redirecting to logout endpoint to allow navigate
    setTimeout(() => {
      window.location.href = `${COGNITO_DOMAIN}/logout?client_id=${CLIENT_ID}&logout_uri=${window.location.origin}/`;
    }, 100);
  };

  return (
    <nav className="bg-gray-900 text-white px-8 py-4 flex justify-between items-center shadow-md">
      <Link
        to="/"
        className="text-2xl font-semibold tracking-wide hover:text-yellow-400 transition-colors duration-300"
      >
        💰 Money Tracker
      </Link>

      <div className="flex items-center space-x-8">
        <Link
          to="/"
          className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 font-medium"
        >
          Home
        </Link>

        {user && (
          <>
            <Link
              to="/dashboard"
              className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/profile"
              className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 font-medium"
            >
              Profile
            </Link>
          </>
        )}

        {!user ? (
          <button
            onClick={handleLogin}
            className="bg-blue-600 hover:bg-blue-700 transition-colors duration-300 px-5 py-2 rounded-md font-semibold shadow-sm"
          >
            Login
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 transition-colors duration-300 px-5 py-2 rounded-md font-semibold shadow-sm"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
