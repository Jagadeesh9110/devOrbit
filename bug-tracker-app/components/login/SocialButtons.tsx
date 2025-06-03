"use client";

import React, { useEffect, useState } from "react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { GoogleCredentialResponse } from "../../types/google";

interface GoogleUser {
  id: string;
  name: string;
  email: string;
  image: string;
  role: string;
  isVerified: boolean;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: GoogleUser;
  };
}

interface SocialButtonsProps {
  mode?: "login" | "register";
}

const SocialButtons: React.FC<SocialButtonsProps> = ({ mode = "login" }) => {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
        const existingScript = document.querySelector(
          'script[src="https://accounts.google.com/gsi/client"]'
        );
        if (existingScript) {
          document.body.removeChild(existingScript);
        }
      };
    };

    const initializeGoogleSignIn = () => {
      try {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!clientId) {
          throw new Error("Google Client ID is not configured");
        }

        if (
          typeof window.google === "undefined" ||
          !window.google.accounts ||
          !window.google.accounts.id
        ) {
          throw new Error(
            "Google Sign-In script not loaded or initialized properly."
          );
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          context: mode,
          ux_mode: "popup",
        });

        const buttonContainer = document.getElementById("google-signin-button");
        if (buttonContainer && window.google.accounts.id.renderButton) {
          window.google.accounts.id.renderButton(buttonContainer, {
            type: "standard",
            theme: "filled_black",
            size: "large",
            text: mode === "login" ? "signin_with" : "signup_with",
            shape: "rectangular",
            width: 240,
            logo_alignment: "left",
          });
        }
      } catch (err) {
        console.error("Google Sign-In initialization error:", err);
        setError("Failed to initialize Google Sign-In");
      }
    };

    loadGoogleScript();
  }, [mode]);

  const handleGoogleResponse = (response: GoogleCredentialResponse) => {
    setIsLoading(true);
    setError("");

    fetch("/api/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        credential: response.credential,
        mode,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Authentication failed");
        }
        return data;
      })
      .then((data) => {
        if (data.success) {
          router.push("/dashboard");
          router.refresh();
        } else {
          setError(data.message || "Authentication failed");
        }
      })
      .catch((error) => {
        console.error("Google auth error:", error);
        setError(
          error instanceof Error
            ? error.message
            : "An error occurred during authentication"
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleGitHubLogin = () => {
    setIsLoading(true);
    setError("");

    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      "/api/auth/github?popup=true",
      "GitHub Login",
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
    );

    if (!popup) {
      setError("Popup blocked. Please allow popups for this site.");
      setIsLoading(false);
      return;
    }

    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "GITHUB_OAUTH_SUCCESS") {
        window.removeEventListener("message", handleMessage);

        try {
          document.cookie = `accessToken=${event.data.tokens.accessToken}; path=/; max-age=900; HttpOnly; SameSite=Lax`;
          document.cookie = `refreshToken=${event.data.tokens.refreshToken}; path=/; max-age=604800; HttpOnly; SameSite=Lax`;

          router.push("/dashboard");
          router.refresh();
        } catch (error) {
          console.error("Error setting cookies:", error);
          setError("Authentication failed");
        }

        setIsLoading(false);
      } else if (event.data.type === "GITHUB_OAUTH_ERROR") {
        window.removeEventListener("message", handleMessage);
        setError(event.data.error || "GitHub login failed");
        setIsLoading(false);
      }
    };

    window.addEventListener("message", handleMessage);

    const checkPopupClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopupClosed);
        window.removeEventListener("message", handleMessage);
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-sm text-red-600 text-center bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
      <div className="w-full flex items-center justify-center">
        <div id="google-signin-button"></div>
      </div>
      <button
        onClick={handleGitHubLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-[#24292F] text-white rounded-lg px-4 py-2 hover:bg-[#1B1F23] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FaGithub className="w-5 h-5" />
        <span>Continue with GitHub</span>
      </button>
    </div>
  );
};

export default SocialButtons;
