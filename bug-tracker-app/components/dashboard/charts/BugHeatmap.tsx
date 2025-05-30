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
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface BugTrendChartProps {
  timeRange: string;
}

const BugTrendChart: React.FC<BugTrendChartProps> = ({ timeRange }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call with different data based on timeRange
    setLoading(true);

    // Generate dates for the x-axis based on the selected time range
    const generateDates = () => {
      const dates = [];
      const count = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const today = new Date();

      for (let i = count - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dates.push(
          date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        );
      }

      return dates;
    };

    // Generate random data based on the time range
    const generateData = () => {
      const count = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const newBugs = [];
      const resolvedBugs = [];

      let newValue = Math.floor(Math.random() * 5) + 3;
      let resolvedValue = Math.floor(Math.random() * 5) + 2;

      for (let i = 0; i < count; i++) {
        // Add some randomness but keep the trend somewhat realistic
        newValue = Math.max(
          1,
          Math.min(15, newValue + (Math.random() * 4 - 2))
        );
        resolvedValue = Math.max(
          1,
          Math.min(15, resolvedValue + (Math.random() * 4 - 1.8))
        );

        newBugs.push(Math.floor(newValue));
        resolvedBugs.push(Math.floor(resolvedValue));
      }

      return { newBugs, resolvedBugs };
    };

    const dates = generateDates();
    const { newBugs, resolvedBugs } = generateData();

    const chartData = {
      labels: dates,
      datasets: [
        {
          label: "New Bugs",
          data: newBugs,
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.1)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Resolved Bugs",
          data: resolvedBugs,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    };

    setTimeout(() => {
      setData(chartData);
      setLoading(false);
    }, 500);
  }, [timeRange]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
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
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  };

  return (
    <div className="w-full h-64">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        data && <Line data={data} options={options} />
      )}
    </div>
  );
};

export default BugTrendChart;
