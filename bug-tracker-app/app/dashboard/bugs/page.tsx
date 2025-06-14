"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BugList } from "@/components/bug/BugList";
import { KanbanBoard } from "@/components/kanbanBoard";
import BugDetails from "@/components/BugDetails";
import { SearchBar } from "@/components/SearchBar";
import { FilterBar } from "@/components/FilterBar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { List, Bug, Plus, Filter, BarChart3, Clock } from "lucide-react";

type ViewMode = "list" | "kanban";

interface BugFilters {
  status: string;
  priority: string;
  assignee: string;
}

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
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedBug, setSelectedBug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filters, setFilters] = useState<BugFilters>({
    status: "all",
    priority: "all",
    assignee: "all",
  });

  const handleBugSelect = (bugId: string): void => {
    setSelectedBug(bugId || null);
  };

  const handleFiltersChange = (newFilters: BugFilters): void => {
    setFilters(newFilters);
  };

  const bugStats: BugStats = {
    total: 234,
    open: 45,
    inProgress: 12,
    resolved: 177,
    critical: 3,
    avgResolutionTime: "2.3 days",
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
            onClick={() => router.push("/dashboard/bugs/new")}
          >
            <Plus className="w-4 h-4" />
            Report Bug
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
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
        </div>

        <div className="mb-6 space-y-4">
          <SearchBar
            value={searchQuery}
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
                searchQuery={searchQuery}
                filters={filters}
                onBugSelect={handleBugSelect}
                selectedBug={selectedBug}
              />
            ) : (
              <KanbanBoard
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
      </main>
    </div>
  );
}
