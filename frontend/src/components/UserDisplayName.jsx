import { useEffect, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";

/**
 * Custom hook to return a display name for the authenticated user
 * - Uses Cognito token claims if available (email)
 * - Falls back to user.username
 */
export default function UserDisplayName(user) {
  const [displayName, setDisplayName] = useState(user?.username || "");

  useEffect(() => {
    const getUserDisplayName = async () => {
      if (!user) return;

      try {
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.payload;

        setDisplayName(idToken?.email || user.username || "");
      } catch (err) {
        console.error("Error fetching user name:", err);
        setDisplayName(user.username || "");
      }
    };

    getUserDisplayName();
  }, [user]);

  return displayName;
}
