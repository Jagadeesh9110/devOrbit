import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import connectDB from "@/lib/db/Connect";

export async function GET(request: NextRequest) {
  await connectDB();
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }
  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }
    if (
      user.verificationTokenExpiry &&
      user.verificationTokenExpiry < new Date()
    ) {
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();
    return NextResponse.json({ message: "Email verified successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Error verifying email" },
      { status: 500 }
    );
  }
}
