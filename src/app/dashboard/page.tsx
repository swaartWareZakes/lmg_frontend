// --- ./src/app/dashboard/page.tsx ---
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatCard from "@/components/dashboard/StatCard";
import FleetPerformanceChart from "@/components/charts/FleetPerformanceChart";
import RecentActivityTable from "@/components/dashboard/RecentActivityTable";
import { Car, AlertTriangle, Calculator, CheckCircle, Loader2, FileWarning } from "lucide-react";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [driverVehicle, setDriverVehicle] = useState<any>(null);

  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeDeployments: 0,
    pendingQuotes: 0,
    criticalGroundings: 0,
    readinessRate: 0,
  });
  
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Fetch User Profile to determine Role
        const userProfile = await api.get('/orgs/me');
        setProfile(userProfile);

        // 2. Branch Logic based on Role
        if (userProfile.role === 'driver') {
          // DRIVER: Only fetch their assigned vehicle
          const myVehicles = await api.get('/vehicles/');
          if (myVehicles.length > 0) setDriverVehicle(myVehicles[0]);
        } else {
          // ADMIN: Fetch full fleet context concurrently
          const [vehicles, logs, compliance] = await Promise.all([
            api.get('/vehicles/'),
            api.get('/maintenance/logs'),
            api.get('/compliance/overview')
          ]);

          const total = vehicles.length;
          const pending = logs.filter((l: any) => l.status.includes('Pending')).length;
          const damageIssues = logs.filter((l: any) => l.log_type === 'damage' && l.status !== 'Completed').length;
          const criticalCompliance = compliance?.stats?.active_violations || 0;
          const grounded = damageIssues + criticalCompliance;
          const active = Math.max(0, total - grounded);
          const readiness = total > 0 ? Math.round((active / total) * 100) : 0;

          setStats({
            totalVehicles: total,
            activeDeployments: active,
            pendingQuotes: pending,
            criticalGroundings: grounded,
            readinessRate: readiness,
          });

          const formattedLogs = logs.slice(0, 4).map((log: any) => ({
            action: log.job_description,
            vehicle: `${log.vehicles?.make} ${log.vehicles?.model} (${log.vehicles?.license_plate || 'No Plate'})`,
            type: log.log_type,
            date: new Date(log.created_at).toLocaleDateString(),
            link: log.log_type === 'damage' ? '/dashboard/issues' : '/dashboard/maintenance'
          }));

          const formattedAlerts = (compliance?.alerts || []).slice(0, 2).map((alert: any) => ({
            action: alert.issue,
            vehicle: `${alert.vehicles?.make} ${alert.vehicles?.model} (${alert.vehicles?.license_plate})`,
            type: 'compliance',
            date: new Date(alert.created_at).toLocaleDateString(),
            link: '/dashboard/compliance'
          }));

          const combined = [...formattedLogs, ...formattedAlerts].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          ).slice(0, 5);

          setRecentActivity(combined);
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleToggleStatus = async () => {
    if(!driverVehicle) return;
    try {
      const res = await api.patch(`/vehicles/${driverVehicle.id}/toggle-status`);
      setDriverVehicle(res);
    } catch (err) { 
      alert("Failed to update status"); 
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-brand-primary">
          <Loader2 className="animate-spin" size={40} />
          <p className="text-zinc-500 dark:text-zinc-400 font-medium animate-pulse">Aggregating LMG-Fleet Data...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 1: DRIVER PORTAL
  // ==========================================
  if (profile?.role === 'driver') {
    return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-3xl mx-auto mt-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Welcome, {profile.full_name.split(' ')[0]}</h1>
          <p className="text-zinc-500 mt-2">Driver Operations Portal</p>
        </div>
        
        {driverVehicle ? (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark p-8 shadow-lg text-center mt-4">
            <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Car size={48} className="text-brand-primary" />
            </div>
            
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              {driverVehicle.make} {driverVehicle.model}
            </h2>
            <div className="text-xl font-mono bg-zinc-100 dark:bg-zinc-800 px-6 py-2 rounded-lg inline-block font-bold tracking-widest text-zinc-700 dark:text-zinc-300 mb-8 border border-zinc-200 dark:border-zinc-700">
              {driverVehicle.license_plate}
            </div>
            
            <div className="flex flex-col gap-4 max-w-sm mx-auto">
              <button 
                onClick={handleToggleStatus} 
                className={`w-full py-4 rounded-xl font-bold text-white shadow-md transition-all hover:scale-[1.02] ${driverVehicle.status === 'Checked Out' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-brand-primary hover:bg-emerald-600'}`}
              >
                {driverVehicle.status === 'Checked Out' ? "Return Vehicle (Check-In)" : "Start Shift (Check-Out)"}
              </button>

              <Link href="/dashboard/estimations" className="w-full py-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold flex justify-center items-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                <FileWarning size={20} /> Report Accident / Damage
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500 mt-4 bg-white dark:bg-card-dark">
            <AlertTriangle size={32} className="mx-auto mb-4 opacity-50" />
            <p>No vehicle is currently assigned to your profile.</p>
            <p className="text-sm mt-2">Please contact your Fleet Administrator.</p>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW 2: ADMIN DASHBOARD (Your exact original code preserved)
  // ==========================================
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">LMG-Fleet Overview</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Real-time government asset tracking and repair estimation portal.</p>
        </div>
        <Link href="/dashboard/fleet" className="px-4 py-2 bg-brand-primary hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors shadow-sm inline-flex items-center gap-2">
          + Register Gov Vehicle
        </Link>
      </div>
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="Total Gov Vehicles" value={stats.totalVehicles} icon={Car} />
        <StatCard title="Active Deployments" value={stats.activeDeployments} trend={`${stats.readinessRate}% Ready`} trendUp={stats.readinessRate > 80} icon={CheckCircle} />
        <StatCard title="Pending LMG Quotes" value={stats.pendingQuotes} trend="Needs Approval" trendUp={false} icon={Calculator} />
        <StatCard title="Critical Groundings" value={stats.criticalGroundings} trend="Action Required" trendUp={false} icon={AlertTriangle} />
      </div>

      {/* Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FleetPerformanceChart />
        </div>
        
        {/* Fleet Readiness Breakdown */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark p-5 h-full flex flex-col justify-center items-center text-center shadow-sm">
             <div className="w-48 h-48 rounded-full border-[16px] border-zinc-100 dark:border-zinc-800 relative flex items-center justify-center overflow-hidden">
                {/* Dynamic SVG for Circular Progress */}
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="transparent" stroke="currentColor" strokeWidth="16" className="text-zinc-100 dark:text-zinc-800" />
                  <circle 
                    cx="50" cy="50" r="42" fill="transparent" 
                    stroke={stats.readinessRate > 80 ? "#10b981" : stats.readinessRate > 50 ? "#f59e0b" : "#ef4444"} 
                    strokeWidth="16" 
                    strokeDasharray="264" 
                    strokeDashoffset={264 - (264 * stats.readinessRate) / 100} 
                    className="transition-all duration-1000 ease-out" 
                  />
                </svg>
                <div className="text-center z-10">
                  <span className="block text-3xl font-bold text-zinc-900 dark:text-zinc-50">{stats.readinessRate}%</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Readiness</span>
                </div>
             </div>
             <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
               {stats.readinessRate >= 80 ? "Fleet availability is optimal." : stats.readinessRate >= 50 ? "Fleet requires maintenance attention." : "Critical fleet shortages detected."} Target is 80%.
             </p>
          </div>
        </div>
      </div>

      <div>
        <RecentActivityTable activities={recentActivity} />
      </div>
    </div>
  );
}