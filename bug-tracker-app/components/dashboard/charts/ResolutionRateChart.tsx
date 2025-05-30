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

interface ResolutionRateData {
  dates: string[];
  rates: number[];
}

interface ResolutionRateChartProps {
  timeRange: string;
  data?: ResolutionRateData; // Make data optional
  isLoading?: boolean;
}

const ResolutionRateChart: React.FC<ResolutionRateChartProps> = ({
  timeRange,
  data,
  isLoading = false,
}) => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // Check if data exists and has the required properties
    if (!data || !data.dates || !data.rates || data.dates.length === 0) {
      // Set empty chart data or show placeholder
      setChartData(null);
      setLoading(false);
      return;
    }

    const targetRates = new Array(data.dates.length).fill(85);

    const processedData = {
      labels: data.dates,
      datasets: [
        {
          label: "Resolution Rate",
          data: data.rates,
          borderColor: "rgba(54, 162, 235, 1)",
          backgroundColor: "rgba(54, 162, 235, 0.1)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Target Rate",
          data: targetRates,
          borderColor: "rgba(255, 159, 64, 1)",
          backgroundColor: "transparent",
          borderDash: [5, 5],
          fill: false,
          tension: 0,
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
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ${context.raw}%`;
          },
        },
      },
    },
    scales: {
      y: {
        min: 60,
        max: 100,
        ticks: {
          callback: function (value: any) {
            return value + "%";
          },
        },
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

  // Show loading spinner when data is being fetched or component is loading
  if (isLoading || loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show empty state when no data is available
  if (!data || !data.dates || data.dates.length === 0) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-gray-500">
        <div className="text-lg mb-2">📊</div>
        <div className="text-sm text-center">
          <p className="font-medium">No Resolution Rate Data Available</p>
          <p className="text-xs mt-1">
            Data will appear once bugs are resolved
          </p>
        </div>
      </div>
    );
  }

  // Show chart when data is available
  return (
    <div className="w-full h-64">
      {chartData && <Line data={chartData} options={options} />}
    </div>
  );
};

export default ResolutionRateChart;
