import { Info, TrendingUp } from "lucide-react";
import React from "react";

interface MetricCardProps {
  value: string;
  label: string;
  sublabel?: string;
  trend?: {
    value: string;
    direction: "up" | "down";
  };
  description?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  value,
  label,
  sublabel,
  trend,
  description,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 min-w-[180px]">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-foreground">{value}</span>
          <Info size={14} className="text-gray-400" />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              trend.direction === "up" ? "text-green-600" : "text-red-600"
            }`}
          >
            <TrendingUp
              size={14}
              className={trend.direction === "down" ? "rotate-180" : ""}
            />
            {trend.value}
          </div>
        )}
      </div>
      <div className="text-sm text-gray-600">{label}</div>
      {sublabel && <div className="text-xs text-gray-400">{sublabel}</div>}
      {description && (
        <p className="mt-3 text-xs text-gray-500 border-t border-gray-100 pt-3">
          {description}
        </p>
      )}
    </div>
  );
};
