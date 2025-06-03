"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    const provider = searchParams.get("provider"); // e.g., 'google', 'github'
    // The 'from' param should be part of the callbackUrl that the backend redirects to.
    // The backend callback (e.g., /api/auth/oauth-callback/google) should have redirected to something like:
    // /auth/callback?provider=google&from=/some/path (if successful)
    // OR /auth/callback?provider=google&from=/some/path&error=some_error (if failed)
    // For simplicity, we'll assume the backend redirect already includes 'from'.
    // If not, the backend needs to ensure 'from' is passed through correctly.

    const fromPath = searchParams.get("from") || "/dashboard";
    const decodedFromPath = decodeURIComponent(fromPath);

    if (error) {
      // If there's an error, redirect to the login page with the error message
      // Or, you could display the error directly on this page
      // For consistency with existing flows, redirecting to login with error
      const loginUrl = `/auth/login?error=${encodeURIComponent(
        error
      )}&from=${encodeURIComponent(decodedFromPath)}`;
      router.replace(loginUrl);
    } else {
      // If no error, assume login was successful (tokens are set in httpOnly cookies by the server)
      // Redirect to the 'from' path or dashboard
      // A small delay can sometimes help ensure cookies are processed by the browser/middleware
      setTimeout(() => {
        router.replace(decodedFromPath);
        // router.refresh(); // May not be needed if middleware handles redirect correctly
      }, 100); // 100ms delay
    }
  }, [router, searchParams]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f0f2f5",
      }}
    >
      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      <p style={{ marginTop: "20px", fontSize: "18px", color: "#333" }}>
        Processing your authentication, please wait...
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            backgroundColor: "#f0f2f5",
          }}
        >
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p style={{ marginTop: "20px", fontSize: "18px", color: "#333" }}>
            Loading...
          </p>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
