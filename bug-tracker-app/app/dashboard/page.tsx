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
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/auth";

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

interface RealtimeMetrics {
  bugsFixedToday: number;
  avgFixTime: string;
  criticalBugsOpen: number;
  teamVelocity: string;
  timeLoggedToday: string;
}

interface TimeLog {
  bugId: string;
  title: string;
  timeSpent: string;
  timestamp: string;
}

interface ActiveWorkItem {
  id: string;
  title: string;
  priority: string;
  severity: string;
}

interface SmartInsight {
  type: string;
  title: string;
  description: string;
  action: string;
  icon: any;
  color: string;
}

const Page = () => {
  const router = useRouter();
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [selectedBug, setSelectedBug] = useState("");
  const [quickLogTime, setQuickLogTime] = useState("");
  const [realtimeMetrics, setRealtimeMetrics] = useState<RealtimeMetrics>({
    bugsFixedToday: 0,
    avgFixTime: "0.0 hours",
    criticalBugsOpen: 0,
    teamVelocity: "0%",
    timeLoggedToday: "0.0h",
  });
  const [recentTimeLogs, setRecentTimeLogs] = useState<TimeLog[]>([]);
  const [activeWork, setActiveWork] = useState<ActiveWorkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          credentials: "include",
        });

        if (!response.ok) {
          router.push("/auth/login");
          return;
        }

        const data = await response.json();
        if (!data.isAuthenticated) {
          router.push("/auth/login");
          return;
        }
      } catch (err) {
        console.error("Auth check error:", err);
        router.push("/auth/login");
      }
    };

    checkAuth();
  }, [router]);

  // Fetch dashboard data
  const fetchDashboardData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Fetch metrics
      const metricsResult = await fetchWithAuth("/api/dashboard/metrics");
      if (metricsResult.error) {
        if (
          metricsResult.error.includes("Authentication failed") ||
          metricsResult.error.includes("Unauthorized")
        ) {
          router.push("/auth/login");
          return;
        }
        throw new Error(`Failed to load metrics: ${metricsResult.error}`);
      }

      if (metricsResult.success && metricsResult.data) {
        setRealtimeMetrics(metricsResult.data);
      }

      // Fetch activities
      const activitiesResult = await fetchWithAuth(
        "/api/dashboard/recent-activities?limit=5"
      );
      if (activitiesResult.error) {
        if (
          activitiesResult.error.includes("Authentication failed") ||
          activitiesResult.error.includes("Unauthorized")
        ) {
          router.push("/auth/login");
          return;
        }
        throw new Error(`Failed to load activities: ${activitiesResult.error}`);
      }

      if (activitiesResult.success && activitiesResult.data) {
        setRecentTimeLogs(activitiesResult.data.recentTimeLogs || []);
        setActiveWork(activitiesResult.data.activeWork || []);
      }
    } catch (err: any) {
      console.error("Dashboard data fetch error:", err);
      setError(err.message || "An error occurred while loading dashboard data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  // Generate smart insights based on real data
  const generateSmartInsights = (): SmartInsight[] => {
    const insights: SmartInsight[] = [];

    // Critical bugs insight
    if (realtimeMetrics.criticalBugsOpen > 0) {
      insights.push({
        type: "critical",
        title: "Critical Bugs Require Attention",
        description: `You have ${
          realtimeMetrics.criticalBugsOpen
        } critical bug${
          realtimeMetrics.criticalBugsOpen > 1 ? "s" : ""
        } that need immediate attention`,
        action: "Review critical bugs now",
        icon: AlertTriangle,
        color: "text-red-600",
      });
    }

    // Performance insight
    if (realtimeMetrics.bugsFixedToday > 0) {
      insights.push({
        type: "performance",
        title: "Great Progress Today",
        description: `You've resolved ${realtimeMetrics.bugsFixedToday} bug${
          realtimeMetrics.bugsFixedToday > 1 ? "s" : ""
        } today with an average fix time of ${realtimeMetrics.avgFixTime}`,
        action: "Keep up the momentum",
        icon: TrendingUp,
        color: "text-green-600",
      });
    }

    // Team velocity insight
    const velocityNum = parseInt(realtimeMetrics.teamVelocity.replace("%", ""));
    if (velocityNum > 0) {
      insights.push({
        type: "velocity",
        title: "Team Velocity Update",
        description: `Team is resolving bugs at ${realtimeMetrics.teamVelocity} velocity rate`,
        action:
          velocityNum > 50
            ? "Maintain current pace"
            : "Consider process improvements",
        icon: Zap,
        color: velocityNum > 50 ? "text-green-600" : "text-orange-600",
      });
    }

    // Time logging insight
    const timeLoggedNum = parseFloat(
      realtimeMetrics.timeLoggedToday.replace("h", "")
    );
    if (timeLoggedNum > 0) {
      insights.push({
        type: "time",
        title: "Time Tracking Update",
        description: `You've logged ${realtimeMetrics.timeLoggedToday} today`,
        action:
          timeLoggedNum < 4
            ? "Consider logging more time"
            : "Good time tracking",
        icon: Clock,
        color: timeLoggedNum >= 4 ? "text-green-600" : "text-blue-600",
      });
    }

    return insights.slice(0, 3); // Limit to 3 insights
  };

  const smartInsights = generateSmartInsights();

  const handleStartTimer = () => {
    if (!selectedBug) {
      setError("Please select a bug to track time for");
      return;
    }
    setError(null);
    setIsTimerRunning(true);
    const id = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    setIntervalId(id);
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
    if (intervalId) clearInterval(intervalId);
    setIntervalId(null);
  };

  const handleStopTimer = async () => {
    setIsTimerRunning(false);
    if (intervalId) clearInterval(intervalId);
    setIntervalId(null);

    if (elapsedSeconds > 0 && selectedBug) {
      const timeSpent = elapsedSeconds / 3600; // Convert to hours
      try {
        const response = await fetchWithAuth(
          `/api/bugs/${selectedBug}/time-logs`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ timeSpent, note: "Logged via timer" }),
          }
        );

        if (response.error) {
          setError(`Failed to log time: ${response.error}`);
        } else {
          // Refresh data after successful time log
          await fetchDashboardData();
          setElapsedSeconds(0);
          setSelectedBug("");
        }
      } catch (err: any) {
        setError("Failed to log time");
      }
    }
  };

  const handleQuickLog = async () => {
    if (!selectedBug || !quickLogTime) {
      setError("Please select a bug and enter time to log");
      return;
    }

    const timeSpent = parseFloat(quickLogTime);
    if (isNaN(timeSpent) || timeSpent <= 0) {
      setError("Please enter a valid time (e.g., 2.5)");
      return;
    }

    try {
      const response = await fetchWithAuth(
        `/api/bugs/${selectedBug}/time-logs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ timeSpent, note: "Logged via dashboard" }),
        }
      );

      if (response.error) {
        setError(`Failed to log time: ${response.error}`);
      } else {
        // Refresh data after successful time log
        await fetchDashboardData();
        setQuickLogTime("");
        setSelectedBug("");
      }
    } catch (err: any) {
      setError("Failed to log time");
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const currentTime = formatTime(elapsedSeconds);

  // Calculate daily progress based on team velocity and bugs fixed
  const calculateDailyProgress = () => {
    const bugsFixed = realtimeMetrics.bugsFixedToday;
    const dailyGoal = 8; // This could be made configurable via API in the future
    const progress = Math.min((bugsFixed / dailyGoal) * 100, 100);
    return Math.round(progress);
  };

  const dailyProgress = calculateDailyProgress();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-slate-600 dark:text-slate-400">
                Loading dashboard data...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
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

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

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
                          disabled={!selectedBug}
                        >
                          <Play className="w-3 h-3" />
                          Start
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={handlePauseTimer}
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
                        {activeWork.map((item) => (
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
                        {activeWork.map((item) => (
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
                    <Button
                      onClick={handleQuickLog}
                      size="sm"
                      className="h-8"
                      disabled={!selectedBug || !quickLogTime}
                    >
                      Log Time
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Recent Time Entries</h4>
                  {recentTimeLogs.length === 0 ? (
                    <div className="text-center text-slate-600 dark:text-slate-400 py-8">
                      No recent time logs
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recentTimeLogs.map((log, index) => (
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

            {smartInsights.length > 0 && (
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
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            {insight.action}
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="w-5 h-5 text-red-600" />
                  Active Work Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeWork.length === 0 ? (
                  <div className="text-center text-slate-600 dark:text-slate-400 py-8">
                    No active work items
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeWork.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        onClick={() =>
                          router.push(`/dashboard/bugs/${item.id}`)
                        }
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
                                  : item.priority === "high"
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
                    {realtimeMetrics.bugsFixedToday}
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
                    <span className="text-sm text-slate-600">
                      {realtimeMetrics.bugsFixedToday}/8
                    </span>
                  </div>
                  <Progress value={dailyProgress} className="h-2" />
                  <div className="text-xs text-slate-500">
                    {dailyProgress >= 100
                      ? "Daily goal achieved! 🎉"
                      : `${Math.round(
                          100 - dailyProgress
                        )}% remaining to reach daily goal`}
                  </div>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Team Momentum</span>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    5-day streak of hitting daily goals
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Note: Streak calculation requires historical data. Consider
                    implementing an API endpoint to track consecutive days of
                    meeting goals.
                  </p>
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
