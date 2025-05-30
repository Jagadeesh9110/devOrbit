import { NextRequest, NextResponse } from "next/server";
import { Bug } from "@/models/bugModel";
import connectDB from "@/lib/db/Connect";
import { verifyToken, getTokenFromCookies } from "@/lib/auth";
import mongoose from "mongoose";

interface BugAggregationResult {
  _id: any;
  count: number;
  avgResolutionTime?: number;
  severity?: string;
  status?: string;
  assignee?: string;
  createdAt?: Date;
  resolvedAt?: Date;
}

export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    if (!mongoose.connection.readyState) {
      await connectDB();
    }

    // Get token from cookies (middleware ensures this exists)
    const { accessToken } = getTokenFromCookies(request);
    if (!accessToken) {
      return NextResponse.json(
        { error: "Authentication token not found" },
        { status: 401 }
      );
    }

    // Verify token
    let userId: string;
    try {
      const decoded = verifyToken(accessToken);
      userId = decoded.userId;
      if (!userId) {
        throw new Error("Invalid token payload");
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid or expired authentication token" },
        { status: 401 }
      );
    }

    // Parse time range
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "30d";

    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    try {
      const [
        totalBugs,
        resolvedBugs,
        criticalBugs,
        avgResolutionTime,
        bugTrends,
        resolutionRates,
        severityDistribution,
        teamPerformance,
        topBugs,
      ] = await Promise.all([
        // Total bugs count
        Bug.countDocuments({
          createdAt: { $gte: startDate },
        }),

        // Resolved bugs count
        Bug.countDocuments({
          createdAt: { $gte: startDate },
          status: "Resolved",
        }),

        // Critical bugs count
        Bug.countDocuments({
          createdAt: { $gte: startDate },
          severity: "Critical",
        }),

        // Average resolution time
        Bug.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate },
              status: "Resolved",
              updatedAt: { $exists: true },
            },
          },
          {
            $addFields: {
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
              avgTime: { $avg: "$resolutionTime" },
            },
          },
        ]),

        // Bug trends by date and status
        Bug.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate },
            },
          },
          {
            $group: {
              _id: {
                date: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt",
                  },
                },
                status: "$status",
              },
              count: { $sum: 1 },
            },
          },
          {
            $sort: { "_id.date": 1 },
          },
        ]),

        // Resolution rates by date
        Bug.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                },
              },
              total: { $sum: 1 },
              resolved: {
                $sum: {
                  $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0],
                },
              },
            },
          },
          {
            $addFields: {
              rate: {
                $multiply: [{ $divide: ["$resolved", "$total"] }, 100],
              },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ]),

        // Severity distribution
        Bug.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate },
            },
          },
          {
            $group: {
              _id: "$severity",
              count: { $sum: 1 },
            },
          },
        ]),

        // Team performance
        Bug.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate },
              assigneeId: { $exists: true, $ne: null },
              status: "Resolved",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "assigneeId",
              foreignField: "_id",
              as: "assignee",
            },
          },
          {
            $unwind: "$assignee",
          },
          {
            $addFields: {
              resolutionTime: {
                $divide: [
                  { $subtract: ["$updatedAt", "$createdAt"] },
                  1000 * 60 * 60,
                ],
              },
            },
          },
          {
            $group: {
              _id: "$assignee.name",
              avgResolutionTime: { $avg: "$resolutionTime" },
              bugsResolved: { $sum: 1 },
            },
          },
          {
            $sort: { bugsResolved: -1 },
          },
          {
            $limit: 10,
          },
        ]),

        // Top critical/high priority bugs
        Bug.find({
          createdAt: { $gte: startDate },
          status: { $in: ["Open", "In Progress"] },
          severity: { $in: ["Critical", "High"] },
        })
          .populate("assigneeId", "name")
          .populate("createdBy", "name")
          .sort({ severity: 1, createdAt: -1 })
          .limit(10)
          .lean(),
      ]);

      // Process bug trends data
      const trendMap = new Map<
        string,
        { newBugs: number; resolvedBugs: number }
      >();

      bugTrends.forEach((item: any) => {
        const date = item._id.date;
        if (!trendMap.has(date)) {
          trendMap.set(date, { newBugs: 0, resolvedBugs: 0 });
        }
        if (item._id.status === "Resolved") {
          trendMap.get(date)!.resolvedBugs += item.count;
        } else {
          trendMap.get(date)!.newBugs += item.count;
        }
      });

      const sortedDates = Array.from(trendMap.keys()).sort();
      const bugTrendsData = {
        dates: sortedDates,
        newBugs: sortedDates.map((date) => trendMap.get(date)?.newBugs || 0),
        resolvedBugs: sortedDates.map(
          (date) => trendMap.get(date)?.resolvedBugs || 0
        ),
      };

      // Process resolution rates data
      const resolutionRatesData = {
        dates: resolutionRates.map((item: any) => item._id),
        rates: resolutionRates.map(
          (item: any) => Math.round(item.rate * 100) / 100
        ),
      };

      // Process severity distribution
      const severityMap: Record<string, number> = {
        Critical: 0,
        High: 0,
        Major: 0,
        Minor: 0,
      };

      severityDistribution.forEach((item: any) => {
        if (item._id && item._id in severityMap) {
          severityMap[item._id] = item.count;
        }
      });

      // Process team performance data
      const teamPerformanceData = {
        members: teamPerformance.map((item: any) => item._id || "Unassigned"),
        avgResolutionTimes: teamPerformance.map(
          (item: any) => Math.round((item.avgResolutionTime || 0) * 10) / 10
        ),
        bugsResolved: teamPerformance.map(
          (item: any) => item.bugsResolved || 0
        ),
      };

      // Process top bugs data
      const topBugsData = topBugs.map((bug: any) => ({
        id: bug._id.toString(),
        title: bug.title || "Untitled",
        severity: bug.severity || "Unknown",
        assignee: bug.assigneeId?.name || "Unassigned",
        reported: formatTimeAgo(bug.createdAt),
        status: bug.status || "Unknown",
      }));

      // Get additional counts for performance metrics
      const totalBugsCount = await Bug.countDocuments({});
      const openBugsCount = await Bug.countDocuments({ status: "Open" });
      const inProgressBugsCount = await Bug.countDocuments({
        status: "In Progress",
      });

      // Calculate performance metrics
      const performanceMetrics = {
        detectionEfficiency:
          totalBugs > 0 ? Math.round((resolvedBugs / totalBugs) * 100) : 0,
        firstResponseTime: 2.5, // This should be calculated from actual data
        bugFixRate:
          totalBugsCount > 0
            ? Math.round((resolvedBugs / totalBugsCount) * 100)
            : 0,
        developerWorkload:
          Math.round(
            ((openBugsCount + inProgressBugsCount) /
              Math.max(teamPerformance.length, 1)) *
              10
          ) / 10,
      };

      // Prepare final dashboard data
      const dashboardData = {
        totalBugs,
        resolvedBugs,
        criticalBugs,
        avgResolutionTime: avgResolutionTime[0]?.avgTime
          ? `${Math.round(avgResolutionTime[0].avgTime * 10) / 10} days`
          : "N/A",
        bugTrends: bugTrendsData,
        resolutionRates: resolutionRatesData,
        severityDistribution: {
          critical: severityMap.Critical,
          high: severityMap.High,
          medium: severityMap.Major,
          low: severityMap.Minor,
        },
        teamPerformance: teamPerformanceData,
        topBugs: topBugsData,
        performanceMetrics,
      };

      return NextResponse.json({ data: dashboardData });
    } catch (error) {
      console.error("Database operation error:", error);
      return NextResponse.json(
        { error: "Database operation failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Analytics API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function formatTimeAgo(date: Date): string {
  try {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(date).getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minute(s) ago`;
    if (diffInHours < 24) return `${diffInHours} hour(s) ago`;
    if (diffInDays < 7) return `${diffInDays} day(s) ago`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} week(s) ago`;

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} month(s) ago`;

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} year(s) ago`;
  } catch (err) {
    console.warn("formatTimeAgo error:", err);
    return "Unknown";
  }
}
