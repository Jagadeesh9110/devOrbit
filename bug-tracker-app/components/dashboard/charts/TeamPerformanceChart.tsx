import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TeamPerformanceData {
  members: string[];
  avgResolutionTimes: number[];
  bugsResolved: number[];
}

interface TeamPerformanceChartProps {
  timeRange: string;
  data?: TeamPerformanceData; // Make data optional
  isLoading?: boolean;
}

const TeamPerformanceChart: React.FC<TeamPerformanceChartProps> = ({
  timeRange,
  data,
  isLoading = false,
}) => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // Check if data exists and has the required properties
    if (
      !data ||
      !data.members ||
      !data.avgResolutionTimes ||
      !data.bugsResolved ||
      data.members.length === 0
    ) {
      // Set empty chart data or show placeholder
      setChartData(null);
      setLoading(false);
      return;
    }

    const processedData = {
      labels: data.members,
      datasets: [
        {
          label: "Avg. Resolution Time (hours)",
          data: data.avgResolutionTimes,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
          yAxisID: "y",
        },
        {
          label: "Bugs Resolved",
          data: data.bugsResolved,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
          yAxisID: "y1",
        },
      ],
    };

    setTimeout(() => {
      setChartData(processedData);
      setLoading(false);
    }, 100);
  }, [timeRange, data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.dataset.label || "";
            if (label.includes("Resolution Time")) {
              return `${label}: ${context.raw.toFixed(1)} hours`;
            } else {
              return `${label}: ${context.raw} bugs`;
            }
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        title: {
          display: true,
          text: "Resolution Time (hours)",
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        title: {
          display: true,
          text: "Bugs Resolved",
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  // Show loading spinner when data is being fetched or component is loading
  if (isLoading || loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Show empty state when no data is available
  if (!data || !data.members || data.members.length === 0) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-gray-500">
        <div className="text-lg mb-2">👥</div>
        <div className="text-sm text-center">
          <p className="font-medium">No Team Performance Data Available</p>
          <p className="text-xs mt-1">
            Assign bugs to team members to see performance metrics
          </p>
        </div>
      </div>
    );
  }

  // Show chart when data is available
  return (
    <div className="w-full h-64">
      {chartData && <Bar data={chartData} options={options} />}
    </div>
  );
};

export default TeamPerformanceChart;
