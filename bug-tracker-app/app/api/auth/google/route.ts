import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import connectDB from "../../../../lib/db/Connect";
import User from "../../../../models/userModel";
import { generateTokens, setAuthCookies } from "../../../../lib/auth";

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { credential, mode } = await request.json();

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error("Invalid token payload");
    }

    const { email, name, picture, sub: googleId } = payload;

    if (!email) {
      throw new Error("Email not found in token");
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user with default role and no password
      const newUser = {
        email,
        name: name || email.split("@")[0],
        image: picture,
        isVerified: true,
        role: "Developer",
        authProvider: "GOOGLE" as const,
        authProviderId: googleId,
        verificationToken: null,
        verificationTokenExpiry: null,
        resetToken: null,
        resetTokenExpiry: null,
        teamIds: [],
        badges: [],
      };

      user = await User.create(newUser);
    }

    const { accessToken, refreshToken } = generateTokens({
      userId: user._id.toString(),
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
    });

    return setAuthCookies(response, accessToken, refreshToken);
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Authentication failed",
      },
      { status: 401 }
    );
  }
}
