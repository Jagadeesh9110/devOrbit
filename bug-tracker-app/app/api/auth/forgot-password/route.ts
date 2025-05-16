import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import connectDB from "@/lib/db/Connect";
import crypto from "crypto";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(request: NextRequest) {
  await connectDB();
  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ message: "Email is required" }, { status: 400 });
  }
  const user = await User.findOne({ email });
  // Always respond the same for security
  if (!user) {
    return NextResponse.json({
      message: "If that email exists, a reset link has been sent.",
    });
  }
  // Generate token
  const token = crypto.randomBytes(32).toString("hex");
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 1000 * 60 * 30; // 30 min
  await user.save();

  // Send email
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: "Reset your password",
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 30 minutes.</p>`,
  });

  return NextResponse.json({
    message: "If that email exists, a reset link has been sent.",
  });
}
