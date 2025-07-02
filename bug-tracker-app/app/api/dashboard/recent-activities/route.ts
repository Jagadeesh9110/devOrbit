import { NextRequest, NextResponse } from "next/server";
import { getTokenFromCookies, verifyToken } from "../../../../lib/auth";
import connectDB from "../../../../lib/db/Connect";
import Bug, { IBug } from "../../../../models/bugModel";
import User from "../../../../models/userModel";
import mongoose from "mongoose";

interface IComment {
  text: string;
  author: mongoose.Types.ObjectId;
  mentions?: mongoose.Types.ObjectId[];
  attachments?: Array<{
    url: string;
    type: "image" | "file";
    name: string;
    size: number;
  }>;
  reactions?: Array<{
    emoji: string;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
  }>;
  timeSpent?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ILeanBug {
  _id: mongoose.Types.ObjectId;
  title: string;
  comments: IComment[];
  priority: "Low" | "Medium" | "High" | "Critical";
  severity: "Minor" | "Major" | "Critical";
  assigneeId?: mongoose.Types.ObjectId;
}

export async function GET(request: NextRequest) {
  try {
    console.log("Recent Activities: Connecting to database...");
    await connectDB();
    console.log("Recent Activities: Database connected");

    const { accessToken } = getTokenFromCookies(request);
    console.log(
      "Recent Activities: Access Token:",
      accessToken ? accessToken.substring(0, 20) + "..." : "None"
    );

    if (!accessToken) {
      console.log("Recent Activities: No access token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(accessToken);
    if (!payload || !payload.userId) {
      console.log("Recent Activities: Invalid token or missing userId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(payload.userId).select(
      "name role isVerified"
    );
    if (!user) {
      console.log("Recent Activities: User not found for ID:", payload.userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (!user.isVerified) {
      console.log(
        "Recent Activities: User not verified for ID:",
        payload.userId
      );
      return NextResponse.json({ error: "User not verified" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "5", 10);

    console.log(
      "Recent Activities: Fetching recent time logs with limit:",
      limit
    );

    const userObjectId = new mongoose.Types.ObjectId(payload.userId);

    // Fetch recent time logs
    const bugsWithLogsRaw = await Bug.find({
      "comments.author": userObjectId,
      "comments.timeSpent": { $exists: true, $ne: null },
    })
      .select("_id title comments")
      .limit(limit)
      .lean();

    const bugsWithLogs = bugsWithLogsRaw as unknown as ILeanBug[];

    console.log(
      "Recent Activities: Bugs with logs found:",
      bugsWithLogs.length
    );

    const recentTimeLogs = bugsWithLogs
      .flatMap((bug) =>
        bug.comments
          .filter(
            (comment) =>
              comment.author.toString() === payload.userId &&
              comment.timeSpent !== undefined &&
              comment.timeSpent !== null
          )
          .map((comment) => ({
            bugId: bug._id.toString(),
            title: bug.title,
            timeSpent: `${comment.timeSpent?.toFixed(1) ?? 0}h`,
            timestamp: comment.createdAt.toISOString(),
          }))
      )
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, limit);

    console.log(
      "Recent Activities: Processed recent time logs:",
      recentTimeLogs.length
    );

    // Fetch active work
    const activeWorkRaw = await Bug.find({
      assigneeId: userObjectId,
      status: { $nin: ["Closed", "Resolved"] },
    })
      .select("_id title priority severity")
      .limit(5)
      .lean();

    const activeWork = activeWorkRaw as unknown as ILeanBug[];

    console.log(
      "Recent Activities: Active work items found:",
      activeWork.length
    );

    return NextResponse.json({
      success: true,
      data: {
        recentTimeLogs,
        activeWork: activeWork.map((item) => ({
          id: item._id.toString(),
          title: item.title,
          priority: item.priority.toLowerCase(),
          severity: item.severity,
        })),
      },
    });
  } catch (error: any) {
    console.error("Recent Activities error:", error.message, error.stack);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch activities",
      },
      { status: 500 }
    );
  }
}
