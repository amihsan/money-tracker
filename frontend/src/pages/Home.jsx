import { Wallet, LogIn, Activity, CreditCard, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Home({ user, onLoginClick }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-6 sm:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 mb-10">
          <Wallet className="w-12 h-12 text-indigo-600" />
          <div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-800 mt-2 sm:mt-0">
              {user
                ? `Welcome back, ${
                    user.signInDetails?.loginId || user.username
                  }`
                : "Track & Manage Your Money Smarter"}
            </h1>
            <p className="text-gray-600 mt-2 sm:mt-4 text-lg sm:text-xl">
              {user
                ? "Keep an eye on your finances, track transactions, and never miss a due date."
                : "Track your expenses, borrowing, and repayments effortlessly. Secure and simple."}
            </p>
          </div>
        </div>

        {/* Logged-in CTA */}
        {user && (
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
            <p className="text-gray-700 text-lg sm:text-xl">
              You are logged in! View your dashboard for an overview.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition text-base sm:text-lg"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* Guest CTA */}
        {!user && (
          <div className="flex flex-col items-start gap-3 mb-10">
            <button
              onClick={onLoginClick}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition text-base sm:text-lg"
            >
              <LogIn className="w-5 h-5" />
              Login to Get Started
            </button>
            <p className="text-gray-500 text-sm sm:text-base max-w-md">
              Securely sign in with Google and start managing your finances
              smarter today.
            </p>
          </div>
        )}

        {/* Features Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow border border-gray-200 flex flex-col items-center text-center">
            <Activity className="w-10 h-10 text-indigo-600 mb-3" />
            <h3 className="text-lg font-semibold mb-1">Track Expenses</h3>
            <p className="text-gray-500 text-sm">
              Keep track of your borrowing, lending, and spending in one place.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow border border-gray-200 flex flex-col items-center text-center">
            <CreditCard className="w-10 h-10 text-indigo-600 mb-3" />
            <h3 className="text-lg font-semibold mb-1">Manage Transactions</h3>
            <p className="text-gray-500 text-sm">
              Easily add, mark paid, and delete transactions with a single
              click.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow border border-gray-200 flex flex-col items-center text-center">
            <Users className="w-10 h-10 text-indigo-600 mb-3" />
            <h3 className="text-lg font-semibold mb-1">Stay Organized</h3>
            <p className="text-gray-500 text-sm">
              See who owes you and who you owe, so nothing gets lost or
              forgotten.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
