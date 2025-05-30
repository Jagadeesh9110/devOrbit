import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface SeverityData {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface BugsBySeverityChartProps {
  data?: SeverityData;
}

const BugsBySeverityChart: React.FC<BugsBySeverityChartProps> = ({ data }) => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    if (!data) {
      setLoading(false);
      return;
    }

    const processedData = {
      labels: ["Critical", "High", "Medium", "Low"],
      datasets: [
        {
          data: [
            data.critical || 0,
            data.high || 0,
            data.medium || 0,
            data.low || 0,
          ],
          backgroundColor: [
            "rgba(255, 99, 132, 0.9)",
            "rgba(255, 159, 64, 0.9)",
            "rgba(255, 205, 86, 0.9)",
            "rgba(75, 192, 192, 0.9)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(255, 159, 64, 1)",
            "rgba(255, 205, 86, 1)",
            "rgba(75, 192, 192, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };

    setTimeout(() => {
      setChartData(processedData);
      setLoading(false);
    }, 100);
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage =
              total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    cutout: "65%",
  };

  if (!data) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">
          No severity data available
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-64 flex items-center justify-center">
      {loading ? (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      ) : (
        <div className="w-full h-full">
          {chartData && <Doughnut data={chartData} options={options} />}
        </div>
      )}
    </div>
  );
};

export default BugsBySeverityChart;
