import React from "react";
import { AlertTriangle, Clock, TrendingUp, Users } from "lucide-react";

interface PerformanceMetricsProps {
  data?: {
    detectionEfficiency?: number;
    firstResponseTime?: number;
    bugFixRate?: number;
    developerWorkload?: number;
  };
  isLoading?: boolean;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  data,
  isLoading = false,
}) => {
  // Show loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-lg shadow-sm border animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  // Default values if data is not available
  const metrics = {
    detectionEfficiency: data?.detectionEfficiency ?? 0,
    firstResponseTime: data?.firstResponseTime ?? 0,
    bugFixRate: data?.bugFixRate ?? 0,
    developerWorkload: data?.developerWorkload ?? 0,
  };

  const metricsData = [
    {
      id: 1,
      title: "Bug Detection Efficiency",
      value: `${metrics.detectionEfficiency}%`,
      change: 3.2, // You might want to calculate this from historical data
      isPositive: metrics.detectionEfficiency > 85,
      icon: <AlertTriangle className="h-6 w-6 text-amber-500" />,
    },
    {
      id: 2,
      title: "First Response Time",
      value: `${metrics.firstResponseTime}h`,
      change: -0.5,
      isPositive: true, // Lower response time is better
      icon: <Clock className="h-6 w-6 text-blue-500" />,
    },
    {
      id: 3,
      title: "Bug Fix Rate",
      value: `${metrics.bugFixRate}%`,
      change: 2.1,
      isPositive: metrics.bugFixRate > 80,
      icon: <TrendingUp className="h-6 w-6 text-green-500" />,
    },
    {
      id: 4,
      title: "Developer Workload",
      value: `${metrics.developerWorkload}`,
      change: -1.3,
      isPositive: false, // Higher workload is generally not positive
      icon: <Users className="h-6 w-6 text-purple-500" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricsData.map((metric) => (
        <div
          key={metric.id}
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">
              {metric.title}
            </h3>
            {metric.icon}
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              <div className="flex items-center mt-1">
                <span
                  className={`text-sm font-medium ${
                    metric.isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {metric.isPositive ? "+" : ""}
                  {metric.change}%
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  vs last month
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PerformanceMetrics;
