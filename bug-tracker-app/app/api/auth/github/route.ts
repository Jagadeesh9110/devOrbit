import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import connectDB from "@/lib/db/Connect";
import { generateTokens, setAuthCookies } from "@/lib/auth";
import { IUser } from "@/models/userModel";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

export async function GET(request: NextRequest) {
  await connectDB();
  const searchParams = request.nextUrl.searchParams;
  const callbackUrl = searchParams.get("callbackUrl");
  const role = searchParams.get("role") || "Developer"; // Default role

  if (!GITHUB_CLIENT_ID) {
    return NextResponse.json(
      { success: false, message: "GitHub Client ID not configured." },
      { status: 500 }
    );
  }
  if (!callbackUrl) {
    return NextResponse.json(
      { success: false, message: "Callback URL is missing." },
      { status: 400 }
    );
  }

  const state = JSON.stringify({ callbackUrl, role });
  const githubOAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${APP_URL}/api/auth/oauth-callback/github&scope=user:email&state=${encodeURIComponent(
    state
  )}`;

  return NextResponse.redirect(githubOAuthUrl);
}

// POST route is removed as it was for the popup flow communication
// The redirect flow will be handled by a new callback route (e.g., /api/auth/oauth-callback/github)
