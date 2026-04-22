// --- ./src/components/dashboard/RecentActivityTable.tsx ---
import { ExternalLink, Wrench, Calculator, AlertTriangle, ShieldCheck, Activity } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";

export default function RecentActivityTable({ activities = [] }: { activities: any[] }) {
  
  // Helper to assign icons and colors based on activity type
  const getStyling = (type: string) => {
    switch(type) {
      case 'damage': return { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/30" };
      case 'routine': return { icon: Wrench, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" };
      case 'compliance': return { icon: ShieldCheck, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/30" };
      default: return { icon: Activity, color: "text-brand-primary", bg: "bg-brand-primary/10" };
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark shadow-sm overflow-hidden mt-6">
      <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/20">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">LMG Recent Activity Tab</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Live feed of estimates, compliance alerts, and maintenance logs.</p>
        </div>
        <button className="text-sm text-brand-primary hover:text-emerald-500 font-medium transition-colors">View All History</button>
      </div>
      <div className="overflow-x-auto min-h-[200px]">
        {activities.length === 0 ? (
          <div className="flex justify-center items-center h-48 text-zinc-500 text-sm">
            No recent activity found.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {activities.map((row, idx) => {
                const style = getStyling(row.type);
                return (
                  <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer group">
                    <td className="px-5 py-4 w-12">
                      <div className={clsx("p-2 rounded-lg", style.bg, style.color)}>
                        <style.icon size={18} />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1">{row.action}</p>
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">{row.vehicle}</p>
                    </td>
                    <td className="px-5 py-4 text-zinc-500 dark:text-zinc-400">
                      <span className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-xs font-medium capitalize">{row.type}</span>
                    </td>
                    <td className="px-5 py-4 text-zinc-500 dark:text-zinc-400 text-xs">{row.date}</td>
                    <td className="px-5 py-4 text-right">
                      <Link href={row.link} className="text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 justify-end text-xs font-medium hover:underline">
                        Review <ExternalLink size={14} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}