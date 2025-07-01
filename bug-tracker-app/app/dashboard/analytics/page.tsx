"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Sparkles,
  BarChart3,
  Target,
  Zap,
  Eye,
  Plus,
  ArrowRight,
} from "lucide-react";
import { fetchWithAuth } from "@/lib/auth";

interface AIAnalyticsData {
  insights: string[];
  recommendations: string[];
  trends: string[];
  predictions: string[];
}

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
  const router = useRouter();
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
  const [hasData, setHasData] = useState<boolean>(false);

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

        const data: AnalyticsData = {
          totalBugs: statsRes.data.totalBugs.toString(),
          avgResolutionTime: statsRes.data.avgResolutionTime,
          activeBugs: statsRes.data.activeBugs,
          resolvedBugs: statsRes.data.resolvedBugs.toString(),
          trendData: trendsRes.data,
          priorityData: priorityRes.data,
          teamData: teamRes.data.teamData,
          resolutionData: resolutionRes.data,
          aiInsights: statsRes.data.aiInsights,
        };

        setAnalyticsData(data);
        // Check if there's meaningful data to display
        setHasData(
          data.totalBugs !== "0" ||
            data.activeBugs !== 0 ||
            data.resolvedBugs !== "0" ||
            data.trendData.length > 0 ||
            data.priorityData.length > 0 ||
            data.teamData.length > 0 ||
            data.resolutionData.length > 0
        );
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
      change: "+12%", // Placeholder
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
      change: "+23%",
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

  const EmptyStateCard = ({
    icon: Icon,
    title,
    description,
    actionText,
    onAction,
    gradient,
  }: {
    icon: any;
    title: string;
    description: string;
    actionText?: string;
    onAction?: () => void;
    gradient: string;
  }) => (
    <Card className={`${gradient} border-0 text-center`}>
      <CardContent className="p-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
          <Icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-white/80 text-sm mb-4">{description}</p>
        {actionText && onAction && (
          <Button
            onClick={onAction}
            variant="secondary"
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            {actionText}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );

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
              disabled={isExporting || !hasData}
              variant="outline"
            >
              <Calendar className="w-4 h-4 mr-2" />
              {isExporting ? "Generating AI Report..." : "Export AI Report"}
            </Button>
          </div>
        </div>

        {!hasData ? (
          <>
            {/* AI Insights Placeholder */}
            <Card className="mb-6 bg-gradient-to-r from-purple-500 to-pink-500 border-0">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  AI-Powered Analytics Awaiting
                </h2>
                <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
                  Once you start reporting and resolving bugs, our AI will
                  generate intelligent insights about your team's performance,
                  productivity patterns, and optimization recommendations.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button
                    onClick={() => router.push("/dashboard/bugs/new")}
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-white/90"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Report Your First Bug
                  </Button>
                  <Button
                    onClick={() => router.push("/dashboard/projects/new")}
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    Create a Project
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Feature Preview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <EmptyStateCard
                icon={TrendingUp}
                title="Smart Trends"
                description="AI will identify patterns in bug reporting and resolution velocity"
                gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
              />
              <EmptyStateCard
                icon={Target}
                title="Predictions"
                description="Get forecasts for project timelines and resource needs"
                gradient="bg-gradient-to-br from-green-500 to-emerald-500"
              />
              <EmptyStateCard
                icon={Users}
                title="Team Insights"
                description="Discover optimal work patterns and skill gaps"
                gradient="bg-gradient-to-br from-orange-500 to-red-500"
              />
              <EmptyStateCard
                icon={Zap}
                title="Optimization"
                description="Receive AI recommendations to boost productivity"
                gradient="bg-gradient-to-br from-purple-500 to-indigo-500"
              />
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
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      Bug Reporting vs Resolution Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                      <BarChart3 className="w-12 h-12 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                      Trend Analysis Coming Soon
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-center max-w-md mb-6">
                      Interactive charts will show bug reporting patterns,
                      resolution velocity, and team performance trends over
                      time.
                    </p>
                    <Button
                      onClick={() => router.push("/dashboard/bugs/new")}
                      variant="outline"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Start Tracking Bugs
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="priority">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      Priority Distribution Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
                      <AlertTriangle className="w-12 h-12 text-orange-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                      Priority Insights Await
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
                      AI will analyze bug priority patterns and help you focus
                      on what matters most.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-600" />
                      Team Performance Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-50 dark:bg-green-950 flex items-center justify-center">
                      <Users className="w-12 h-12 text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                      Team Analytics Ready
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-center max-w-md mb-6">
                      Performance metrics and workload distribution will appear
                      as your team starts working on bugs.
                    </p>
                    <Button
                      onClick={() => router.push("/dashboard/team/add")}
                      variant="outline"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Add Team Members
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="resolution">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-purple-600" />
                      Resolution Time Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-purple-50 dark:bg-purple-950 flex items-center justify-center">
                      <Clock className="w-12 h-12 text-purple-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                      Time Tracking Insights
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
                      AI will identify patterns in resolution times and suggest
                      optimizations for faster bug fixes.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ai-insights">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-accent-500" />
                        AI Predictions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg text-center">
                        <Sparkles className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                          Smart Predictions
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          AI will predict resolution times, identify
                          bottlenecks, and forecast project completion
                        </p>
                      </div>
                      <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg text-center">
                        <Target className="w-8 h-8 text-green-500 mx-auto mb-3" />
                        <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                          Resource Optimization
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          Get recommendations for optimal task distribution and
                          team workload balance
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary-600" />
                        Smart Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg text-center">
                        <CheckCircle className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                        <p className="text-sm font-medium text-purple-800 dark:text-purple-200 mb-2">
                          Process Improvements
                        </p>
                        <p className="text-xs text-purple-700 dark:text-purple-300">
                          AI identifies workflow inefficiencies and suggests
                          process optimizations
                        </p>
                      </div>
                      <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 rounded-lg text-center">
                        <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                        <p className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">
                          Risk Detection
                        </p>
                        <p className="text-xs text-orange-700 dark:text-orange-300">
                          Early warning system for potential project risks and
                          quality issues
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <>
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
                  {analyticsData.aiInsights?.insights?.length ? (
                    analyticsData.aiInsights.insights.map((insight, index) => (
                      <div key={index}>
                        <p className="text-slate-700 dark:text-slate-300">
                          {insight}
                        </p>
                      </div>
                    ))
                  ) : (
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
                        <Bar
                          dataKey="resolved"
                          fill="#10B981"
                          name="Resolved"
                        />
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
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-accent-500" />
                        AI Predictions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {analyticsData.aiInsights?.predictions?.length ? (
                        analyticsData.aiInsights.predictions.map(
                          (item, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md"
                            >
                              <p className="text-sm text-yellow-900 dark:text-yellow-200">
                                {item}
                              </p>
                            </div>
                          )
                        )
                      ) : (
                        <p className="text-muted-foreground">
                          No predictions available
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary-600" />
                        Smart Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {analyticsData.aiInsights?.recommendations?.length ? (
                        analyticsData.aiInsights.recommendations.map(
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
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
};

export default Analytics;
