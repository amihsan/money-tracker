import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginModal({ onClose }) {
  const { route } = useAuthenticator((context) => [context.route]);
  const navigate = useNavigate();

  // Close modal after login
  useEffect(() => {
    if (route === "authenticated") {
      onClose?.();
    }
  }, [route, onClose]);

  // Redirect to home after logout
  useEffect(() => {
    if (route === "signIn") {
      navigate("/");
    }
  }, [route, navigate]);

  if (route === "authenticated") return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md">
        <div className="rounded-2xl shadow-2xl">
          <Authenticator socialProviders={["google"]} />
        </div>
      </div>
    </div>
  );
}
