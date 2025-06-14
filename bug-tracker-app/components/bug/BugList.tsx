import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Clock, User, Bug } from "lucide-react";

interface BugListProps {
  searchQuery: string;
  filters: any;
  onBugSelect: (bugId: string) => void;
  selectedBug: string | null;
}

export const BugList = ({
  searchQuery,
  filters,
  onBugSelect,
  selectedBug,
}: BugListProps) => {
  const [selectedBugs, setSelectedBugs] = useState<string[]>([]);

  const mockBugs = [
    {
      id: "BUG-001",
      title: "Login button not responsive on mobile devices",
      description:
        "Users report that the login button becomes unclickable on iOS Safari",
      status: "open",
      priority: "high",
      assignee: "John Doe",
      reporter: "Jane Smith",
      createdAt: "2024-01-15",
      tags: ["iOS", "Safari", "Mobile"],
      comments: 5,
      timeSpent: "2h 30m",
    },
    {
      id: "BUG-002",
      title: "Dashboard crashes when loading large datasets",
      description:
        "Application becomes unresponsive when trying to load more than 1000 records",
      status: "in-progress",
      priority: "critical",
      assignee: "Alice Johnson",
      reporter: "Bob Wilson",
      createdAt: "2024-01-14",
      tags: ["Performance", "Database", "Backend"],
      comments: 12,
      timeSpent: "5h 15m",
    },
    {
      id: "BUG-003",
      title: "Email notifications not being sent",
      description:
        "Users are not receiving email notifications for important updates",
      status: "in-qa",
      priority: "medium",
      assignee: "Carol Davis",
      reporter: "David Brown",
      createdAt: "2024-01-13",
      tags: ["Email", "Notifications", "SMTP"],
      comments: 8,
      timeSpent: "3h 45m",
    },
    {
      id: "BUG-004",
      title: "Dark mode toggle not persisting",
      description: "Dark mode preference resets after browser refresh",
      status: "open",
      priority: "low",
      assignee: "Eva Martinez",
      reporter: "Frank Miller",
      createdAt: "2024-01-12",
      tags: ["UI", "LocalStorage", "Theme"],
      comments: 3,
      timeSpent: "1h 20m",
    },
  ];

  const getPriorityColor = (priority: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "in-progress":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "in-qa":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
      case "closed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedBugs.length > 0 && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
              {selectedBugs.length} bug(s) selected
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                Update Status
              </Button>
              <Button size="sm" variant="outline">
                Assign
              </Button>
              <Button size="sm" variant="outline">
                Add Tag
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Bug List */}
      <div className="space-y-3">
        {mockBugs.map((bug) => (
          <Card
            key={bug.id}
            className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedBug === bug.id
                ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950"
                : "hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
            onClick={() => onBugSelect(bug.id)}
          >
            <div className="flex items-start gap-4">
              <Checkbox
                checked={selectedBugs.includes(bug.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedBugs([...selectedBugs, bug.id]);
                  } else {
                    setSelectedBugs(selectedBugs.filter((id) => id !== bug.id));
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-mono text-slate-500">
                    {bug.id}
                  </span>
                  <Badge className={getPriorityColor(bug.priority)}>
                    {bug.priority}
                  </Badge>
                  <Badge className={getStatusColor(bug.status)}>
                    {bug.status.replace("-", " ")}
                  </Badge>
                </div>

                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 line-clamp-1">
                  {bug.title}
                </h3>

                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                  {bug.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{bug.assignee}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{bug.timeSpent}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bug className="w-3 h-3" />
                    <span>{bug.comments} comments</span>
                  </div>
                  <span>{bug.createdAt}</span>
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                  {bug.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <Avatar className="w-6 h-6 border-2 border-white dark:border-slate-800">
                    <AvatarFallback className="text-xs bg-green-500 text-white">
                      {bug.assignee
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="w-2 h-2 bg-green-400 rounded-full border border-white dark:border-slate-800"></div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
