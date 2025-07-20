export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import Bug, { IBug } from "@/models/bugModel";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db/Connect";
import mongoose from "mongoose";

interface LeanBug {
  _id: mongoose.Types.ObjectId;
  title: string;
  createdAt: Date;
  updatedAt?: Date;
}

export async function GET(request: NextRequest) {
  await connectDB();
  const token = request.cookies.get("accessToken")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const payload = verifyToken(token);
    if (!payload) {
      throw new Error("Invalid token payload");
    }
    const userId = new mongoose.Types.ObjectId(payload.userId);
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "5", 10);

    const createdBugs = await Bug.find<LeanBug>(
      { createdBy: userId },
      { _id: 1, title: 1, createdAt: 1 }
    )
      .lean()
      .exec();
    const createdActivities = createdBugs.map((bug) => ({
      id: (bug._id as mongoose.Types.ObjectId).toString(),
      type: "created",
      bugId: (bug._id as mongoose.Types.ObjectId).toString(),
      bugTitle: bug.title,
      timestamp: bug.createdAt,
    }));

    const assignedBugs = await Bug.find<LeanBug>(
      { assigneeId: userId },
      { _id: 1, title: 1, createdAt: 1 }
    )
      .lean()
      .exec();
    const assignedActivities = assignedBugs.map((bug) => ({
      id: (bug._id as mongoose.Types.ObjectId).toString(),
      type: "assigned",
      bugId: (bug._id as mongoose.Types.ObjectId).toString(),
      bugTitle: bug.title,
      timestamp: bug.createdAt,
    }));

    const resolvedBugs = await Bug.find<LeanBug>(
      { resolvedBy: userId },
      { _id: 1, title: 1, updatedAt: 1 }
    )
      .lean()
      .exec();
    const resolvedActivities = resolvedBugs.map((bug) => ({
      id: (bug._id as mongoose.Types.ObjectId).toString(),
      type: "resolved",
      bugId: (bug._id as mongoose.Types.ObjectId).toString(),
      bugTitle: bug.title,
      timestamp: bug.updatedAt || new Date(),
    }));

    const commentActivities = await Bug.aggregate([
      { $match: { "comments.author": userId } },
      { $unwind: "$comments" },
      { $match: { "comments.author": userId } },
      {
        $project: {
          id: { $toString: "$comments._id" },
          type: { $literal: "commented" },
          bugId: { $toString: "$_id" },
          bugTitle: "$title",
          timestamp: "$comments.createdAt",
        },
      },
    ]).exec();

    // Combine and sort activities
    const allActivities = [
      ...createdActivities,
      ...assignedActivities,
      ...resolvedActivities,
      ...commentActivities,
    ].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const recentActivities = allActivities.slice(0, limit);
    return NextResponse.json({ activities: recentActivities });
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json(
      { error: "Error fetching activity" },
      { status: 500 }
    );
  }
}
