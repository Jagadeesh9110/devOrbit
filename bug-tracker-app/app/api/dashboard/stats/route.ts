import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/Connect";
import { Bug } from "@/models/bugModel";
import User from "@/models/userModel";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const totalBugs = await Bug.countDocuments();

    const openBugs = await Bug.countDocuments({
      status: { $in: ["Open", "In Progress"] },
    });

    const resolvedBugs = await Bug.countDocuments({
      status: { $in: ["Resolved", "Closed"] },
    });

    const teamMembers = await User.countDocuments();

    const recentBugs = await Bug.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("_id title status priority createdAt")
      .lean();

    return NextResponse.json({
      stats: {
        totalBugs,
        openBugs,
        resolvedBugs,
        teamMembers,
      },
      recentBugs,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
