import React, { useEffect, useState } from "react";
import { Github } from "lucide-react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    google: any;
  }
}

interface SocialButtonsProps {
  mode?: "login" | "register";
}

const SocialButtons: React.FC<SocialButtonsProps> = ({ mode = "login" }) => {
  const router = useRouter();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadGoogleScript = () => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      script.onerror = () => {
        setError("Failed to load Google Sign-In");
        console.error("Failed to load Google Sign-In script");
      };
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    };

    const initializeGoogleSignIn = () => {
      try {
        if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
          throw new Error("Google Client ID is not configured");
        }

        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          context: mode,
          ux_mode: "popup",
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button"),
          {
            type: "standard",
            theme: "outline",
            size: "large",
            text: mode === "login" ? "signin_with" : "signup_with",
            shape: "rectangular",
            width: "100%",
          }
        );
      } catch (err) {
        console.error("Google Sign-In initialization error:", err);
        setError("Failed to initialize Google Sign-In");
      }
    };

    loadGoogleScript();
  }, [mode]);

  const handleGoogleResponse = async (response: { credential: string }) => {
    try {
      setError("");
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: response.credential,
          mode,
        }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        router.push("/dashboard");
      } else {
        setError(data.message || "Authentication failed");
        console.error("Google authentication failed:", data.message);
      }
    } catch (error) {
      setError("An error occurred during authentication");
      console.error("Error during Google authentication:", error);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      {error && (
        <div className="text-sm text-red-600 text-center bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div id="google-signin-button" className="w-full" />
        <button
          type="button"
          className="w-full inline-flex justify-center items-center py-3 px-4 rounded-lg bg-gray-800 text-white shadow-sm text-sm font-medium hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <Github size={20} className="mr-2" />
          GitHub
        </button>
      </div>
    </div>
  );
};

export default SocialButtons;
