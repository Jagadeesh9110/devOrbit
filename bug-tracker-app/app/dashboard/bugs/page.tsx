"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BugList } from "@/components/bug/BugList";
import { KanbanBoard } from "@/components/kanbanBoard";
import BugDetails from "@/components/BugDetails";
import { SearchBar } from "@/components/bug/SearchBar";
import { FilterBar } from "@/components/FilterBar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  List,
  Bug,
  Plus,
  Filter,
  BarChart3,
  Clock,
  Search,
  Target,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Eye,
} from "lucide-react";
import { fetchWithAuth } from "@/lib/auth";
import { PopulatedBug, BugFilters } from "@/types/bug";

type ViewMode = "list" | "kanban";

interface BugStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  critical: number;
  avgResolutionTime: string;
}

const EmptyBugsState = ({
  onReportBug,
}: {
  onReportBug: (projectId?: string) => void;
}) => (
  <div className="text-center py-16">
    <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
      <Bug className="w-16 h-16 text-white" />
    </div>
    <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
      Your Bug Tracking Hub Awaits
    </h2>
    <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
      Start by reporting your first bug to unlock powerful tracking features,
      AI-powered insights, and team collaboration tools.
    </p>
    <div className="flex flex-wrap gap-4 justify-center mb-12">
      <Button
        onClick={() => onReportBug()}
        size="lg"
        className="flex items-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Report Your First Bug
      </Button>
      <Button
        onClick={() => onReportBug("/dashboard/projects/new")}
        variant="outline"
        size="lg"
      >
        <Target className="w-5 h-5 mr-2" />
        Create a Project First
      </Button>
    </div>

    {/* Feature Preview Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800">
        <div className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-500 flex items-center justify-center">
            <List className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Smart Organization
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Automatic categorization and priority assignment with AI assistance
          </p>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
        <div className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
            Progress Tracking
          </h3>
          <p className="text-sm text-green-700 dark:text-green-300">
            Visual kanban boards and real-time status updates
          </p>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 border-purple-200 dark:border-purple-800">
        <div className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-purple-500 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
            AI Analytics
          </h3>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            Intelligent insights about patterns and resolution trends
          </p>
        </div>
      </Card>
    </div>
  </div>
);

const StatPlaceholder = ({
  icon: Icon,
  label,
  color,
  description,
}: {
  icon: any;
  label: string;
  color: string;
  description: string;
}) => (
  <Card className="p-4">
    <div className="text-center">
      <div className="flex items-center justify-center mb-2">
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div className="text-2xl font-bold text-slate-400 dark:text-slate-600">
        --
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-400">{label}</div>
      <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
        {description}
      </div>
    </div>
  </Card>
);

export default function BugsPage(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedBug, setSelectedBug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filters, setFilters] = useState<BugFilters>({
    status: "all",
    priority: "all",
    assignee: "all",
  });
  const [bugs, setBugs] = useState<PopulatedBug[]>([]);
  const [bugStats, setBugStats] = useState<BugStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBugs = async () => {
      setLoading(true);
      try {
        const endpoint = projectId
          ? `/api/projects/${projectId}/bugs`
          : `/api/bugs`;
        const response = await fetchWithAuth(endpoint);
        if (response.success) {
          setBugs(response.data || []);
          const stats: BugStats = {
            total: response.data.length,
            open: response.data.filter((b: PopulatedBug) => b.status === "Open")
              .length,
            inProgress: response.data.filter(
              (b: PopulatedBug) => b.status === "In Progress"
            ).length,
            resolved: response.data.filter(
              (b: PopulatedBug) => b.status === "Resolved"
            ).length,
            critical: response.data.filter(
              (b: PopulatedBug) => b.priority === "Critical"
            ).length,
            avgResolutionTime: "N/A",
          };
          setBugStats(stats);
        } else {
          throw new Error(response.message);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBugs();
  }, [projectId]);

  const handleBugSelect = (bugId: string): void => {
    setSelectedBug(bugId || null);
  };

  const handleFiltersChange = (newFilters: BugFilters): void => {
    setFilters(newFilters);
  };

  const filteredBugs = bugs.filter((bug) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!bug.title.toLowerCase().includes(query)) return false;
    }
    if (filters.status !== "all" && bug.status !== filters.status) return false;
    if (filters.priority !== "all" && bug.priority !== filters.priority)
      return false;
    if (filters.assignee !== "all" && bug.assigneeId?.name !== filters.assignee)
      return false;
    return true;
  });

  const hasBugs = bugs.length > 0;

  const handleReportBug = (path?: string) => {
    router.push(
      path || `/dashboard/bugs/new${projectId ? `?projectId=${projectId}` : ""}`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Bug Tracking
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Monitor, track, and resolve issues efficiently
            </p>
          </div>

          <Button
            className="flex items-center gap-2"
            onClick={() => handleReportBug()}
          >
            <Plus className="w-4 h-4" />
            Report Bug
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">Loading...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 dark:text-red-400">{error}</p>
          </div>
        ) : !hasBugs ? (
          <EmptyBugsState onReportBug={handleReportBug} />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {bugStats && (
                <>
                  <Card className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {bugStats.total}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Total Bugs
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {bugStats.open}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Open
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {bugStats.inProgress}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        In Progress
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {bugStats.resolved}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Resolved
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {bugStats.critical}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Critical
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-lg font-bold text-slate-900 dark:text-slate-100">
                        <Clock className="w-4 h-4" />
                        {bugStats.avgResolutionTime}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Avg Resolution
                      </div>
                    </div>
                  </Card>
                </>
              )}
            </div>

            <div className="mb-6 space-y-4">
              <SearchBar
                query={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search bugs with natural language (e.g., 'Show me critical bugs assigned to John')"
              />

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <FilterBar
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                />

                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="flex items-center gap-2"
                  >
                    <List className="w-4 h-4" />
                    List
                  </Button>
                  <Button
                    variant={viewMode === "kanban" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("kanban")}
                    className="flex items-center gap-2"
                  >
                    <Bug className="w-4 h-4" />
                    Board
                  </Button>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div
              className={`grid gap-6 ${
                selectedBug ? "grid-cols-1 lg:grid-cols-5" : "grid-cols-1"
              }`}
            >
              <div className={selectedBug ? "lg:col-span-2" : "col-span-1"}>
                {viewMode === "list" ? (
                  <BugList
                    bugs={filteredBugs}
                    searchQuery={searchQuery}
                    filters={filters}
                    onBugSelect={handleBugSelect}
                    selectedBug={selectedBug}
                  />
                ) : (
                  <KanbanBoard
                    bugs={filteredBugs}
                    searchQuery={searchQuery}
                    filters={filters}
                    onBugSelect={handleBugSelect}
                    selectedBug={selectedBug}
                  />
                )}
              </div>

              {selectedBug && (
                <div className="lg:col-span-3">
                  <BugDetails
                    bugId={selectedBug}
                    onClose={() => setSelectedBug(null)}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
