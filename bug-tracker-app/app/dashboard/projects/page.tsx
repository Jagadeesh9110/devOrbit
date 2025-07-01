"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Progress } from "@/components/ui/Progress";
import {
  Search,
  Plus,
  Users,
  Bug,
  Clock,
  Settings,
  Target,
  BarChart3,
  CheckCircle,
  Zap,
  ArrowRight,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "planning" | "completed" | "on-hold";
  progress: number;
  totalBugs: number;
  openBugs: number;
  team: string[];
  priority: "high" | "medium" | "low";
  dueDate: string;
  tags: string[];
}

const EmptyProjectsState = ({
  onNewProject,
}: {
  onNewProject: (path?: string) => void;
}) => (
  <div className="text-center py-16">
    <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
      <Target className="w-16 h-16 text-white" />
    </div>
    <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
      Launch Your First Project
    </h2>
    <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
      Create projects to organize your work, track progress, and collaborate
      with your team. Each project comes with integrated bug tracking and
      AI-powered insights.
    </p>
    <div className="flex flex-wrap gap-4 justify-center mb-12">
      <Button
        onClick={() => onNewProject()}
        size="lg"
        className="flex items-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Create Your First Project
      </Button>
      <Button
        onClick={() => onNewProject("/dashboard/team/new")}
        variant="outline"
        size="lg"
      >
        <Users className="w-5 h-5 mr-2" />
        Add Team Members
      </Button>
    </div>

    {/* Feature Preview Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800">
        <div className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-500 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Progress Tracking
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Visual progress bars and milestone tracking with real-time updates
          </p>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
        <div className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
            Team Collaboration
          </h3>
          <p className="text-sm text-green-700 dark:text-green-300">
            Assign team members and track individual contributions
          </p>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 border-purple-200 dark:border-purple-800">
        <div className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-purple-500 flex items-center justify-center">
            <Bug className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
            Integrated Bug Tracking
          </h3>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            Connect bugs directly to projects for seamless workflow
          </p>
        </div>
      </Card>
    </div>

    {/* AI Features Preview */}
    <div className="mt-16 max-w-4xl mx-auto">
      <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center mb-8">
        AI-Powered Project Intelligence
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-r from-accent-500/10 to-primary-600/10 border-accent-500/20">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-accent-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                Smart Predictions
              </h4>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              AI analyzes your project patterns to predict completion dates,
              identify potential bottlenecks, and suggest optimal resource
              allocation.
            </p>
            <div className="flex items-center text-xs text-accent-600 dark:text-accent-400">
              <CheckCircle className="w-3 h-3 mr-1" />
              Activates after your first project milestone
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-success-500/10 to-emerald-600/10 border-success-500/20">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-success-500 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                Risk Assessment
              </h4>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Early warning system that identifies projects at risk of delays
              and provides actionable recommendations to stay on track.
            </p>
            <div className="flex items-center text-xs text-success-600 dark:text-success-400">
              <CheckCircle className="w-3 h-3 mr-1" />
              Available once you have multiple active projects
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
);

const Projects: React.FC = () => {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await fetchWithAuth("/api/projects");
        if (response.success) {
          setProjects(response.data);
        } else {
          throw new Error(response.message);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  const getStatusColor = (status: Project["status"]): string => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "planning":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    }
  };

  const getPriorityColor = (priority: Project["priority"]): string => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  const handleNewProject = (path?: string) => {
    router.push(path || "/dashboard/projects/new");
  };

  const hasProjects = projects.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Projects
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your development projects and track progress
            </p>
          </div>
          <Button
            className="flex items-center gap-2"
            onClick={() => handleNewProject()}
          >
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">Loading...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 dark:text-red-400">{error}</p>
          </div>
        ) : !hasProjects ? (
          <EmptyProjectsState onNewProject={handleNewProject} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project: Project) => (
              <Card
                key={project.id}
                className="hover:shadow-lg transition-shadow duration-200"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                        <Badge className={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {project.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Bug className="w-4 h-4 text-slate-500" />
                      <span>
                        {project.openBugs}/{project.totalBugs} bugs
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>{project.dueDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-slate-500" />
                      <div className="flex -space-x-2">
                        {project.team
                          .slice(0, 3)
                          .map((member: string, index: number) => (
                            <Avatar
                              key={`${project.id}-${index}`}
                              className="w-6 h-6 border-2 border-white dark:border-slate-800"
                            >
                              <AvatarFallback className="text-xs bg-blue-500 text-white">
                                {getInitials(member)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        {project.team.length > 3 && (
                          <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-xs border-2 border-white dark:border-slate-800">
                            +{project.team.length - 3}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {project.tags.slice(0, 2).map((tag: string) => (
                        <Badge
                          key={`${project.id}-${tag}`}
                          variant="outline"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredProjects.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">
              No projects found matching your search criteria.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Projects;
