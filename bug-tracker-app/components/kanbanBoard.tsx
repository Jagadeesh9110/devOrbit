"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Clock, User } from "lucide-react";

interface BugFilters {
  status: string;
  priority: string;
  assignee: string;
}

interface Bug {
  id: string;
  title: string;
  priority: "critical" | "high" | "medium" | "low";
  assignee: string;
  tags: string[];
  timeSpent: string;
}

interface Column {
  id: string;
  title: string;
  count: number;
}

interface KanbanBoardProps {
  searchQuery: string;
  filters: BugFilters;
  onBugSelect: (bugId: string) => void;
  selectedBug?: string | null;
}

type ColumnId = "todo" | "in-progress" | "in-qa" | "done";

type MockBugsData = {
  [K in ColumnId]: Bug[];
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  searchQuery,
  filters,
  onBugSelect,
  selectedBug,
}) => {
  const columns: Column[] = [
    { id: "todo", title: "To Do", count: 8 },
    { id: "in-progress", title: "In Progress", count: 3 },
    { id: "in-qa", title: "In QA", count: 2 },
    { id: "done", title: "Done", count: 12 },
  ];

  const mockBugs: MockBugsData = {
    todo: [
      {
        id: "BUG-001",
        title: "Login button not responsive on mobile",
        priority: "high",
        assignee: "John Doe",
        tags: ["iOS", "Safari"],
        timeSpent: "2h 30m",
      },
      {
        id: "BUG-004",
        title: "Dark mode toggle not persisting",
        priority: "low",
        assignee: "Eva Martinez",
        tags: ["UI", "Theme"],
        timeSpent: "1h 20m",
      },
    ],
    "in-progress": [
      {
        id: "BUG-002",
        title: "Dashboard crashes with large datasets",
        priority: "critical",
        assignee: "Alice Johnson",
        tags: ["Performance", "Database"],
        timeSpent: "5h 15m",
      },
    ],
    "in-qa": [
      {
        id: "BUG-003",
        title: "Email notifications not being sent",
        priority: "medium",
        assignee: "Carol Davis",
        tags: ["Email", "SMTP"],
        timeSpent: "3h 45m",
      },
    ],
    done: [],
  };

  const handleBugClick = (bugId: string): void => {
    if (selectedBug === bugId) {
      onBugSelect("");
    } else {
      onBugSelect(bugId);
    }
  };

  const getPriorityColor = (priority: Bug["priority"]): string => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getColumnColor = (columnId: string): string => {
    switch (columnId) {
      case "todo":
        return "border-t-blue-500";
      case "in-progress":
        return "border-t-purple-500";
      case "in-qa":
        return "border-t-indigo-500";
      case "done":
        return "border-t-green-500";
      default:
        return "border-t-gray-500";
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {columns.map((column) => (
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
                {column.count}
              </Badge>
            </div>
          </div>

          <div className="space-y-3 min-h-[400px]">
            {mockBugs[column.id as ColumnId]?.map((bug: Bug) => (
              <Card
                key={bug.id}
                className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1 ${
                  selectedBug === bug.id
                    ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900"
                    : "bg-white dark:bg-slate-800"
                }`}
                onClick={() => handleBugClick(bug.id)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500">
                      {bug.id}
                    </span>
                    <Badge className={getPriorityColor(bug.priority)}>
                      {bug.priority}
                    </Badge>
                  </div>

                  <h4 className="font-medium text-slate-900 dark:text-slate-100 text-sm line-clamp-2">
                    {bug.title}
                  </h4>

                  <div className="flex flex-wrap gap-1">
                    {bug.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{bug.timeSpent}</span>
                    </div>
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs bg-blue-500 text-white">
                        {getInitials(bug.assignee)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </Card>
            ))}

            {/* Add Bug Card */}
            <Card className="p-4 border-dashed border-2 border-slate-300 dark:border-slate-600 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
              <div className="text-center text-slate-500 dark:text-slate-400">
                <div className="text-lg mb-1">+</div>
                <div className="text-xs">Add Bug</div>
              </div>
            </Card>
          </div>
        </div>
      ))}
    </div>
  );
};
