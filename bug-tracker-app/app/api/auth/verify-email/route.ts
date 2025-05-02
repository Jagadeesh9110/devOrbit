import { NextResponse } from "next/server";
import { verifyEmail } from "../../../../controllers/authController";
import connectDB from "../../../../lib/dbConnect";
import jwt from "jsonwebtoken";
import User from "../../../../models/userModel";

export async function POST(req: Request) {
  try {
    const result = await verifyEmail(req);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "An unknown error occurred" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token is required" },
        { status: 400 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_VERIFICATION_TOKEN as string
    ) as jwt.JwtPayload & { userId: string };

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Update user verification status
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    return NextResponse.json(
      { success: true, message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { success: false, message: "Invalid or expired token" },
      { status: 400 }
    );
  }
}
