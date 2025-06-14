"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Input } from "@/components/ui/Input";
import {
  Users,
  UserPlus,
  Settings,
  BarChart3,
  Sparkles,
  TrendingUp,
  Clock,
  Target,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from "lucide-react";
import { aiService, AITeamInsights } from "@/lib/services/AiService";

// Type definitions
interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
  phone?: string;
  location?: string;
  avatar?: string;
  status: "online" | "away" | "offline";
  bugsAssigned?: number;
  bugsResolved?: number;
  resolutionRate?: number;
  avgResolutionTime: string;
  skills?: string[];
  workload: number;
  assignedBugs: number;
  resolvedBugs: number;
  specialties: string[];
  joinDate?: string;
}

type StatusType = "online" | "away" | "offline";

const Team: React.FC = () => {
  const [aiInsights, setAIInsights] = useState<AITeamInsights | null>(null);
  const [loadingInsights, setLoadingInsights] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Lead Developer",
      email: "sarah@company.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      avatar: "/placeholder.svg",
      status: "online",
      bugsAssigned: 12,
      bugsResolved: 89,
      resolutionRate: 92,
      avgResolutionTime: "1.2 days",
      skills: ["React", "TypeScript", "Node.js"],
      workload: 85,
      assignedBugs: 12,
      resolvedBugs: 89,
      specialties: ["React", "TypeScript", "Node.js"],
      joinDate: "2022-03-15",
    },
    {
      id: 2,
      name: "Jane Smith",
      role: "QA Engineer",
      email: "jane.smith@company.com",
      phone: "+1 (555) 234-5678",
      location: "New York, NY",
      status: "online",
      assignedBugs: 8,
      resolvedBugs: 156,
      avgResolutionTime: "0.9 days",
      specialties: ["Testing", "Automation", "Selenium"],
      joinDate: "2022-08-10",
      workload: 60,
    },
    {
      id: 3,
      name: "Alice Johnson",
      role: "Backend Developer",
      email: "alice.johnson@company.com",
      phone: "+1 (555) 345-6789",
      location: "Austin, TX",
      status: "away",
      assignedBugs: 15,
      resolvedBugs: 67,
      avgResolutionTime: "2.5 days",
      specialties: ["Node.js", "Database", "API"],
      joinDate: "2023-03-20",
      workload: 90,
    },
    {
      id: 4,
      name: "Bob Wilson",
      role: "DevOps Engineer",
      email: "bob.wilson@company.com",
      phone: "+1 (555) 456-7890",
      location: "Seattle, WA",
      status: "offline",
      assignedBugs: 5,
      resolvedBugs: 34,
      avgResolutionTime: "3.2 days",
      specialties: ["AWS", "Docker", "CI/CD"],
      joinDate: "2023-06-01",
      workload: 45,
    },
  ];

  const loadAIInsights = async (): Promise<void> => {
    setLoadingInsights(true);
    try {
      const insights = await aiService.generateTeamInsights(teamMembers);
      setAIInsights(insights);
      console.log("AI team insights generated successfully");
    } catch (error) {
      console.error("Error loading AI insights:", error);
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => {
    loadAIInsights();
  }, []);

  const getStatusColor = (status: StatusType): string => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const getWorkloadColor = (workload: number): string => {
    if (workload >= 80) return "text-red-600";
    if (workload >= 60) return "text-yellow-600";
    return "text-green-600";
  };

  const filteredMembers = teamMembers.filter(
    (member: TeamMember) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  const handleRefreshInsights = (): void => {
    loadAIInsights();
  };

  const renderInsightItem = (
    insight: string,
    index: number,
    IconComponent: React.ComponentType<any>,
    bgClass: string,
    textClass: string
  ) => (
    <div
      key={index}
      className={`flex items-start gap-3 p-3 ${bgClass} rounded-lg`}
    >
      <IconComponent className={`w-4 h-4 ${textClass} mt-0.5 flex-shrink-0`} />
      <p className={`text-sm ${textClass}`}>{insight}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Team Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              AI-powered team insights and performance analytics
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleRefreshInsights}
              disabled={loadingInsights}
              variant="outline"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {loadingInsights
                ? "Generating Insights..."
                : "Refresh AI Insights"}
            </Button>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </div>
        </div>

        {/* AI Insights Section */}
        {aiInsights && (
          <Card className="mb-6 bg-gradient-to-r from-primary-600/10 to-accent-500/10 border-primary-600/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-600" />
                AI Team Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="performance" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="workload">Workload</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                  <TabsTrigger value="productivity">Productivity</TabsTrigger>
                </TabsList>

                <TabsContent value="performance" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(aiInsights.performanceAnalysis || []).map(
                      (insight: string, index: number) =>
                        renderInsightItem(
                          insight,
                          index,
                          TrendingUp,
                          "bg-white/50 dark:bg-slate-800/50",
                          "text-slate-700 dark:text-slate-300"
                        )
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="workload" className="mt-4">
                  <div className="space-y-3">
                    {(aiInsights.workloadRecommendations || []).map(
                      (rec: string, index: number) =>
                        renderInsightItem(
                          rec,
                          index,
                          Target,
                          "bg-white/50 dark:bg-slate-800/50",
                          "text-slate-700 dark:text-slate-300"
                        )
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="skills" className="mt-4">
                  <div className="space-y-3">
                    {(aiInsights.skillGaps || []).map(
                      (gap: string, index: number) =>
                        renderInsightItem(
                          gap,
                          index,
                          Settings,
                          "bg-orange-50/50 dark:bg-orange-900/20 border border-orange-200/50 dark:border-orange-800/50",
                          "text-orange-700 dark:text-orange-300"
                        )
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="productivity" className="mt-4">
                  <div className="space-y-3">
                    {(aiInsights.productivityTrends || []).map(
                      (trend: string, index: number) =>
                        renderInsightItem(
                          trend,
                          index,
                          Clock,
                          "bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50",
                          "text-blue-700 dark:text-blue-300"
                        )
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search team members..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="workload">Workload</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((member: TeamMember) => (
                <Card
                  key={member.id}
                  className="hover:shadow-lg transition-shadow duration-200"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-blue-500 text-white">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${getStatusColor(
                            member.status
                          )}`}
                        ></div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {member.role}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <div
                            className={`w-2 h-2 rounded-full ${getStatusColor(
                              member.status
                            )}`}
                          ></div>
                          <span className="text-xs capitalize">
                            {member.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-500" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      {member.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-500" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                      {member.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-500" />
                          <span>{member.location}</span>
                        </div>
                      )}
                      {member.joinDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          <span>Joined {member.joinDate}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {member.assignedBugs}
                        </div>
                        <div className="text-slate-600 dark:text-slate-400">
                          Active
                        </div>
                      </div>
                      <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {member.resolvedBugs}
                        </div>
                        <div className="text-slate-600 dark:text-slate-400">
                          Resolved
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Workload</span>
                        <span className={getWorkloadColor(member.workload)}>
                          {member.workload}%
                        </span>
                      </div>
                      <Progress value={member.workload} className="h-2" />
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {member.specialties.map((specialty: string) => (
                        <Badge
                          key={specialty}
                          variant="outline"
                          className="text-xs"
                        >
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resolution Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredMembers.map((member: TeamMember) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-blue-500 text-white text-xs">
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{member.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {member.avgResolutionTime}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            avg time
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bug Resolution Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredMembers.map((member: TeamMember) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-blue-500 text-white text-xs">
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{member.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">
                            {member.resolvedBugs}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            resolved
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="workload">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((member: TeamMember) => (
                <Card key={member.id}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-blue-500 text-white">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">
                          {member.name}
                        </CardTitle>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Current Workload</span>
                          <span className={getWorkloadColor(member.workload)}>
                            {member.workload}%
                          </span>
                        </div>
                        <Progress value={member.workload} className="h-2" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                          <div className="font-semibold">
                            {member.assignedBugs}
                          </div>
                          <div className="text-slate-600 dark:text-slate-400">
                            Active Bugs
                          </div>
                        </div>
                        <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                          <div className="font-semibold">
                            {member.avgResolutionTime}
                          </div>
                          <div className="text-slate-600 dark:text-slate-400">
                            Avg Time
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="skills">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((member: TeamMember) => (
                <Card key={member.id}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-blue-500 text-white">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">
                          {member.name}
                        </CardTitle>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Specialties
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {member.specialties.map((specialty: string) => (
                            <Badge
                              key={specialty}
                              variant="secondary"
                              className="text-xs"
                            >
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Team;
