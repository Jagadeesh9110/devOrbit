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
    const currentUser = await User.findById(payload?.userId);

    if (
      !currentUser ||
      !["Admin", "ProjectManager"].includes(currentUser.role)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await User.find().select("-password");
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
