// components/dashboard/cards/StatsCard.tsx
import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  change: number;
  isPositive: boolean;
  icon: React.ReactNode;
  timeRange: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  isPositive,
  icon,
  timeRange,
}) => {
  const timeRangeText =
    timeRange === "7d" ? "7 days" : timeRange === "30d" ? "30 days" : "90 days";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </span>
        {icon}
      </div>
      <div className="flex items-center">
        <div className="mr-4">
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {value}
          </div>
          <div
            className={`flex items-center text-xs font-medium ${
              isPositive ? "text-green-500" : "text-red-500"
            }`}
          >
            {isPositive ? (
              <ArrowUp size={12} className="mr-1" />
            ) : (
              <ArrowDown size={12} className="mr-1" />
            )}
            <span>
              {Math.abs(change)}% vs last {timeRangeText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
