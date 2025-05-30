"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bug,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  BarChart2,
  Activity,
  ArrowUp,
  ArrowDown,
  Filter,
  Download,
  Calendar,
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  fetchWithAuth,
  getClientSideToken,
  clientSideRefresh,
} from "@/lib/auth";
import TimelineFilter from "@/components/dashboard/filters/TimelineFilter";
import StatsCard from "@/components/dashboard/cards/StatsCard";
import PerformanceMetrics from "@/components/dashboard/metrics/PerformanceMetrics";
import TopBugsTable from "@/components/dashboard/tables/TopBugsTable";
import BugTrendChart from "@/components/dashboard/charts/BugTrendChart";
import ResolutionRateChart from "@/components/dashboard/charts/ResolutionRateChart";
import BugsBySeverityChart from "@/components/dashboard/charts/BugsBySeverityChart";
import TeamPerformanceChart from "@/components/dashboard/charts/TeamPerformanceChart";
import BugHeatmap from "@/components/dashboard/charts/BugHeatmap";
import PredictionInsights from "@/components/dashboard/PredictionInsights";
import WorkloadDistribution from "@/components/dashboard/WorkloadDistribution";
import Button from "@/components/ui/Button";

interface DashboardStats {
  totalBugs: number;
  resolvedBugs: number;
  criticalBugs: number;
  avgResolutionTime: string;
  bugTrends: {
    dates: string[];
    newBugs: number[];
    resolvedBugs: number[];
  };
  resolutionRates: {
    dates: string[];
    rates: number[];
  };
  severityDistribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  teamPerformance: {
    members: string[];
    avgResolutionTimes: number[];
    bugsResolved: number[];
  };
  topBugs: {
    id: string;
    title: string;
    severity: "Critical" | "High" | "Medium" | "Low";
    assignee: string;
    reported: string;
    status: "Open" | "In Progress" | "In Review" | "Resolved";
  }[];
  performanceMetrics: {
    detectionEfficiency: number;
    firstResponseTime: number;
    bugFixRate: number;
    developerWorkload: number;
  };
}

export default function AnalyticsDashboard() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState("30d");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = async (showRefreshLoader = false) => {
    if (showRefreshLoader) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const result = await fetchWithAuth(
        `/api/dashboard/analytics?timeRange=${timeRange}`
      );

      if ("error" in result) {
        if (
          result.error.includes("Token refresh failed") ||
          result.error.includes("401") ||
          result.error.includes("Unauthorized") ||
          result.error.includes("Authentication token not found") ||
          result.error.includes("Invalid or expired authentication token")
        ) {
          console.log("Authentication error:", result.error);
          router.push("/auth/login");
          return;
        }
        throw new Error(result.error);
      }

      if (!result || typeof result !== "object") {
        throw new Error("Invalid response format from server");
      }

      setDashboardData(result);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      let errorMessage = "Failed to load dashboard data. ";

      if (error instanceof Error) {
        if (
          error.message.includes("fetch") ||
          error.message.includes("network")
        ) {
          errorMessage +=
            "Please check your internet connection and try again.";
        } else if (error.message.includes("Invalid response")) {
          errorMessage +=
            "Received invalid data from server. Please try again later.";
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += "An unexpected error occurred. Please try again later.";
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timeRange]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading && !isRefreshing) {
        loadData(true);
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isLoading, isRefreshing, timeRange]);

  const handleRefresh = () => {
    loadData(true);
  };

  const handleExport = () => {
    if (!dashboardData) return;

    const dataToExport = {
      exportDate: new Date().toISOString(),
      timeRange,
      ...dashboardData,
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bug-analytics-${timeRange}-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 max-w-md mx-4">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-500 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => loadData()}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Retry
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Loading Analytics Dashboard
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Fetching your bug analytics data...
          </p>
        </div>
      </div>
    );
  }

  // Calculate trends for stats (you could enhance this with historical data)
  const calculateTrend = (
    current: number,
    type: "bugs" | "resolved" | "critical" | "time"
  ) => {
    // Mock trend calculation - in a real app, you'd compare with previous period
    switch (type) {
      case "bugs":
        return current > 10 ? 15 : -5; // More bugs = negative trend
      case "resolved":
        return current > 5 ? 12 : 5; // More resolved = positive trend
      case "critical":
        return current > 3 ? -8 : 3; // More critical = negative trend
      case "time":
        return -2.5;
      default:
        return 0;
    }
  };

  // Stats data with calculated trends
  const stats = [
    {
      title: "Total Bugs",
      value: dashboardData?.totalBugs ?? 0,
      change: calculateTrend(dashboardData?.totalBugs ?? 0, "bugs"),
      isPositive: (dashboardData?.totalBugs ?? 0) <= 10,
      icon: <Bug className="h-6 w-6 text-red-500" />,
    },
    {
      title: "Resolved",
      value: dashboardData?.resolvedBugs ?? 0,
      change: calculateTrend(dashboardData?.resolvedBugs ?? 0, "resolved"),
      isPositive: true,
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
    },
    {
      title: "Critical Issues",
      value: dashboardData?.criticalBugs ?? 0,
      change: calculateTrend(dashboardData?.criticalBugs ?? 0, "critical"),
      isPositive: (dashboardData?.criticalBugs ?? 0) <= 3,
      icon: <AlertTriangle className="h-6 w-6 text-orange-500" />,
    },
    {
      title: "Avg Resolution Time",
      value: dashboardData?.avgResolutionTime ?? "N/A",
      change: calculateTrend(0, "time"),
      isPositive: true,
      icon: <Clock className="h-6 w-6 text-blue-500" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      {/* Header Section */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            Bug Analytics Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Comprehensive insights and metrics
          </p>
          {lastUpdated && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </div>

        <motion.div
          className="flex flex-wrap gap-3 mt-4 sm:mt-0"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <TimelineFilter value={timeRange} onChange={setTimeRange} />

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw
              size={16}
              className={isRefreshing ? "animate-spin" : ""}
            />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Filter size={16} />
            <span>Filters</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download size={16} />
            <span>Export</span>
          </Button>
        </motion.div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatsCard
              title={stat.title}
              value={stat.value}
              change={stat.change}
              isPositive={stat.isPositive}
              icon={stat.icon}
              timeRange={timeRange}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* AI-Powered Prediction Section */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <PredictionInsights timeRange={timeRange} />
      </motion.div>

      {/* Charts Row 1 */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium text-slate-800 dark:text-white">
                Bug Trends
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                New vs Resolved over time
              </p>
            </div>
            <div className="flex items-center gap-2">
              {(dashboardData?.bugTrends?.newBugs?.reduce((a, b) => a + b, 0) ??
                0) >
              (dashboardData?.bugTrends?.resolvedBugs?.reduce(
                (a, b) => a + b,
                0
              ) ?? 0) ? (
                <TrendingUp className="h-5 w-5 text-red-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-green-500" />
              )}
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {(
                  ((dashboardData?.bugTrends?.resolvedBugs?.reduce(
                    (a, b) => a + b,
                    0
                  ) ?? 0) /
                    (dashboardData?.bugTrends?.newBugs?.reduce(
                      (a, b) => a + b,
                      1
                    ) ?? 1)) *
                  100
                ).toFixed(1)}
                % resolution rate
              </span>
            </div>
          </div>
          <BugTrendChart
            data={dashboardData?.bugTrends}
            timeRange={timeRange}
          />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium text-slate-800 dark:text-white">
                Resolution Rate
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Bug resolution efficiency
              </p>
            </div>
            <Activity className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </div>
          <ResolutionRateChart
            data={dashboardData?.resolutionRates}
            timeRange={timeRange}
          />
        </div>
      </motion.div>

      {/* Charts Row 2 */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium text-slate-800 dark:text-white">
                Bugs by Severity
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Distribution of bug severity
              </p>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Total:{" "}
              {dashboardData?.severityDistribution
                ? Object.values(dashboardData.severityDistribution).reduce(
                    (a, b) => a + b,
                    0
                  )
                : 0}
            </div>
          </div>
          <BugsBySeverityChart data={dashboardData?.severityDistribution} />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium text-slate-800 dark:text-white">
                Team Performance
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Resolution time by team member
              </p>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {dashboardData?.teamPerformance?.members?.length || 0} members
            </div>
          </div>
          <TeamPerformanceChart
            data={dashboardData?.teamPerformance}
            timeRange={timeRange}
          />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium text-slate-800 dark:text-white">
                Workload Distribution
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Current team workload balance
              </p>
            </div>
          </div>
          <WorkloadDistribution />
        </div>
      </motion.div>

      {/* Bug Heatmap */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium text-slate-800 dark:text-white">
                Bug Occurrence Heatmap
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                When and where bugs are occurring
              </p>
            </div>
            <Calendar
              size={20}
              className="text-slate-500 dark:text-slate-400"
            />
          </div>
          <BugHeatmap timeRange={timeRange} />
        </div>
      </motion.div>

      {/* Performance Metrics */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <PerformanceMetrics data={dashboardData?.performanceMetrics} />
      </motion.div>

      {/* Top Bugs Table */}
      <motion.div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-shadow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-slate-800 dark:text-white">
                Top Priority Bugs
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Highest priority issues requiring attention
              </p>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {dashboardData?.topBugs?.length ?? 0} active issues
            </div>
          </div>
        </div>
        <div className="p-6">
          <TopBugsTable bugs={dashboardData?.topBugs ?? []} />
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p>
          Dashboard automatically refreshes every 5 minutes. Last refresh:{" "}
          {lastUpdated?.toLocaleString() || "Never"}
        </p>
      </motion.div>
    </div>
  );
}
