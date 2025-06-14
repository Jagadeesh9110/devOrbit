"use client";

import React, { useState } from "react";
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
  criticalIssues: number | undefined;
  resolved: string | undefined;
  trendData: BugTrendData[];
  teamData: TeamPerformanceData[];
  resolutionData: ResolutionTimeData[];
}

type TimeRange = "7d" | "30d" | "90d" | "1y";

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const bugTrendData: BugTrendData[] = [
    { name: "Week 1", reported: 24, resolved: 18, open: 6 },
    { name: "Week 2", reported: 31, resolved: 25, open: 12 },
    { name: "Week 3", reported: 18, resolved: 22, open: 8 },
    { name: "Week 4", reported: 29, resolved: 27, open: 10 },
  ];

  const priorityData: PriorityData[] = [
    { name: "Critical", value: 8, color: "#EF4444" },
    { name: "High", value: 23, color: "#F97316" },
    { name: "Medium", value: 45, color: "#EAB308" },
    { name: "Low", value: 32, color: "#22C55E" },
  ];

  const resolutionTimeData: ResolutionTimeData[] = [
    { name: "Jan", avgTime: 2.1 },
    { name: "Feb", avgTime: 1.8 },
    { name: "Mar", avgTime: 2.3 },
    { name: "Apr", avgTime: 1.9 },
    { name: "May", avgTime: 2.2 },
    { name: "Jun", avgTime: 1.7 },
  ];

  const teamPerformanceData: TeamPerformanceData[] = [
    { name: "John Doe", resolved: 89, pending: 12 },
    { name: "Jane Smith", resolved: 156, pending: 8 },
    { name: "Alice Johnson", resolved: 67, pending: 15 },
    { name: "Bob Wilson", resolved: 34, pending: 5 },
  ];

  const stats: Stat[] = [
    {
      title: "Total Bugs",
      value: "1,234",
      change: "+12%",
      trend: "up",
      icon: Bug,
      color: "text-blue-600",
    },
    {
      title: "Avg Resolution Time",
      value: "1.8 days",
      change: "-15%",
      trend: "down",
      icon: Clock,
      color: "text-green-600",
    },
    {
      title: "Active Bugs",
      value: "89",
      change: "+5%",
      trend: "up",
      icon: AlertTriangle,
      color: "text-orange-600",
    },
    {
      title: "Resolved This Month",
      value: "456",
      change: "+23%",
      trend: "up",
      icon: CheckCircle,
      color: "text-emerald-600",
    },
  ];

  const handleExport = async (): Promise<void> => {
    setIsExporting(true);
    console.log("Generating AI-powered analytics export...");

    try {
      // Dynamic import for Next.js
      const { aiService } = await import("@/lib/services/AiService");

      const analyticsData: AnalyticsData = {
        totalBugs: stats.find((s) => s.title === "Total Bugs")?.value,
        avgResolutionTime: stats.find((s) => s.title === "Avg Resolution Time")
          ?.value,
        criticalIssues: priorityData.find((p) => p.name === "Critical")?.value,
        resolved: stats.find((s) => s.title === "Resolved This Month")?.value,
        trendData: bugTrendData,
        teamData: teamPerformanceData,
        resolutionData: resolutionTimeData,
      };

      const report = await aiService.generateIntelligentReport(
        analyticsData,
        timeRange
      );

      // Create and download the report
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

      console.log("AI-powered report exported successfully");
    } catch (error) {
      console.error("Error generating AI report:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleTimeRangeChange = (value: string): void => {
    setTimeRange(value as TimeRange);
  };

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
              <div>
                <p className="text-slate-700 dark:text-slate-300">
                  🎯 <strong>Resolution rate improved 18%</strong> - Team
                  velocity is trending upward
                </p>
              </div>
              <div>
                <p className="text-slate-700 dark:text-slate-300">
                  ⚡ <strong>Critical bugs resolved 2.3x faster</strong> -
                  Process improvements working
                </p>
              </div>
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
                  <AreaChart data={bugTrendData}>
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
                        data={priorityData}
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
                        {priorityData.map((entry, index) => (
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
                  {priorityData.map((item) => (
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
                  <BarChart data={teamPerformanceData}>
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
                  <LineChart data={resolutionTimeData}>
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
                    <TrendingUp className="w-5 h-5 text-accent-500" />
                    AI Predictions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                      Expected Trend
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Bug resolution rate will increase by 25% next month based
                      on current velocity
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                      Resource Optimization
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Redistribute 3 tasks from John to Alice for optimal
                      workload balance
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-1">
                      Risk Alert
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Mobile platform showing increased bug density - consider
                      additional testing
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary-600" />
                    Team Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Code Review Impact</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Pair programming reduces bug introduction by 40%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <Clock className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Optimal Hours</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        9-11 AM shows highest resolution rates
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Skill Gap</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Frontend team needs React testing expertise
                      </p>
                    </div>
                  </div>
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
