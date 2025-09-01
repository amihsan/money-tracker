import { Wallet, LogIn, Activity, CreditCard, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Home({ user, onLoginClick }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 via-teal to-teal-100 p-4 sm:p-6 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 mb-8 sm:mb-10">
          <Wallet className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600 mx-auto sm:mx-0" />
          <div className="text-center sm:text-left mt-4 sm:mt-0">
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-gray-800">
              {user
                ? `Welcome back, ${
                    user.signInDetails?.loginId || user.username
                  }`
                : "Track & Manage Your Money Smarter"}
            </h1>
            <p className="text-gray-600 mt-2 sm:mt-4 text-base sm:text-lg lg:text-xl">
              {user
                ? "Keep an eye on your finances, track transactions, and never miss a due date."
                : "Track your expenses, borrowing, and repayments effortlessly. Secure and simple."}
            </p>
          </div>
        </div>

        {/* Logged-in CTA */}
        {user && (
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 sm:mb-10 text-center sm:text-left">
            <p className="text-gray-700 text-base sm:text-lg">
              You are logged in! View your dashboard for an overview.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition text-sm sm:text-base"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* Guest CTA */}
        {!user && (
          <div className="flex flex-col items-center sm:items-start gap-3 mb-8 sm:mb-10 text-center sm:text-left">
            <button
              onClick={onLoginClick}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition text-sm sm:text-base"
            >
              <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
              Login to Get Started
            </button>
            <p className="text-gray-500 text-sm sm:text-base max-w-md">
              Securely sign in with Google and start managing your finances
              smarter today.
            </p>
          </div>
        )}

        {/* Features Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow border border-gray-200 flex flex-col items-center text-center">
            <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600 mb-2 sm:mb-3" />
            <h3 className="text-base sm:text-lg font-semibold mb-1">
              Track Expenses
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm">
              Keep track of your borrowing, lending, and spending in one place.
            </p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow border border-gray-200 flex flex-col items-center text-center">
            <CreditCard className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600 mb-2 sm:mb-3" />
            <h3 className="text-base sm:text-lg font-semibold mb-1">
              Manage Transactions
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm">
              Easily add, mark paid, and delete transactions with a single
              click.
            </p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow border border-gray-200 flex flex-col items-center text-center">
            <Users className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600 mb-2 sm:mb-3" />
            <h3 className="text-base sm:text-lg font-semibold mb-1">
              Stay Organized
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm">
              See who owes you and who you owe, so nothing gets lost or
              forgotten.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
