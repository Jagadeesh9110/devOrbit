export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import connectDB from "@/lib/db/Connect";

export async function POST(request: NextRequest) {
  await connectDB();
  const { token, password } = await request.json();
  if (!token || !password) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() },
  });
  if (!user) {
    return NextResponse.json(
      { message: "Invalid or expired token" },
      { status: 400 }
    );
  }
  user.password = password;
  user.resetToken = null;
  user.resetTokenExpiry = null;
  await user.save();
  return NextResponse.json({
    message: "Password reset successful! You can now log in.",
  });
}
