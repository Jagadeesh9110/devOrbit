import React from "react";
import { Calendar } from "lucide-react";

interface TimelineFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const TimelineFilter: React.FC<TimelineFilterProps> = ({ value, onChange }) => {
  return (
    <div className="relative inline-block">
      <div className="flex items-center px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150">
        <Calendar size={16} className="mr-2 text-gray-500 dark:text-gray-400" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-sm text-gray-700 dark:text-gray-300 bg-transparent appearance-none border-none focus:ring-0 focus:outline-none pr-8"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default TimelineFilter;
