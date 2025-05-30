// components/dashboard/WorkloadDistribution.tsx
"use client";

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
import { fetchWithAuth } from "@/lib/auth";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const WorkloadDistribution: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const { data: apiData, error } = await fetchWithAuth(
          "/api/team/workload"
        );

        if (error) {
          console.error("Failed to load workload data:", error);
          return;
        }

        setData(apiData);
      } catch (error) {
        console.error("Workload data load error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const chartData = {
    labels: data?.members || [
      "Sarah K.",
      "Mike T.",
      "Alex R.",
      "Jessie L.",
      "Ray P.",
    ],
    datasets: [
      {
        label: "Current Workload",
        data: data?.currentWorkload || [12, 8, 15, 6, 10],
        backgroundColor: "rgba(59, 130, 246, 0.8)",
      },
      {
        label: "Capacity",
        data: data?.capacity || [15, 15, 15, 15, 15],
        backgroundColor: "rgba(209, 213, 219, 0.8)",
      },
    ],
  };

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
        title: {
          display: true,
          text: "Number of Bugs",
        },
      },
      x: {
        title: {
          display: true,
          text: "Team Members",
        },
      },
    },
  };

  return (
    <div className="w-full h-64">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default WorkloadDistribution;
