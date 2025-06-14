import React from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Filter } from "lucide-react";

interface FilterBarProps {
  filters: {
    status: string;
    priority: string;
    assignee: string;
  };
  onFiltersChange: (filters: any) => void;
}

export const FilterBar = ({ filters, onFiltersChange }: FilterBarProps) => {
  const statusOptions = ["all", "open", "in-progress", "in-qa", "closed"];
  const priorityOptions = ["all", "critical", "high", "medium", "low"];
  const assigneeOptions = ["all", "me", "unassigned", "john-doe", "jane-smith"];

  const activeFilters = Object.entries(filters).filter(
    ([key, value]) => value !== "all"
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-500" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Filters:
        </span>
      </div>

      {/* Status Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            Status: {filters.status}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {statusOptions.map((status) => (
            <DropdownMenuItem
              key={status}
              onClick={() => onFiltersChange({ ...filters, status })}
              className={
                filters.status === status ? "bg-blue-50 dark:bg-blue-950" : ""
              }
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Priority Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            Priority: {filters.priority}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {priorityOptions.map((priority) => (
            <DropdownMenuItem
              key={priority}
              onClick={() => onFiltersChange({ ...filters, priority })}
              className={
                filters.priority === priority
                  ? "bg-blue-50 dark:bg-blue-950"
                  : ""
              }
            >
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Assignee Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            Assignee: {filters.assignee}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {assigneeOptions.map((assignee) => (
            <DropdownMenuItem
              key={assignee}
              onClick={() => onFiltersChange({ ...filters, assignee })}
              className={
                filters.assignee === assignee
                  ? "bg-blue-50 dark:bg-blue-950"
                  : ""
              }
            >
              {assignee.charAt(0).toUpperCase() + assignee.slice(1)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Active:</span>
          {activeFilters.map(([key, value]) => (
            <Badge
              key={key}
              variant="secondary"
              className="text-xs cursor-pointer hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900 dark:hover:text-red-300"
              onClick={() => onFiltersChange({ ...filters, [key]: "all" })}
            >
              {key}: {value} ×
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onFiltersChange({
                status: "all",
                priority: "all",
                assignee: "all",
              })
            }
            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};
