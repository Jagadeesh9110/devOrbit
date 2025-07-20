import { NextRequest, NextResponse } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db/Connect";
import { Team } from "@/models/teamModel";
import User from "@/models/userModel";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { accessToken } = getTokenFromCookies(request);
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(accessToken);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await User.findById(payload.userId).select("role");
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let teams;
    if (currentUser.role === "Admin") {
      teams = await Team.find().populate({
        path: "members.userId",
        select: "name email",
      });
    } else {
      teams = await Team.find({
        "members.userId": payload.userId,
      }).populate({
        path: "members.userId",
        select: "name email",
      });
    }

    return NextResponse.json({ success: true, data: teams });
  } catch (error: any) {
    console.error("Teams GET error:", error.message, error.stack);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch teams",
      },
      { status: 500 }
    );
  }
}
