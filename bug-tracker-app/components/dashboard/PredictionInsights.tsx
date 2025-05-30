// components/dashboard/PredictionInsights.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Activity, AlertTriangle, Clock } from "lucide-react";
import { fetchWithAuth } from "@/lib/auth";

interface PredictionInsightsProps {
  timeRange: string;
}

const PredictionInsights: React.FC<PredictionInsightsProps> = ({
  timeRange,
}) => {
  const [predictions, setPredictions] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPredictions = async () => {
      setLoading(true);
      try {
        const { data, error } = await fetchWithAuth(
          `/api/predictions?range=${timeRange}`
        );

        if (error) {
          console.error("Failed to load predictions:", error);
          return;
        }

        setPredictions(data);
      } catch (error) {
        console.error("Prediction load error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPredictions();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 mb-8">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            AI-Powered Predictions
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Forecasted insights based on current trends
          </p>
        </div>
        <Activity className="text-primary-500" size={24} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <AlertTriangle className="text-yellow-500 mr-2" size={18} />
            <h3 className="font-medium text-slate-800 dark:text-white">
              Critical Bug Probability
            </h3>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">
            {predictions?.criticalProbability || "24%"}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Likelihood of critical bugs in next 7 days
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Clock className="text-blue-500 mr-2" size={18} />
            <h3 className="font-medium text-slate-800 dark:text-white">
              Resolution Forecast
            </h3>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">
            {predictions?.resolutionForecast || "72%"}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Expected resolution rate in next 14 days
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Activity className="text-green-500 mr-2" size={18} />
            <h3 className="font-medium text-slate-800 dark:text-white">
              Workload Alert
            </h3>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">
            {predictions?.workloadAlert || "Moderate"}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Predicted team workload for next week
          </p>
        </div>
      </div>
    </div>
  );
};

export default PredictionInsights;
