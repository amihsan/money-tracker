export default function HomePage({ user }) {
  const COGNITO_DOMAIN = import.meta.env.VITE_COGNITO_DOMAIN;
  const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID;
  const REDIRECT_URI = import.meta.env.VITE_COGNITO_REDIRECT_URI;

  const handleLogin = () => {
    window.location.href = `${COGNITO_DOMAIN}/login?client_id=${CLIENT_ID}&response_type=code&scope=email+openid+profile&redirect_uri=${REDIRECT_URI}`;
  };

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-6">
      <div className="max-w-3xl text-center bg-white shadow-lg rounded-lg p-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Money Tracker
        </h1>
        <p className="text-gray-700 text-lg mb-8">
          Track your expenses and manage your finances easily and securely.
        </p>
        {!user && (
          <button
            onClick={handleLogin}
            className="bg-blue-600 text-white px-8 py-3 rounded-md text-lg hover:bg-blue-700 transition"
          >
            Get Started — Login
          </button>
        )}
        {user && (
          <p className="text-green-700 font-semibold text-lg">
            You are logged in as {user.email}
          </p>
        )}
      </div>
    </main>
  );
}

// import { Link } from "react-router-dom";

// export default function Home() {
//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white">
//       <h1 className="text-4xl font-bold mb-4">Welcome to Money Tracker</h1>
//       <p className="mb-6 text-lg">
//         Track your expenses, manage your budget, and stay in control.
//       </p>
//       <Link
//         to="/login"
//         className="px-6 py-3 bg-white text-blue-600 font-semibold rounded shadow hover:bg-gray-200 transition"
//       >
//         Get Started
//       </Link>
//     </div>
//   );
// }
