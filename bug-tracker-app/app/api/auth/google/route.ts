import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { OAuth2Client } from "google-auth-library";
import connectDB from "../../../../lib/db/Connect";
import User from "../../../../models/userModel";
import { generateTokens, setAuthCookies } from "../../../../lib/auth";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { credential, mode = "login" } = await request.json();

    if (!credential) {
      return NextResponse.json(
        { success: false, message: "No credential provided" },
        { status: 400 }
      );
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 400 }
      );
    }

    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      if (mode === "login") {
        return NextResponse.json(
          {
            success: false,
            message: "No account found. Please register first.",
          },
          { status: 404 }
        );
      }
      // Create new user with default role
      user = await User.create({
        email,
        name,
        image: picture,
        isVerified: true,
        password: null,
        role: "Developer", // Default role for Google Sign-In users
      });
    } else if (mode === "register") {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists.",
        },
        { status: 400 }
      );
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({
      userId: user._id.toString(),
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        isVerified: user.isVerified,
      },
    });

    // Set auth cookies
    return setAuthCookies(response, accessToken, refreshToken);
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.json(
      { success: false, message: "Authentication failed" },
      { status: 500 }
    );
  }
}
