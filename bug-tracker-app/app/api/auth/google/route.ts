import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import connectDB from "../../../../lib/dbConnect";
import User from "../../../../models/userModel";
import { generateToken } from "../../../../lib/auth";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

export async function POST(req: Request) {
  try {
    await connectDB();
    const { credential, mode = "login" } = await req.json();

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
      user = await User.create({
        email,
        name,
        image: picture,
        isVerified: true,
        password: null,
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

    // Generate JWT token
    const token = generateToken(user._id);

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      token,
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.json(
      { success: false, message: "Authentication failed" },
      { status: 500 }
    );
  }
}
