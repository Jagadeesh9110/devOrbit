"use client";

import { useRouter } from "next/navigation";
import { Bug } from "lucide-react";

export default function VerifyEmailErrorPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col items-center">
          <Bug className="h-12 w-12 text-purple-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Verification Failed
          </h2>

          <div className="mt-4 text-center">
            <div className="rounded-full h-12 w-12 bg-red-100 flex items-center justify-center mx-auto">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="mt-2 text-red-600">Email verification failed</p>
            <p className="mt-1 text-gray-500">
              The verification link you used is invalid or has expired. Please
              try logging in or request a new verification link.
            </p>
            <div className="mt-6 space-y-3">
              <button
                onClick={() => router.push("/auth/login")}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Go to Login
              </button>
              <button
                onClick={() => router.push("/auth/register")}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-purple-300 text-sm font-medium rounded-md text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Register New Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
