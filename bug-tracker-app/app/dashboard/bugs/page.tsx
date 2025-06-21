"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BugList } from "@/components/bug/BugList";
import { KanbanBoard } from "@/components/kanbanBoard";
import BugDetails from "@/components/BugDetails";
import { SearchBar } from "@/components//bug/SearchBar";
import { FilterBar } from "@/components/FilterBar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { List, Bug, Plus, Filter, BarChart3, Clock } from "lucide-react";
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
            onClick={() =>
              router.push(
                `/dashboard/bugs/new${
                  projectId ? `?projectId=${projectId}` : ""
                }`
              )
            }
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
        ) : bugs.length === 0 ? (
          <div className="text-center py-10">
            <Bug className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No bugs found
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Create your first bug report to get started.
            </p>
            <Button
              onClick={() =>
                router.push(
                  `/dashboard/bugs/new${
                    projectId ? `?projectId=${projectId}` : ""
                  }`
                )
              }
            >
              Create First Bug
            </Button>
          </div>
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
