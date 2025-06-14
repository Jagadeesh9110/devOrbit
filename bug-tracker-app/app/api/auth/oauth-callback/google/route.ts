import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import User from "@/models/userModel";
import connectDB from "@/lib/db/Connect";
import { generateTokens, setAuthCookies } from "@/lib/auth";
import { IUser } from "@/models/userModel";

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth-callback/google`
);

export async function GET(request: NextRequest) {
  await connectDB();
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/login?error=Invalid OAuth callback`
    );
  }

  try {
    const { callbackUrl, role: stateRole } = JSON.parse(state);
    const defaultRole = stateRole || "Developer";

    const { tokens: googleTokens } = await googleClient.getToken(code);
    if (!googleTokens.id_token) {
      throw new Error("Google ID token not found.");
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: googleTokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email || !payload.sub) {
      throw new Error("Invalid Google token payload.");
    }

    let user = (await User.findOne({ email: payload.email })) as IUser | null;

    if (user) {
      if (user.authProvider !== "GOOGLE" && user.authProvider !== null) {
        return NextResponse.redirect(
          `${callbackUrl}&error=Email already registered with ${user.authProvider}. Please log in with your credentials.`
        );
      }
      if (!user.authProvider || user.authProvider !== "GOOGLE") {
        user.authProvider = "GOOGLE";
        user.authProviderId = payload.sub;
      }
      if (payload.picture && !user.image) {
        user.image = payload.picture;
      }
      if (payload.name && !user.name) {
        user.name = payload.name;
      }
      await user.save();
    } else {
      user = (await User.create({
        email: payload.email,
        name: payload.name || "User",
        image: payload.picture,
        isVerified: true,
        role: defaultRole,
        authProvider: "GOOGLE",
        authProviderId: payload.sub,
      })) as IUser;
    }

    if (!user) {
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
    console.error("Google OAuth callback error:", error);
    const stateParam = searchParams.get("state");
    let redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/login?error=Google login failed`;
    if (stateParam) {
      try {
        const { callbackUrl: originalCallbackUrl } = JSON.parse(stateParam);
        if (originalCallbackUrl) {
          redirectUrl = `${originalCallbackUrl}&error=Google login failed`;
        }
      } catch (e) {
        console.log("Error parsing state paramerter:", e);
      }
    }
    return NextResponse.redirect(redirectUrl);
  }
}
