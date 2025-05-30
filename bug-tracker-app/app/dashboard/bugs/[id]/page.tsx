"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

interface Bug {
  _id: string;
  title: string;
  description: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  priority: "Low" | "Medium" | "High" | "Critical";
  severity: "Minor" | "Major" | "Critical";
  environment: "Development" | "Staging" | "Production";
  labels: string[];
  createdBy: {
    _id: string;
    name: string;
  };
  assigneeId?: {
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

interface BugFormData {
  status: string;
  priority: string;
  severity: string;
  environment: string;
  assigneeId?: string;
  labels: string;
}

export default function BugDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [bug, setBug] = useState<Bug | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [users, setUsers] = useState<Array<{ _id: string; name: string }>>([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BugFormData>();

  useEffect(() => {
    const fetchBug = async () => {
      try {
        const response = await fetch(`/api/bugs/${params.id}`);
        const data = await response.json();
        setBug(data.bug);
      } catch (error) {
        console.error("Error fetching bug:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchBug();
    fetchUsers();
  }, [params.id]);

  const onSubmit = async (data: BugFormData) => {
    try {
      setIsUpdating(true);
      const formattedData = {
        ...data,
        labels: data.labels.split(",").map((label) => label.trim()),
      };

      const response = await fetch(`/api/bugs/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error("Failed to update bug");
      }

      const updatedBug = await response.json();
      setBug(updatedBug.bug);
    } catch (error) {
      console.error("Error updating bug:", error);
    } finally {
      setIsUpdating(false);
    }
  };

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Low":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-blue-100 text-blue-800";
      case "High":
        return "bg-orange-100 text-orange-800";
      case "Critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Minor":
        return "bg-green-100 text-green-800";
      case "Major":
        return "bg-orange-100 text-orange-800";
      case "Critical":
        return "bg-red-100 text-red-800";
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

  if (!bug) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Bug not found</h2>
        <p className="mt-2 text-gray-600">
          The bug you're looking for doesn't exist or has been deleted.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{bug.title}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    {...register("status")}
                    defaultValue={bug.status}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Priority
                  </label>
                  <select
                    {...register("priority")}
                    defaultValue={bug.priority}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Severity
                  </label>
                  <select
                    {...register("severity")}
                    defaultValue={bug.severity}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    <option value="Minor">Minor</option>
                    <option value="Major">Major</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Environment
                  </label>
                  <select
                    {...register("environment")}
                    defaultValue={bug.environment}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    <option value="Development">Development</option>
                    <option value="Staging">Staging</option>
                    <option value="Production">Production</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Assignee
                  </label>
                  <select
                    {...register("assigneeId")}
                    defaultValue={bug.assigneeId?._id}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    <option value="">Unassigned</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Labels (comma-separated)
                  </label>
                  <input
                    type="text"
                    {...register("labels")}
                    defaultValue={bug.labels.join(", ")}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    placeholder="bug, frontend, ui"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {isUpdating ? "Updating..." : "Update Bug"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="px-4 py-5 sm:px-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Description</h3>
              <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                {bug.description}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Project</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {bug.projectId.name}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Created By
                </h3>
                <p className="mt-1 text-sm text-gray-900">
                  {bug.createdBy.name}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Assignee</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {bug.assigneeId?.name || "Unassigned"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Environment
                </h3>
                <p className="mt-1 text-sm text-gray-900">{bug.environment}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Priority</h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                    bug.priority
                  )}`}
                >
                  {bug.priority}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Severity</h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(
                    bug.severity
                  )}`}
                >
                  {bug.severity}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Labels</h3>
                <div className="mt-1 flex flex-wrap gap-2">
                  {bug.labels.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Created At
                </h3>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(bug.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Last Updated
                </h3>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(bug.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
