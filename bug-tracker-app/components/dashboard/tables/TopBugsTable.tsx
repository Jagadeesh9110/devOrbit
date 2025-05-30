import React from "react";
import { AlertTriangle, Clock, User, ExternalLink } from "lucide-react";

interface Bug {
  id: string;
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  assignee: string;
  reported: string;
  status: "Open" | "In Progress" | "In Review" | "Resolved";
}

interface TopBugsTableProps {
  bugs: Bug[];
}

const TopBugsTable: React.FC<TopBugsTableProps> = ({ bugs = [] }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
      case "High":
        return "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200";
      case "Medium":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
      case "Low":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      default:
        return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
      case "In Progress":
        return "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200";
      case "In Review":
        return "bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200";
      case "Resolved":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      default:
        return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "Critical":
        return (
          <AlertTriangle size={16} className="text-red-500 dark:text-red-400" />
        );
      case "High":
        return (
          <AlertTriangle
            size={16}
            className="text-orange-500 dark:text-orange-400"
          />
        );
      default:
        return (
          <AlertTriangle
            size={16}
            className="text-yellow-500 dark:text-yellow-400"
          />
        );
    }
  };

  if (!bugs.length) {
    return (
      <div className="text-center py-12">
        <AlertTriangle size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No bugs found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          No high-priority bugs are currently active in the selected time range.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Bug
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Severity
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Assignee
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Reported
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {bugs.map((bug) => (
              <tr
                key={bug.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
              >
                <td className="px-6 py-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      {getSeverityIcon(bug.severity)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {bug.id}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {bug.title}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityColor(
                      bug.severity
                    )}`}
                  >
                    {bug.severity}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User
                      size={14}
                      className="mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0"
                    />
                    <div className="text-sm text-gray-900 dark:text-white truncate">
                      {bug.assignee}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Clock
                      size={14}
                      className="mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0"
                    />
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {bug.reported}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      bug.status
                    )}`}
                  >
                    {bug.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <button
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                    onClick={() => {
                      // Navigate to bug details page
                      window.location.href = `/bugs/${bug.id}`;
                    }}
                  >
                    <ExternalLink size={12} className="mr-1" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {bugs.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing <span className="font-medium">{bugs.length}</span>{" "}
              high-priority bugs
            </div>
            <div className="flex items-center space-x-2">
              <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium">
                View all bugs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopBugsTable;
