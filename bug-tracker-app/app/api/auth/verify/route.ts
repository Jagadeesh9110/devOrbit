import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db/Connect";

export async function GET(request: NextRequest) {
  await connectDB();
  const token = request.cookies.get("accessToken")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const payload = verifyToken(token);
    const user = await User.findById(payload?.userId).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
