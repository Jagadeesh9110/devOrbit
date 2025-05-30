"use client";

import { useEffect, useState } from "react";
import {
  BugAntIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface DashboardStats {
  totalBugs: number;
  openBugs: number;
  resolvedBugs: number;
  teamMembers: number;
}

interface RecentBug {
  _id: string;
  title: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  priority: "Low" | "Medium" | "High" | "Critical";
  createdAt: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBugs: 0,
    openBugs: 0,
    resolvedBugs: 0,
    teamMembers: 0,
  });
  const [recentBugs, setRecentBugs] = useState<RecentBug[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/dashboard/stats");
        const data = await response.json();
        setStats(data.stats);
        setRecentBugs(data.recentBugs);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsCards = [
    {
      name: "Total Bugs",
      value: stats.totalBugs,
      icon: BugAntIcon,
      color: "bg-blue-500",
    },
    {
      name: "Open Bugs",
      value: stats.openBugs,
      icon: ClockIcon,
      color: "bg-yellow-500",
    },
    {
      name: "Resolved Bugs",
      value: stats.resolvedBugs,
      icon: CheckCircleIcon,
      color: "bg-green-500",
    },
    {
      name: "Team Members",
      value: stats.teamMembers,
      icon: UserGroupIcon,
      color: "bg-purple-500",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "text-red-600";
      case "High":
        return "text-orange-600";
      case "Medium":
        return "text-yellow-600";
      case "Low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                  <stat.icon
                    className="h-6 w-6 text-white"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Recent Bugs
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentBugs.map((bug) => (
            <div key={bug._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {bug.title}
                  </p>
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        bug.status === "Open"
                          ? "bg-yellow-100 text-yellow-800"
                          : bug.status === "In Progress"
                          ? "bg-blue-100 text-blue-800"
                          : bug.status === "Resolved"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {bug.status}
                    </span>
                    <span className={`ml-2 ${getPriorityColor(bug.priority)}`}>
                      {bug.priority}
                    </span>
                    <span className="ml-2">
                      {new Date(bug.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
