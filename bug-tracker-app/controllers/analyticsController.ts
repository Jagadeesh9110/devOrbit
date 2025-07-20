// controllers/analyticsController.ts

import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import Bug from "@/models/bugModel";
import User from "@/models/userModel";
import { Team } from "@/models/teamModel";
import connectDB from "@/lib/db/Connect";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import {
  aiService,
  AIAnalyticsData,
  AITeamInsights,
} from "@/lib/services/AiService";

interface BugTrendData {
  name: string;
  reported: number;
  resolved: number;
  open: number;
}

interface PriorityData {
  name: string;
  value: number;
  color: string;
}

interface ResolutionTimeData {
  name: string;
  avgTime: number;
}

interface TeamPerformanceData {
  name: string;
  resolved: number;
  pending: number;
}

interface AnalyticsStats {
  totalBugs: number;
  avgResolutionTime: string;
  activeBugs: number;
  resolvedBugs: number;
  aiInsights?: AIAnalyticsData;
}

// Helper to get user's project IDs
const getUserProjectIds = async (
  userId: string
): Promise<mongoose.Types.ObjectId[]> => {
  const user = await User.findById(userId).select("teamIds");

  if (!user || !user.teamIds || user.teamIds.length === 0) {
    return [];
  }

  const teams = await Team.find({ _id: { $in: user.teamIds } }).select(
    "projects"
  );

  return teams.flatMap((team) => team.projects);
};

export const getStats = async (request: NextRequest) => {
  await connectDB();
  const { accessToken } = getTokenFromCookies(request);
  if (!accessToken) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const payload = verifyToken(accessToken);
  if (!payload || !payload.userId) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const projectIds = await getUserProjectIds(payload.userId);

    if (projectIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          totalBugs: 0,
          activeBugs: 0,
          resolvedBugs: 0,
          avgResolutionTime: "N/A",
          aiInsights: undefined,
        },
      });
    }

    const [totalBugs, activeBugs, resolvedBugs, resolutionTimes] =
      await Promise.all([
        Bug.countDocuments({ projectId: { $in: projectIds } }),
        Bug.countDocuments({
          projectId: { $in: projectIds },
          status: { $in: ["Open", "In Progress"] },
        }),
        Bug.countDocuments({
          projectId: { $in: projectIds },
          status: "Resolved",
        }),
        Bug.aggregate([
          {
            $match: {
              projectId: { $in: projectIds },
              status: "Resolved",
              updatedAt: { $exists: true },
            },
          },
          {
            $project: {
              resolutionTime: {
                $divide: [
                  { $subtract: ["$updatedAt", "$createdAt"] },
                  1000 * 60 * 60 * 24,
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              avgResolutionTime: { $avg: "$resolutionTime" },
            },
          },
        ]),
      ]);

    const avgResolutionTime = resolutionTimes[0]?.avgResolutionTime
      ? `${resolutionTimes[0].avgResolutionTime.toFixed(1)} days`
      : "N/A";

    // Generate AI Insights and adapt to AIAnalyticsData interface
    const teamInsights: AITeamInsights = await aiService.generateTeamInsights(
      payload.userId
    );

    const aiInsights: AIAnalyticsData = {
      insights: teamInsights.performanceAnalysis,
      recommendations: teamInsights.workloadRecommendations,
      trends: teamInsights.productivityTrends,
      predictions: teamInsights.skillGaps,
      confidence: teamInsights.confidence || 85,
      generatedAt: new Date(),
    };

    const stats: AnalyticsStats = {
      totalBugs,
      avgResolutionTime,
      activeBugs,
      resolvedBugs,
      aiInsights,
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    console.error("Error fetching stats:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: "Failed to fetch stats" },
      { status: 500 }
    );
  }
};

export const getBugTrends = async (request: NextRequest) => {
  await connectDB();
  const { accessToken } = getTokenFromCookies(request);
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = verifyToken(accessToken);
  if (!payload || !payload.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const timeRange = request.nextUrl.searchParams.get("timeRange") || "30d";
    const days =
      { "7d": 7, "90d": 90, "1y": 365 }[timeRange as "7d" | "90d" | "1y"] || 30;
    const projectIds = await getUserProjectIds(payload.userId);

    if (projectIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const trendData: BugTrendData[] = await Bug.aggregate([
      {
        $match: {
          projectId: { $in: projectIds },
          createdAt: {
            $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          reported: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] },
          },
          open: {
            $sum: {
              $cond: [{ $in: ["$status", ["Open", "In Progress"]] }, 1, 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { name: "$_id", reported: 1, resolved: 1, open: 1, _id: 0 } },
    ]);

    return NextResponse.json({ success: true, data: trendData });
  } catch (error: any) {
    console.error("Error fetching bug trends:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: "Failed to fetch bug trends" },
      { status: 500 }
    );
  }
};

export const getPriorityBreakdown = async (request: NextRequest) => {
  await connectDB();
  const { accessToken } = getTokenFromCookies(request);
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = verifyToken(accessToken);
  if (!payload || !payload.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projectIds = await getUserProjectIds(payload.userId);
    if (projectIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const priorityData = await Bug.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      { $group: { _id: "$priority", value: { $sum: 1 } } },
      { $project: { name: "$_id", value: 1, _id: 0 } },
    ]);

    const priorityColors: { [key: string]: string } = {
      Critical: "#EF4444",
      High: "#F97316",
      Medium: "#EAB308",
      Low: "#22C55E",
    };

    const formattedData: PriorityData[] = priorityData.map((item) => ({
      ...item,
      color: priorityColors[item.name] || "#8884d8",
    }));

    return NextResponse.json({ success: true, data: formattedData });
  } catch (error: any) {
    console.error(
      "Error fetching priority breakdown:",
      error.message,
      error.stack
    );
    return NextResponse.json(
      { success: false, message: "Failed to fetch priority breakdown" },
      { status: 500 }
    );
  }
};

export const getTeamPerformance = async (request: NextRequest) => {
  await connectDB();
  const { accessToken } = getTokenFromCookies(request);
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = verifyToken(accessToken);
  if (!payload || !payload.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projectIds = await getUserProjectIds(payload.userId);
    if (projectIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: { teamData: [], aiTeamInsights: null },
      });
    }

    const teamData: TeamPerformanceData[] = await Bug.aggregate([
      {
        $match: {
          projectId: { $in: projectIds },
          assigneeId: { $exists: true },
        },
      },
      {
        $group: {
          _id: "$assigneeId",
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] },
          },
          pending: {
            $sum: {
              $cond: [{ $in: ["$status", ["Open", "In Progress"]] }, 1, 0],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $project: { name: "$user.name", resolved: 1, pending: 1, _id: 0 } },
    ]);

    const aiTeamInsights = await aiService.generateTeamInsights(payload.userId);

    return NextResponse.json({
      success: true,
      data: { teamData, aiTeamInsights },
    });
  } catch (error: any) {
    console.error(
      "Error fetching team performance:",
      error.message,
      error.stack
    );
    return NextResponse.json(
      { success: false, message: "Failed to fetch team performance" },
      { status: 500 }
    );
  }
};

export const getResolutionTimes = async (request: NextRequest) => {
  await connectDB();
  const { accessToken } = getTokenFromCookies(request);
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = verifyToken(accessToken);
  if (!payload || !payload.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projectIds = await getUserProjectIds(payload.userId);

    if (projectIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const resolutionData: ResolutionTimeData[] = await Bug.aggregate([
      {
        $match: {
          projectId: { $in: projectIds },
          status: "Resolved",
          updatedAt: { $exists: true },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$updatedAt" } },
          avgTime: {
            $avg: {
              $divide: [
                { $subtract: ["$updatedAt", "$createdAt"] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          name: "$_id",
          avgTime: { $round: ["$avgTime", 1] },
          _id: 0,
        },
      },
    ]);

    return NextResponse.json({ success: true, data: resolutionData });
  } catch (error: any) {
    console.error(
      "Error fetching resolution times:",
      error.message,
      error.stack
    );
    return NextResponse.json(
      { success: false, message: "Failed to fetch resolution times" },
      { status: 500 }
    );
  }
};
