import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/Connect";
import User from "@/models/userModel";
import Bug from "@/models/bugModel";
import { Team } from "@/models/teamModel";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    console.log("Metrics: Connecting to database...");
    await connectDB();
    console.log("Metrics: Database connected");

    const { accessToken } = getTokenFromCookies(request);
    console.log(
      "Metrics: Access Token:",
      accessToken ? accessToken.substring(0, 20) + "..." : "None"
    );

    if (!accessToken) {
      console.log("Metrics: No access token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(accessToken);
    if (!payload || !payload.userId) {
      console.log("Metrics: Invalid token or missing userId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(payload.userId).select(
      "name role isVerified teamIds"
    );
    console.log(
      "Metrics: User found:",
      user ? { id: user._id, isVerified: user.isVerified } : "null"
    );
    if (!user) {
      console.log("Metrics: User not found in database");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (!user.isVerified) {
      console.log("Metrics: User not verified");
      return NextResponse.json({ error: "User not verified" }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Bugs fixed today by the user
    const bugsFixedToday = await Bug.countDocuments({
      assigneeId: user._id,
      status: "Resolved",
      updatedAt: { $gte: today },
    });

    // Average fix time
    const resolvedBugsToday = await Bug.find({
      assigneeId: user._id,
      status: "Resolved",
      updatedAt: { $gte: today },
    }).select("createdAt updatedAt");

    const totalFixTime = resolvedBugsToday.reduce((sum, bug) => {
      const fixTime =
        (bug.updatedAt.getTime() - bug.createdAt.getTime()) / (1000 * 60 * 60); // in hours
      return sum + fixTime;
    }, 0);

    const avgFixTime =
      resolvedBugsToday.length > 0
        ? (totalFixTime / resolvedBugsToday.length).toFixed(1) + " hours"
        : "0.0 hours";

    // Critical bugs open assigned to the user
    const criticalBugsOpen = await Bug.countDocuments({
      assigneeId: user._id,
      severity: "Critical",
      status: { $nin: ["Resolved", "Closed"] },
    });

    // Time logged today by the user
    const timeLogsToday = await Bug.aggregate([
      {
        $match: {
          "comments.author": new mongoose.Types.ObjectId(user._id),
          "comments.createdAt": { $gte: today },
        },
      },
      { $unwind: "$comments" },
      {
        $match: {
          "comments.author": new mongoose.Types.ObjectId(user._id),
          "comments.createdAt": { $gte: today },
          "comments.timeSpent": { $exists: true },
        },
      },
      { $group: { _id: null, totalTime: { $sum: "$comments.timeSpent" } } },
    ]);

    const timeLoggedToday = timeLogsToday[0]?.totalTime
      ? timeLogsToday[0].totalTime.toFixed(1) + "h"
      : "0.0h";

    // Team velocity: Percentage of bugs resolved today by the team
    const teams = await Team.find({ _id: { $in: user.teamIds } });
    const teamMemberIds = teams.flatMap((team: any) =>
      team.members.map((member: any) => member.userId)
    );

    const teamBugsResolvedToday = await Bug.countDocuments({
      assigneeId: { $in: teamMemberIds },
      status: "Resolved",
      updatedAt: { $gte: today },
    });

    const teamBugsOpenStartOfDay = await Bug.countDocuments({
      assigneeId: { $in: teamMemberIds },
      status: { $nin: ["Resolved", "Closed"] },
      createdAt: { $lt: today },
    });

    const teamVelocity =
      teamBugsOpenStartOfDay > 0
        ? ((teamBugsResolvedToday / teamBugsOpenStartOfDay) * 100).toFixed(0) +
          "%"
        : "0%";

    const metricsData = {
      bugsFixedToday,
      avgFixTime,
      criticalBugsOpen,
      teamVelocity,
      timeLoggedToday,
    };

    return NextResponse.json({ success: true, data: metricsData });
  } catch (error: any) {
    console.error("Metrics error:", error.message, error.stack);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch metrics",
      },
      { status: 500 }
    );
  }
}
