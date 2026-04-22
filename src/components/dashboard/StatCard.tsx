// --- ./src/components/dashboard/StatCard.tsx ---
import { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon: LucideIcon;
}

export default function StatCard({ title, value, trend, trendUp, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark p-5 flex flex-col justify-between shadow-sm transition-all hover:shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold mt-2 text-zinc-900 dark:text-zinc-50">{value}</h3>
        </div>
        <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
          <Icon size={20} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className={clsx("font-medium", trendUp ? "text-brand-primary" : "text-red-500")}>
            {trendUp ? "↑" : "↓"} {trend}
          </span>
          <span className="text-zinc-500 dark:text-zinc-400">vs last month</span>
        </div>
      )}
    </div>
  );
}