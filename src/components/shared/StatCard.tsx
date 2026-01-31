import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: "blue" | "yellow" | "green" | "red" | "purple" | "indigo" | "gray";
  loading?: boolean;
}

const colorClasses = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-600 dark:text-blue-400",
    valueText: "text-gray-800 dark:text-white"
  },
  yellow: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-600 dark:text-amber-400",
    valueText: "text-gray-800 dark:text-white"
  },
  green: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-600 dark:text-emerald-400",
    valueText: "text-gray-800 dark:text-white"
  },
  red: {
    bg: "bg-rose-50 dark:bg-rose-950/30",
    text: "text-rose-600 dark:text-rose-400",
    valueText: "text-gray-800 dark:text-white"
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    text: "text-purple-600 dark:text-purple-400",
    valueText: "text-gray-800 dark:text-white"
  },
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    text: "text-indigo-600 dark:text-indigo-400",
    valueText: "text-gray-800 dark:text-white"
  },
  gray: {
    bg: "bg-slate-50 dark:bg-slate-800/50",
    text: "text-slate-600 dark:text-slate-400",
    valueText: "text-gray-800 dark:text-white"
  }
};

export default function StatCard({ title, value, icon, color, loading }: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4 mb-3">
        <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
          <div className={colors.text}>
            {icon}
          </div>
        </div>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </span>
      </div>
      <h4 className={`text-3xl font-bold ${colors.valueText}`}>
        {loading ? "..." : value}
      </h4>
    </div>
  );
}
