"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Bug,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Users,
  Zap,
  Target,
  Calendar,
  ArrowRight,
  Plus,
  Eye,
  BarChart3,
  Timer,
  Play,
  Pause,
  Square,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/auth";

const Page = () => {
  const router = useRouter();
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState("00:00:00");
  const [selectedBug, setSelectedBug] = useState("");
  const [quickLogTime, setQuickLogTime] = useState("");
  const [realtimeMetrics, setRealtimeMetrics] = useState({
    bugsFixedToday: 0,
    avgFixTime: "0.0 hours",
    criticalBugsOpen: 0,
    teamVelocity: "0%",
    timeLoggedToday: "0.0h",
  });
  const [recentTimeLogs, setRecentTimeLogs] = useState([]);
  const [activeWork, setActiveWork] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);
      setError(null);

      try {
        const metricsResult = await fetchWithAuth("/api/dashboard/metrics");
        if (metricsResult.error) {
          if (metricsResult.error.includes("Authentication failed")) {
            console.log("Dashboard: Redirecting to login due to auth failure");
            router.push("/auth/login");
            return;
          }
          setError(`Failed to load metrics: ${metricsResult.error}`);
        } else if (metricsResult.success) {
          console.log("Dashboard: Metrics loaded:", metricsResult.data);
          setRealtimeMetrics(metricsResult.data);
        }

        const activitiesResult = await fetchWithAuth(
          "/api/dashboard/recent-activities?limit=5"
        );
        if (activitiesResult.error) {
          if (metricsResult.error.includes("Authentication failed")) {
            console.log("Dashboard: Redirecting to login due to auth failure");
            router.push("/auth/login");
            return;
          }
          setError(`Failed to load activities: ${activitiesResult.error}`);
        } else if (activitiesResult.success) {
          console.log("Dashboard: Activities loaded:", activitiesResult.data);
          setRecentTimeLogs(activitiesResult.data.recentTimeLogs);
          setActiveWork(activitiesResult.data.activeWork);
        }
      } catch (err: any) {
        console.error("Dashboard fetch error:", err.message);
        setError("An error occurred while loading dashboard data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [router]);

  const smartInsights = [
    {
      type: "performance",
      title: "Peak Performance Hours",
      description: "Your team resolves 40% more bugs between 10-12 AM",
      action: "Schedule critical fixes during this window",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      type: "pattern",
      title: "Bug Pattern Detected",
      description: "Authentication-related bugs increased 25% this week",
      action: "Review authentication module",
      icon: AlertTriangle,
      color: "text-orange-600",
    },
  ];

  const handleStartTimer = () => {
    setIsTimerRunning(true);
    // TODO: Implement actual timer logic
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    // TODO: Stop timer and log time
  };

  const handleQuickLog = async () => {
    if (selectedBug && quickLogTime) {
      try {
        const timeSpent = parseFloat(quickLogTime);
        if (isNaN(timeSpent) || timeSpent <= 0) {
          setError("Please enter a valid time (e.g., 2.5)");
          return;
        }

        const response = await fetchWithAuth(
          `/api/bugs/${selectedBug}/time-logs`,
          {
            method: "POST",
            body: JSON.stringify({
              timeSpent,
              comment: `Logged ${timeSpent}h via dashboard`,
            }),
          }
        );

        if (response.error) {
          setError(`Failed to log time: ${response.error}`);
        } else {
          console.log(`Logged ${timeSpent}h for bug ${selectedBug}`);
          setQuickLogTime("");
          setSelectedBug("");
          // Refresh activities
          const activitiesResult = await fetchWithAuth(
            "/api/dashboard/recent-activities?limit=5"
          );
          if (activitiesResult.success) {
            setRecentTimeLogs(activitiesResult.data.recentTimeLogs);
            setActiveWork(activitiesResult.data.activeWork);
          }
        }
      } catch (err: any) {
        setError("Failed to log time");
        console.error("Quick log error:", err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <main className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Mission Control
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Real-time insights to keep your team in the flow
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => router.push("/dashboard/bugs/new")}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Quick Report
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/bugs")}
              >
                <Eye className="w-4 h-4" />
                View All
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center text-slate-600 dark:text-slate-400">
              Loading metrics...
            </div>
          ) : error ? (
            <div className="text-center text-red-600 dark:text-red-400">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {realtimeMetrics.bugsFixedToday}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400">
                    Fixed Today
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {realtimeMetrics.avgFixTime}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    Avg Fix Time
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950 border-red-200 dark:border-red-800">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {realtimeMetrics.criticalBugsOpen}
                  </div>
                  <div className="text-xs text-red-600 dark:text-red-400">
                    Critical Open
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 border-purple-200 dark:border-purple-800">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Zap className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {realtimeMetrics.teamVelocity}
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400">
                    Team Velocity
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 border-orange-200 dark:border-orange-800">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Timer className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    {realtimeMetrics.timeLoggedToday}
                  </div>
                  <div className="text-xs text-orange-600 dark:text-orange-400">
                    Time Today
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-blue-600" />
                  Quick Time Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-2xl font-mono font-bold text-blue-700 dark:text-blue-300">
                        {currentTime}
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">
                        {isTimerRunning ? "Timer running..." : "Ready to start"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!isTimerRunning ? (
                        <Button
                          onClick={handleStartTimer}
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" />
                          Start
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={() => setIsTimerRunning(false)}
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <Pause className="w-3 h-3" />
                            Pause
                          </Button>
                          <Button
                            onClick={handleStopTimer}
                            size="sm"
                            variant="destructive"
                            className="flex items-center gap-1"
                          >
                            <Square className="w-3 h-3" />
                            Stop & Log
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Select value={selectedBug} onValueChange={setSelectedBug}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select bug..." />
                      </SelectTrigger>
                      <SelectContent>
                        {activeWork.map((item: any) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.id} - {item.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Quick Time Entry</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <Select value={selectedBug} onValueChange={setSelectedBug}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Bug ID..." />
                      </SelectTrigger>
                      <SelectContent>
                        {activeWork.map((item: any) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Hours (e.g., 2.5)"
                      value={quickLogTime}
                      onChange={(e) => setQuickLogTime(e.target.value)}
                      className="h-8"
                    />
                    <Button onClick={handleQuickLog} size="sm" className="h-8">
                      Log Time
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Recent Time Entries</h4>
                  {isLoading ? (
                    <div className="text-center text-slate-600 dark:text-slate-400">
                      Loading time logs...
                    </div>
                  ) : recentTimeLogs.length === 0 ? (
                    <div className="text-center text-slate-600 dark:text-slate-400">
                      No recent time logs
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recentTimeLogs.map((log: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-slate-500">
                              {log.bugId}
                            </span>
                            <span className="text-sm">{log.title}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {log.timeSpent}
                            </div>
                            <div className="text-xs text-slate-500">
                              {new Date(log.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Smart Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {smartInsights.map((insight, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <insight.icon
                        className={`w-5 h-5 ${insight.color} mt-0.5`}
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                          {insight.title}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          {insight.description}
                        </p>
                        <Button size="sm" variant="outline" className="text-xs">
                          {insight.action}
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="w-5 h-5 text-red-600" />
                  Active Work Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center text-slate-600 dark:text-slate-400">
                    Loading active work...
                  </div>
                ) : activeWork.length === 0 ? (
                  <div className="text-center text-slate-600 dark:text-slate-400">
                    No active work items
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeWork.map((item: any) => (
                      <div
                        key={item.id}
                        className="p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono text-slate-500">
                              {item.id}
                            </span>
                            <Badge
                              variant={
                                item.priority === "critical"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {item.priority}
                            </Badge>
                          </div>
                          <div className="text-sm text-slate-500">
                            {item.severity}
                          </div>
                        </div>
                        <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                          {item.title}
                        </h4>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/dashboard/analytics")}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/dashboard/team")}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Team Overview
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/dashboard/projects")}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Project Overview
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Today's Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg">
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-1">
                    8/10
                  </div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">
                    Bugs resolved today
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Daily Goal Progress
                    </span>
                    <span className="text-sm text-slate-600">8/10</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Team Momentum</span>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    5-day streak of hitting daily goals
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Page;
