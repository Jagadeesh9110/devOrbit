"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Bug,
  Clock,
  Users,
  CheckCircle,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { fetchWithAuth } from "@/lib/auth";

// Assuming AIAnalyticsData interface is imported or defined as per your lib/services/AiService.ts
interface AIAnalyticsData {
  insights: string[];
  recommendations: string[];
  trends: string[];
  predictions: string[];
}

// Type definitions
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

interface Stat {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface AnalyticsData {
  totalBugs: string | undefined;
  avgResolutionTime: string | undefined;
  activeBugs: number | undefined;
  resolvedBugs: string | undefined;
  trendData: BugTrendData[];
  priorityData: PriorityData[];
  teamData: TeamPerformanceData[];
  resolutionData: ResolutionTimeData[];
  aiInsights?: AIAnalyticsData;
}

type TimeRange = "7d" | "30d" | "90d" | "1y";

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalBugs: "0",
    avgResolutionTime: "N/A",
    activeBugs: 0,
    resolvedBugs: "0",
    trendData: [],
    priorityData: [],
    teamData: [],
    resolutionData: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        const [statsRes, trendsRes, priorityRes, teamRes, resolutionRes] =
          await Promise.all([
            fetchWithAuth(`/api/analytics/stats`),
            fetchWithAuth(`/api/analytics/bug-trends?timeRange=${timeRange}`),
            fetchWithAuth(`/api/analytics/priority-breakdown`),
            fetchWithAuth(`/api/analytics/team-performance`),
            fetchWithAuth(`/api/analytics/resolution-times`),
          ]);

        if (
          !statsRes.success ||
          !trendsRes.success ||
          !priorityRes.success ||
          !teamRes.success ||
          !resolutionRes.success
        ) {
          throw new Error("Failed to fetch analytics data");
        }

        setAnalyticsData({
          totalBugs: statsRes.data.totalBugs.toString(),
          avgResolutionTime: statsRes.data.avgResolutionTime,
          activeBugs: statsRes.data.activeBugs,
          resolvedBugs: statsRes.data.resolvedBugs.toString(),
          trendData: trendsRes.data,
          priorityData: priorityRes.data,
          teamData: teamRes.data.teamData,
          resolutionData: resolutionRes.data,
          aiInsights: statsRes.data.aiInsights,
        });
      } catch (err: any) {
        setError(err.message || "Failed to fetch analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

  const stats: Stat[] = [
    {
      title: "Total Bugs",
      value: analyticsData.totalBugs || "0",
      change: "+12%", // Placeholder; could be calculated dynamically with historical data
      trend: "up",
      icon: Bug,
      color: "text-blue-600",
    },
    {
      title: "Avg Resolution Time",
      value: analyticsData.avgResolutionTime || "N/A",
      change: "-15%",
      trend: "down",
      icon: Clock,
      color: "text-green-600",
    },
    {
      title: "Active Bugs",
      value: analyticsData.activeBugs?.toString() || "0",
      change: "+5%",
      trend: "up",
      icon: AlertTriangle,
      color: "text-orange-600",
    },
    {
      title: "Resolved This Month",
      value: analyticsData.resolvedBugs || "0",
      change: "+23%", // Placeholder
      trend: "up",
      icon: CheckCircle,
      color: "text-emerald-600",
    },
  ];

  const handleExport = async (): Promise<void> => {
    setIsExporting(true);
    try {
      const { aiService } = await import("@/lib/services/AiService");
      const report = await aiService.generateIntelligentReport(
        analyticsData,
        timeRange
      );

      const blob = new Blob([report], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ai-analytics-report-${
        new Date().toISOString().split("T")[0]
      }.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating AI report:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleTimeRangeChange = (value: string): void => {
    setTimeRange(value as TimeRange);
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Analytics
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              AI-powered bug metrics and team performance
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              variant="outline"
            >
              <Calendar className="w-4 h-4 mr-2" />
              {isExporting ? "Generating AI Report..." : "Export AI Report"}
            </Button>
          </div>
        </div>

        {/* AI Insights Banner */}
        <Card className="mb-6 bg-gradient-to-r from-accent-500/10 to-primary-600/10 border-accent-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-accent-500 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                AI Insights
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {analyticsData.aiInsights?.insights.map((insight, index) => (
                <div key={index}>
                  <p className="text-slate-700 dark:text-slate-300">
                    {insight}
                  </p>
                </div>
              )) || (
                <div>
                  <p className="text-slate-700 dark:text-slate-300">
                    No AI insights available.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-2">
                      {stat.trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          stat.trend === "up"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {stat.change}
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-400 ml-1">
                        vs last period
                      </span>
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-full bg-slate-100 dark:bg-slate-800 ${stat.color}`}
                  >
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList>
            <TabsTrigger value="trends">Bug Trends</TabsTrigger>
            <TabsTrigger value="priority">Priority Analysis</TabsTrigger>
            <TabsTrigger value="performance">Team Performance</TabsTrigger>
            <TabsTrigger value="resolution">Resolution Time</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Bug Reporting vs Resolution Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={analyticsData.trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="reported"
                      stackId="1"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="resolved"
                      stackId="2"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="priority">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bug Distribution by Priority</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData.priorityData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({
                          name,
                          percent,
                        }: {
                          name: string;
                          percent: number;
                        }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {analyticsData.priorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Priority Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analyticsData.priorityData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <Badge variant="outline">{item.value} bugs</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Team Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analyticsData.teamData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="resolved" fill="#10B981" name="Resolved" />
                    <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resolution">
            <Card>
              <CardHeader>
                <CardTitle>Average Resolution Time Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={analyticsData.resolutionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="avgTime"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ fill: "#3B82F6", strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-insights">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>AI Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analyticsData.aiInsights?.insights?.length ? (
                    analyticsData.aiInsights?.insights.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md"
                      >
                        <p className="text-sm text-blue-900 dark:text-blue-200">
                          {item}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">
                      No insights available
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>AI Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analyticsData.aiInsights?.recommendations?.length ? (
                    analyticsData.aiInsights?.recommendations.map(
                      (item, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-md"
                        >
                          <p className="text-sm text-emerald-900 dark:text-emerald-200">
                            {item}
                          </p>
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-muted-foreground">
                      No recommendations available
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>AI Trends</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analyticsData.aiInsights?.trends?.length ? (
                    analyticsData.aiInsights?.trends.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-md"
                      >
                        <p className="text-sm text-purple-900 dark:text-purple-200">
                          {item}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No trends available</p>
                  )}
                </CardContent>
              </Card>

              {/* Predictions */}
              <Card>
                <CardHeader>
                  <CardTitle>AI Predictions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analyticsData.aiInsights?.predictions?.length ? (
                    analyticsData.aiInsights?.predictions.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md"
                      >
                        <p className="text-sm text-yellow-900 dark:text-yellow-200">
                          {item}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">
                      No predictions available
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Analytics;
