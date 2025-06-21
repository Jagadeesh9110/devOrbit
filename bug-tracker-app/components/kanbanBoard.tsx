"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Clock, Plus } from "lucide-react";
import { PopulatedBug, BugFilters } from "@/types/bug";

interface KanbanBoardProps {
  bugs: PopulatedBug[];
  searchQuery: string;
  filters: BugFilters;
  onBugSelect: (bugId: string) => void;
  selectedBug?: string | null;
}

interface Column {
  id: string;
  title: string;
  status: PopulatedBug["status"];
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  bugs,
  searchQuery,
  filters,
  onBugSelect,
  selectedBug,
}) => {
  const router = useRouter();

  const columns: Column[] = [
    { id: "open", title: "Open", status: "Open" },
    { id: "in-progress", title: "In Progress", status: "In Progress" },
    { id: "resolved", title: "Resolved", status: "Resolved" },
    { id: "closed", title: "Closed", status: "Closed" },
  ];

  const getFilteredBugs = (status: PopulatedBug["status"]) => {
    return bugs.filter((bug) => {
      if (bug.status !== status) return false;
      if (
        searchQuery &&
        !bug.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
        return false;
      if (filters.status !== "all" && bug.status !== filters.status)
        return false;
      if (filters.priority !== "all" && bug.priority !== filters.priority)
        return false;
      if (
        filters.assignee !== "all" &&
        bug.assigneeId?.name !== filters.assignee
      )
        return false;
      return true;
    });
  };

  const getPriorityColor = (priority: PopulatedBug["priority"]): string => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "High":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getColumnColor = (columnId: string): string => {
    switch (columnId) {
      case "open":
        return "border-t-blue-500";
      case "in-progress":
        return "border-t-purple-500";
      case "resolved":
        return "border-t-indigo-500";
      case "closed":
        return "border-t-green-500";
      default:
        return "border-t-gray-500";
    }
  };

  const getInitials = (name?: string): string => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  const handleAddBug = () => {
    const projectId = new URLSearchParams(window.location.search).get(
      "projectId"
    );
    router.push(
      `/dashboard/bugs/new${projectId ? `?projectId=${projectId}` : ""}`
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {columns.map((column) => {
        const columnBugs = getFilteredBugs(column.status);
        return (
          <div key={column.id} className="space-y-4">
            <div
              className={`bg-white dark:bg-slate-800 rounded-lg border-t-4 ${getColumnColor(
                column.id
              )} p-4 shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  {column.title}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {columnBugs.length}
                </Badge>
              </div>
            </div>

            <div className="space-y-3 min-h-[400px]">
              {columnBugs.map((bug) => (
                <Card
                  key={bug._id.toString()}
                  className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1 ${
                    selectedBug === bug._id.toString()
                      ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900"
                      : "bg-white dark:bg-slate-800"
                  }`}
                  onClick={() => onBugSelect(bug._id.toString())}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-500">
                        {bug._id.toString()}
                      </span>
                      <Badge className={getPriorityColor(bug.priority)}>
                        {bug.priority}
                      </Badge>
                    </div>

                    <h4 className="font-medium text-slate-900 dark:text-slate-100 text-sm line-clamp-2">
                      {bug.title}
                    </h4>

                    <div className="flex flex-wrap gap-1">
                      {bug.labels.map((label) => (
                        <Badge
                          key={label}
                          variant="outline"
                          className="text-xs"
                        >
                          {label}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {bug.comments.reduce(
                            (sum, c) => sum + (c.timeSpent || 0),
                            0
                          )}
                          h
                        </span>
                      </div>
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs bg-blue-500 text-white">
                          {getInitials(bug.assigneeId?.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </Card>
              ))}

              <Card
                className="p-4 border-dashed border-2 border-slate-300 dark:border-slate-600 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                onClick={handleAddBug}
              >
                <div className="text-center text-slate-500 dark:text-slate-400">
                  <Plus className="mx-auto w-6 h-6 mb-1" />
                  <div className="text-xs">Add Bug</div>
                </div>
              </Card>
            </div>
          </div>
        );
      })}
    </div>
  );
};
