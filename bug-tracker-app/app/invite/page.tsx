"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/auth";
import Link from "next/link";

interface InvitationData {
  invitation: {
    _id: string;
    email: string;
    role: string;
    status: string;
    expiresAt: string;
    teamId: {
      _id: string;
      name: string;
      description?: string;
    };
    invitedBy: {
      name: string;
      email: string;
    };
  };
  isExpired: boolean;
  isValid: boolean;
}

interface User {
  _id: string;
  email: string;
  name: string;
}

export default function InvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("No invitation token provided in the link.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const inviteResponse = await fetch(`/api/invite/${token}`);
        const inviteData = await inviteResponse.json();

        if (!inviteResponse.ok) {
          throw new Error(
            inviteData.error || "Failed to fetch invitation details."
          );
        }

        setInvitation(inviteData);

        try {
          const userResponse = await fetchWithAuth("/api/auth/verify");
          if (!userResponse.error) {
            setUser(userResponse);
          }
        } catch {
          console.log("User not authenticated");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    setAccepting(true);
    setError(null);

    try {
      const response = await fetch(`/api/invite/${token}/accept`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to accept invitation");

      setSuccess("Successfully joined the team! Redirecting...");
      setTimeout(() => {
        router.push(`/dashboard/team`);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!token) return;
    setDeclining(true);
    setError(null);

    try {
      const response = await fetch(`/api/invite/${token}/decline`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to decline invitation");

      setSuccess("Invitation declined successfully. Redirecting...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeclining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading invitation details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-700">
        <p className="text-lg font-semibold">Error</p>
        <p className="mb-4">{error}</p>
        <Link href="/dashboard" className="text-blue-600 underline">
          Go back to dashboard
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 text-green-700">
        <p className="text-lg font-semibold">{success}</p>
      </div>
    );
  }

  const { invitation: invite } = invitation!;
  const expired = invitation!.isExpired;
  const isValid = invitation!.isValid;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-xl w-full bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-2 text-blue-700">
          Team Invitation
        </h2>
        <p className="text-gray-700 mb-4">
          <strong>{invite.invitedBy.name}</strong> ({invite.invitedBy.email})
          has invited you to join the <strong>{invite.teamId.name}</strong>{" "}
          team.
        </p>
        <div className="mb-4 text-sm text-gray-600 space-y-1">
          <p>
            <strong>Invited Email:</strong> {invite.email}
          </p>
          <p>
            <strong>Your Role:</strong> {invite.role}
          </p>
          <p>
            <strong>Team Description:</strong>{" "}
            {invite.teamId.description || "No description provided"}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
          </p>
          <p>
            <strong>Expires:</strong>{" "}
            {new Date(invite.expiresAt).toLocaleString()}
          </p>
        </div>

        {expired && (
          <p className="text-red-600 font-medium mb-4">
            This invitation has expired. Please request a new one from the team
            Admin.
          </p>
        )}

        {!expired && !isValid && (
          <p className="text-red-600 font-medium mb-4">
            This invitation is no longer valid (already accepted or declined).
          </p>
        )}

        {!expired &&
          isValid &&
          user &&
          user.email.toLowerCase() === invite.email.toLowerCase() && (
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded disabled:bg-green-400"
              >
                {accepting ? "Joining..." : "Accept Invitation"}
              </button>
              <button
                onClick={handleDecline}
                disabled={declining}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded disabled:bg-gray-200"
              >
                {declining ? "Declining..." : "Decline"}
              </button>
            </div>
          )}

        {!user && (
          <div className="text-sm text-gray-500 mt-6 space-y-2">
            <p>
              Please{" "}
              <Link
                href={`/login?callbackUrl=/invite?token=${token}`}
                className="text-blue-600 underline"
              >
                log in
              </Link>{" "}
              with the email address this invitation was sent to ({invite.email}
              ).
            </p>
            <p>
              Don’t have an account?{" "}
              <Link
                href={`/auth/register?email=${encodeURIComponent(
                  invite.email
                )}&callbackUrl=/invite?token=${token}`}
                className="text-blue-600 underline"
              >
                Sign up here
              </Link>{" "}
              with the invited email.
            </p>
          </div>
        )}

        {user && user.email.toLowerCase() !== invite.email.toLowerCase() && (
          <p className="text-red-600 font-medium mt-6">
            Email mismatch: You are logged in as {user.email}, but the
            invitation is for {invite.email}. Please log in with the correct
            email.
          </p>
        )}
      </div>
    </div>
  );
}
