import { Wallet, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Home({ user, onLoginClick }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-6 sm:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mb-6">
          <Wallet className="w-10 h-10 text-indigo-600" />
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mt-2 sm:mt-0">
            {user
              ? `Welcome back, ${user.signInDetails?.loginId || user.username}`
              : "Welcome to Money Tracker"}
          </h1>
        </div>

        <p className="text-gray-600 mb-8 sm:mb-12">
          {user
            ? "Manage your finances efficiently and track all your transactions."
            : "Track your expenses, borrowing, and repayments with ease."}
        </p>

        {/* After Login Message */}
        {user && (
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
            <p className="text-gray-700 text-lg sm:text-xl">
              You are logged in! View your dashboard for an overview.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow hover:bg-indigo-700 transition text-base sm:text-lg"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* CTA for Guests */}
        {!user && (
          <div className="flex flex-col items-start">
            <button
              onClick={onLoginClick}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl shadow hover:bg-indigo-700 transition text-base sm:text-lg"
            >
              <LogIn className="w-5 h-5" />
              Login to Get Started
            </button>
            <p className="mt-3 text-sm text-gray-500 max-w-md">
              Securely sign in with Google to manage your money smarter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
