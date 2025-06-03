import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
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
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return NextResponse.redirect(
      `${APP_URL}/auth/login?error=Invalid OAuth callback`
    );
  }

  try {
    const { callbackUrl, role: stateRole } = JSON.parse(state);
    const defaultRole = stateRole || "Developer";

    // 1. Exchange code for access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${APP_URL}/api/auth/oauth-callback/github`,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const { access_token } = tokenResponse.data;
    if (!access_token) {
      throw new Error("Failed to get GitHub access token.");
    }

    // 2. Fetch user data from GitHub
    const [userResponse, emailsResponse] = await Promise.all([
      axios.get("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${access_token}` },
      }),
      axios.get("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${access_token}` },
      }),
    ]);

    const githubUser = userResponse.data;
    const emails = emailsResponse.data;
    const primaryEmailObj = emails.find(
      (email: any) => email.primary && email.verified
    );

    if (!primaryEmailObj || !primaryEmailObj.email) {
      throw new Error("Primary verified email not found for GitHub user.");
    }
    const primaryEmail = primaryEmailObj.email;

    let user: IUser | null = await User.findOne({ email: primaryEmail });

    if (user) {
      if (user.authProvider !== "GITHUB" && user.authProvider !== null) {
        return NextResponse.redirect(
          `${callbackUrl}&error=Email already registered with ${user.authProvider}. Please log in with your original method.`
        );
      }
      if (!user.authProvider || user.authProvider !== "GITHUB") {
        user.authProvider = "GITHUB";
        user.authProviderId = githubUser.id.toString();
      }
      if (githubUser.avatar_url && !user.image) {
        user.image = githubUser.avatar_url;
      }
      if (githubUser.name && !user.name) {
        user.name = githubUser.name;
      }
      await user.save();
    } else {
      user = await User.create({
        email: primaryEmail,
        name: githubUser.name || githubUser.login || "User",
        image: githubUser.avatar_url,
        isVerified: true,
        role: defaultRole,
        authProvider: "GITHUB",
        authProviderId: githubUser.id.toString(),
      });
    }

    if (!user) {
      // This case should ideally not be reached if User.create is successful
      // or if an existing user is found and updated.
      console.error("User object is null after creation/update attempt.");
      throw new Error("Failed to process user information.");
    }

    const { accessToken, refreshToken } = generateTokens({
      userId: String(user._id),
      role: user.role as string,
    });

    const response = NextResponse.redirect(callbackUrl);
    setAuthCookies(response, accessToken, refreshToken);
    return response;
  } catch (error) {
    console.error("GitHub OAuth callback error:", error);
    const stateParam = searchParams.get("state");
    let redirectUrl = `${APP_URL}/auth/login?error=GitHub login failed`;
    if (stateParam) {
      try {
        const { callbackUrl: originalCallbackUrl } = JSON.parse(stateParam);
        if (originalCallbackUrl) {
          redirectUrl = `${originalCallbackUrl}&error=GitHub login failed`;
        }
      } catch (e) {
        // State parsing failed
      }
    }
    return NextResponse.redirect(redirectUrl);
  }
}
