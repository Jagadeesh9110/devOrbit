import { NextRequest, NextResponse } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db/Connect";
import Bug from "@/models/bugModel";
import User from "@/models/userModel";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("Time Logs: Connecting to database...");
    await connectDB();
    console.log("Time Logs: Database connected");

    const { accessToken } = getTokenFromCookies(request);
    if (!accessToken) {
      console.log("Time Logs: No access token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(accessToken);
    if (!payload || !payload.userId) {
      console.log("Time Logs: Invalid token or missing userId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(payload.userId).select("name role");
    if (!user || !user.isVerified) {
      console.log("Time Logs: User not found or unverified");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { timeSpent, comment } = await request.json();

    if (!timeSpent || timeSpent < 0) {
      console.log("Time Logs: Invalid timeSpent:", timeSpent);
      return NextResponse.json(
        { error: "Valid timeSpent is required" },
        { status: 400 }
      );
    }

    const bug = await Bug.findById(id);
    if (!bug) {
      console.log("Time Logs: Bug not found:", id);
      return NextResponse.json({ error: "Bug not found" }, { status: 404 });
    }

    bug.comments.push({
      text: comment || `Logged ${timeSpent}h`,
      author: payload.userId,
      timeSpent,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await bug.save();
    console.log("Time Logs: Added time log for bug:", id);

    return NextResponse.json({
      success: true,
      message: "Time logged successfully",
    });
  } catch (error: any) {
    console.error("Time Logs error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to log time" },
      { status: 500 }
    );
  }
}
