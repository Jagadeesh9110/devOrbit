export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/Connect";
import Bug from "@/models/bugModel";
import { Team } from "@/models/teamModel";
import User from "@/models/userModel";

export async function GET(request: NextRequest) {
  await connectDB();

  try {
    const totalBugs = await Bug.countDocuments({});
    const totalTeams = await Team.countDocuments({});
    const resolvedIssues = await Bug.countDocuments({ status: "Closed" });
    const activeUsers = await User.countDocuments({ isActive: true });

    return NextResponse.json({
      stats: {
        bugsTracked: totalBugs,
        teams: totalTeams,
        resolvedIssues,
        activeUsers,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch homepage stats" },
      { status: 500 }
    );
  }
}
