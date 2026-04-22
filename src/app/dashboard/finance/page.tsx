// --- ./src/app/dashboard/finance/page.tsx ---
"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import { DollarSign, TrendingUp, Download, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function FinancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/finance/overview").then(res => {
      setData(res);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const downloadCSV = () => {
    if (!data?.raw_logs) return;
    const headers = "Date,Vehicle,Type,Job,Cost,Status\n";
    const csv = data.raw_logs.map((log: any) => 
      `${log.created_at.split('T')[0]},${log.vehicles?.license_plate || 'N/A'},${log.log_type},"${log.job_description}",${log.cost},${log.status}`
    ).join("\n");
    
    const blob = new Blob([headers + csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GFleet_Finance_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-brand-primary w-8 h-8" /></div>;

  const chartData = [
    { name: "YTD Spend", Routine: data.breakdown.routine, Damage: data.breakdown.damage }
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Financial Overview & Savings</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Real-time cost analytics and preventative maintenance ROI.</p>
        </div>
        <button onClick={downloadCSV} className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
          <Download size={16} /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard title="Total Spent (Completed)" value={`R ${data.total_spent.toLocaleString()}`} icon={DollarSign} />
        <StatCard title="Pending Approvals" value={`R ${data.pending_costs.toLocaleString()}`} trend="Awaiting Finance" trendUp={false} icon={AlertCircle} />
        <StatCard title="Est. Preventative Savings" value={`R ${data.preventative_savings.toLocaleString()}`} trend="ROI vs Failure" trendUp={true} icon={ShieldCheck} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cost Analysis Visualizer */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark p-6 shadow-sm">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Spend Category Comparison</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#3f3f46" />
                <XAxis type="number" stroke="#a1a1aa" fontSize={12} tickFormatter={(value) => `R${value}`} />
                <YAxis dataKey="name" type="category" stroke="#a1a1aa" fontSize={12} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: "#1e2128", borderColor: "#27272a", color: "#fff", borderRadius: "8px" }} />
                <Legend />
                <Bar dataKey="Routine" stackId="a" fill="#10b981" radius={[4, 0, 0, 4]} name="Routine Maintenance" />
                <Bar dataKey="Damage" stackId="a" fill="#f59e0b" radius={[0, 4, 4, 0]} name="LMG Damage Repairs" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost of Delay Study */}
        <div className="lg:col-span-1 rounded-xl border-2 border-brand-primary/20 bg-brand-primary/5 p-6 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10 text-brand-primary"><ShieldCheck size={120} /></div>
          <h3 className="font-bold text-brand-primary text-lg mb-2 relative z-10">The Cost of Delay (CoD)</h3>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4 relative z-10">
            Why approve services now? Industry data indicates that delaying routine maintenance increases catastrophic failure risk by 60%.
          </p>
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700 relative z-10 mt-auto">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-zinc-500">Average Routine Cost:</span>
              <span className="font-bold text-emerald-500">R 3,500</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Average Engine Failure:</span>
              <span className="font-bold text-red-500">R 45,000</span>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs font-medium text-zinc-400 text-center">
              Every R1 spent on routine saves R4.20
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}