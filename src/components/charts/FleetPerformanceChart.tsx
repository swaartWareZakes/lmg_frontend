// --- ./src/components/charts/FleetPerformanceChart.tsx ---
"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function FleetPerformanceChart() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);

    const fetchAndScaleData = async () => {
      try {
        // Fetch real data to scale the chart dynamically
        const [vehicles, logs] = await Promise.all([
          api.get('/vehicles/'),
          api.get('/maintenance/logs')
        ]);
        
        const totalVehicles = vehicles.length || 10; // Fallback to avoid zeroes
        
        // Count vehicles that are actively grounded (not completed)
        const groundedCount = logs.filter((l: any) => l.status !== 'Completed').length;
        
        // The pool of vehicles available to be on the road
        const activePool = Math.max(0, totalVehicles - groundedCount);

        // Generate a realistic 24-hour daily deployment curve scaled to the real fleet size
        const dynamicData = [
          { time: "00:00", active: Math.round(activePool * 0.05), maintenance: groundedCount },
          { time: "04:00", active: Math.round(activePool * 0.15), maintenance: groundedCount },
          { time: "08:00", active: Math.round(activePool * 0.75), maintenance: groundedCount },
          { time: "12:00", active: Math.round(activePool * 0.95), maintenance: groundedCount }, // Peak usage
          { time: "16:00", active: Math.round(activePool * 0.85), maintenance: groundedCount },
          { time: "20:00", active: Math.round(activePool * 0.30), maintenance: groundedCount },
          { time: "24:00", active: Math.round(activePool * 0.05), maintenance: groundedCount },
        ];
        
        setChartData(dynamicData);
      } catch (error) {
        console.error("Failed to load chart data", error);
      }
    };

    fetchAndScaleData();
  }, []);

  if (!mounted || chartData.length === 0) {
    return <div className="h-[300px] w-full animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-xl" />;
  }

  const isDark = theme === "dark";

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark p-5 shadow-sm h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-1 text-zinc-900 dark:text-zinc-50">24 Hour Fleet Deployment</h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">Estimated daily utilization curve scaled to active assets.</p>
      
      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#3f3f46" : "#e4e4e7"} vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke={isDark ? "#a1a1aa" : "#71717a"} 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke={isDark ? "#a1a1aa" : "#71717a"} 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDark ? "#1e2128" : "#ffffff",
                borderColor: isDark ? "#27272a" : "#e4e4e7",
                borderRadius: "8px",
                color: isDark ? "#fafafa" : "#18181b"
              }}
            />
            <Line 
              type="monotone" 
              dataKey="active" 
              name="Deployed on Road" 
              stroke="#10b981" 
              strokeWidth={3} 
              dot={{ r: 4, strokeWidth: 2 }} 
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="maintenance" 
              name="Grounded / In Workshop" 
              stroke="#f59e0b" 
              strokeWidth={3} 
              dot={{ r: 4, strokeWidth: 2 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}