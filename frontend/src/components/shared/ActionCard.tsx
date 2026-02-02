import React from "react";
import Link from "next/link";

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: "blue" | "purple" | "green" | "orange" | "indigo" | "gray";
}

const colorClasses = {
  blue: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
  purple: "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400",
  green: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
  orange: "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400",
  indigo: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400",
  gray: "bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400"
};

export default function ActionCard({ title, description, icon, href, color }: ActionCardProps) {
  return (
    <Link 
      href={href} 
      className="p-6 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 flex items-start gap-4 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700 transition-all cursor-pointer group"
    >
      <div className={`flex items-center justify-center w-14 h-14 rounded-xl ${colorClasses[color]} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </Link>
  );
}
