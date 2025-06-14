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
    const user = await User.findById(payload.userId).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  await connectDB();
  const token = request.cookies.get("accessToken")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const payload = verifyToken(token);
    const data = await request.json();
    const updates: any = {};
    if (data.name) updates.name = data.name;
    if (data.phone) updates.phone = data.phone;
    if (data.location) updates.location = data.location;
    if (data.timezone) updates.timezone = data.timezone;
    if (data.bio) updates.bio = data.bio;
    if (data.skills) updates.skills = data.skills;
    if (typeof data.notificationsEnabled === "boolean")
      updates.notificationsEnabled = data.notificationsEnabled;
    if (["light", "dark", "system"].includes(data.themePreference))
      updates.themePreference = data.themePreference;
    const user = await User.findByIdAndUpdate(payload.userId, updates, {
      new: true,
    }).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid token or data" },
      { status: 400 }
    );
  }
}
