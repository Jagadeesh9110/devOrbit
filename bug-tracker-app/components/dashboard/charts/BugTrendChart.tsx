import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface BugTrendData {
  dates: string[];
  newBugs: number[];
  resolvedBugs: number[];
}

interface BugTrendChartProps {
  timeRange: string;
  data?: BugTrendData;
}

const BugTrendChart: React.FC<BugTrendChartProps> = ({ timeRange, data }) => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    if (!data?.dates || !data?.newBugs || !data?.resolvedBugs) {
      setLoading(false);
      return;
    }

    const processedData = {
      labels: data.dates,
      datasets: [
        {
          label: "New Bugs",
          data: data.newBugs,
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          tension: 0.4,
        },
        {
          label: "Resolved Bugs",
          data: data.resolvedBugs,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.4,
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
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  if (!data) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        chartData && <Line data={chartData} options={options} />
      )}
    </div>
  );
};

export default BugTrendChart;
