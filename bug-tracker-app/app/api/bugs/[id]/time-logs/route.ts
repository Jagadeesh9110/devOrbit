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
    await connectDB();

    const { accessToken } = getTokenFromCookies(request);
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(accessToken);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { timeSpent, note } = await request.json();
    if (!timeSpent || typeof timeSpent !== "number" || timeSpent <= 0) {
      return NextResponse.json(
        { error: "Invalid timeSpent value" },
        { status: 400 }
      );
    }

    const bug = await Bug.findById(params.id);
    if (!bug) {
      return NextResponse.json({ error: "Bug not found" }, { status: 404 });
    }

    const comment = {
      author: user._id,
      text: note || `Logged ${timeSpent.toFixed(1)}h`,
      timeSpent,
      createdAt: new Date(),
    };

    bug.comments.push(comment);
    await bug.save();

    return NextResponse.json({
      success: true,
      data: {
        commentId: bug.comments[bug.comments.length - 1]._id,
        timeSpent,
        note: comment.text,
      },
    });
  } catch (error: any) {
    console.error("Time-logs POST error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to log time" },
      {
        status: error.message.includes("not found") ? 404 : 500,
      }
    );
  }
}
