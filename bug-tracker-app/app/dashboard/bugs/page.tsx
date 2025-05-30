"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/outline";

interface Bug {
  _id: string;
  title: string;
  description: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  createdBy: {
    _id: string;
    name: string;
  };
  projectId: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function BugsPage() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const fetchBugs = async () => {
      try {
        const response = await fetch(`/api/bugs?status=${statusFilter}`);
        const data = await response.json();
        setBugs(data.bugs);
      } catch (error) {
        console.error("Error fetching bugs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBugs();
  }, [statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-yellow-100 text-yellow-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      case "Closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
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
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Bugs</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all bugs in your projects
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/dashboard/bugs/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Bug
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              All Bugs
            </h3>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="all">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {bugs.map((bug) => (
            <Link
              key={bug._id}
              href={`/dashboard/bugs/${bug._id}`}
              className="block hover:bg-gray-50"
            >
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary-600 truncate">
                      {bug.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {bug.description}
                    </p>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          bug.status
                        )}`}
                      >
                        {bug.status}
                      </span>
                      <span className="ml-2">
                        Project: {bug.projectId.name}
                      </span>
                      <span className="ml-2">
                        Created by: {bug.createdBy.name}
                      </span>
                      <span className="ml-2">
                        {new Date(bug.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
