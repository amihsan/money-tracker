export default function Profile({ user, userData }) {
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-600">
        <h2 className="text-2xl font-semibold mb-2">You’re not logged in</h2>
        <p className="text-gray-500">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Profile</h1>
      <p className="mb-2">Username: {user.username}</p>
      <p className="mb-2">Email: {user.signInDetails?.loginId}</p>
      <p className="text-sm text-gray-500">{userData?.info}</p>
    </div>
  );
}
