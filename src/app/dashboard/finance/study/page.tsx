// --- ./src/app/dashboard/finance/study/page.tsx ---
"use client";

import { useEffect, useState } from "react";
import { Search, Loader2, AlertTriangle, Car } from "lucide-react";
import { api } from "@/lib/api";
import clsx from "clsx";

export default function VehicleCostStudyPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/finance/overview").then(res => {
      setData(res.vehicle_breakdown || []);
      setLoading(false);
    }).catch(console.error);
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-brand-primary w-8 h-8" /></div>;

  const filteredData = data.filter(v => 
    v.plate.toLowerCase().includes(search.toLowerCase()) || 
    v.make.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Vehicle Cost Study</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Identify high-cost assets and assess decommissioning thresholds.</p>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex bg-zinc-50/50 dark:bg-zinc-900/20">
          <div className="relative w-full max-w-md">
            <Search size={16} className="absolute left-3 top-3 text-zinc-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 py-2 pl-9 pr-4 text-sm bg-white dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder="Search by license plate or make..."
            />
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-5 py-3 font-medium">Vehicle</th>
              <th className="px-5 py-3 font-medium">Routine Spend</th>
              <th className="px-5 py-3 font-medium">Damage Spend</th>
              <th className="px-5 py-3 font-medium">Total Lifetime Cost</th>
              <th className="px-5 py-3 font-medium">Study Insight</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {filteredData.map((row, idx) => {
              // Simple study logic: if damage is more than routine, or total > 10000, flag it.
              const isLemon = row.damage > row.routine && row.damage > 0;
              const highCost = row.total > 15000;

              return (
                <tr key={row.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">{row.make} {row.model}</p>
                    <p className="text-xs text-zinc-500 font-mono">{row.plate || 'No Plate'}</p>
                  </td>
                  <td className="px-5 py-4 text-emerald-600 dark:text-emerald-400">R {row.routine.toLocaleString()}</td>
                  <td className="px-5 py-4 text-amber-600 dark:text-amber-400">R {row.damage.toLocaleString()}</td>
                  <td className="px-5 py-4 font-bold text-zinc-900 dark:text-zinc-50">R {row.total.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    {isLemon ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded w-fit">
                        <AlertTriangle size={12} /> High Collision Ratio
                      </span>
                    ) : highCost ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded w-fit">
                        <Car size={12} /> Review Decommission
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-500">Standard Operation</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}