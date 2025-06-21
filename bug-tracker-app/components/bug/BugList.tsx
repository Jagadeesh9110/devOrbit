"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Clock, User, Bug } from "lucide-react";
import { PopulatedBug, BugFilters } from "@/types/bug";

interface BugListProps {
  bugs: PopulatedBug[];
  searchQuery: string;
  filters: BugFilters;
  onBugSelect: (bugId: string) => void;
  selectedBug: string | null;
}

export const BugList = ({
  bugs,
  searchQuery,
  filters,
  onBugSelect,
  selectedBug,
}: BugListProps) => {
  const [selectedBugs, setSelectedBugs] = useState<string[]>([]);

  const getPriorityColor = (priority: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "In Progress":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "Resolved":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
      case "Closed":
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
        {bugs.map((bug) => (
          <Card
            key={bug._id.toString()}
            className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedBug === bug._id.toString()
                ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950"
                : "hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
            onClick={() => onBugSelect(bug._id.toString())}
          >
            <div className="flex items-start gap-4">
              <Checkbox
                checked={selectedBugs.includes(bug._id.toString())}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedBugs([...selectedBugs, bug._id.toString()]);
                  } else {
                    setSelectedBugs(
                      selectedBugs.filter((id) => id !== bug._id.toString())
                    );
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-mono text-slate-500">
                    {bug._id.toString()}
                  </span>
                  <Badge className={getPriorityColor(bug.priority)}>
                    {bug.priority}
                  </Badge>
                  <Badge className={getStatusColor(bug.status)}>
                    {bug.status}
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
                    <span>{bug.assigneeId?.name || "Unassigned"}</span>
                  </div>
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
                  <div className="flex items-center gap-1">
                    <Bug className="w-3 h-3" />
                    <span>{bug.comments.length} comments</span>
                  </div>
                  <span>{new Date(bug.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                  {bug.labels.map((label) => (
                    <Badge key={label} variant="outline" className="text-xs">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <Avatar className="w-6 h-6 border-2 border-white dark:border-slate-800">
                    <AvatarFallback className="text-xs bg-green-500 text-white">
                      {bug.assigneeId?.name
                        ? bug.assigneeId.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        : "?"}
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
