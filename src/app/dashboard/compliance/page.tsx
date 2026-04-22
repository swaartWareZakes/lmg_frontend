// --- ./src/app/dashboard/compliance/page.tsx ---
"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, AlertTriangle, FileCheck, FileWarning, Loader2, Plus, X, Save } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { api } from "@/lib/api";

export default function CompliancePage() {
  const [data, setData] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAlert, setNewAlert] = useState({
    vehicle_id: "",
    issue: "",
    severity: "Warning"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overview, vData] = await Promise.all([
        api.get('/compliance/overview'),
        api.get('/vehicles/')
      ]);
      setData(overview);
      setVehicles(vData);
      if (vData.length > 0 && !newAlert.vehicle_id) {
        setNewAlert(prev => ({ ...prev, vehicle_id: vData[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await api.patch(`/compliance/alerts/${id}/resolve`);
      fetchData(); // Refresh the data to update stats and remove from list
    } catch (err) {
      alert("Failed to resolve alert.");
    }
  };

  const handleAddAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/compliance/alerts', newAlert);
      setIsModalOpen(false);
      setNewAlert({ vehicle_id: vehicles[0]?.id || "", issue: "", severity: "Warning" });
      fetchData();
    } catch (err: any) {
      alert("Failed to create alert: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-brand-primary w-8 h-8" /></div>;
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 relative">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Compliance & Risk Management</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Monitor roadworthiness, licensing, and regulatory compliance.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-brand-primary hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus size={16} /> Run Audit / Flag Issue
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard title="Overall Compliance" value={data?.stats.overall_compliance || "0%"} icon={ShieldCheck} />
        <StatCard title="Active Violations (Critical)" value={data?.stats.active_violations || 0} icon={AlertTriangle} />
        <StatCard title="Pending Renewals (Warnings)" value={data?.stats.pending_renewals || 0} icon={FileCheck} />
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark shadow-sm overflow-hidden mt-2">
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Active Risk Alerts</h3>
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800 p-2">
          {data?.alerts.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">All vehicles are fully compliant! No active alerts.</div>
          ) : (
            data?.alerts.map((alert: any) => (
              <div key={alert.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/30 rounded-lg transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${alert.severity === 'Critical' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                    {alert.severity === 'Critical' ? <AlertTriangle size={20} /> : <FileWarning size={20} />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{alert.issue}</h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {alert.vehicles?.make} {alert.vehicles?.model} ({alert.vehicles?.license_plate})
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
                    Logged: {new Date(alert.created_at).toLocaleDateString()}
                  </span>
                  <button 
                    onClick={() => handleResolve(alert.id)}
                    className="text-sm text-brand-primary font-medium hover:text-emerald-500 transition-colors"
                  >
                    Resolve Alert
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CREATE ALERT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-card-dark rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Flag Compliance Issue</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddAlert} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Select Vehicle</label>
                <select 
                  required value={newAlert.vehicle_id} onChange={(e) => setNewAlert({...newAlert, vehicle_id: e.target.value})}
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.license_plate} - {v.make} {v.model}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Issue Description</label>
                <input 
                  type="text" required value={newAlert.issue} onChange={(e) => setNewAlert({...newAlert, issue: e.target.value})}
                  placeholder="e.g. License Disk Expired"
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Severity</label>
                <select 
                  required value={newAlert.severity} onChange={(e) => setNewAlert({...newAlert, severity: e.target.value})}
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                >
                  <option value="Warning">Warning (e.g., Upcoming Renewal)</option>
                  <option value="Critical">Critical (e.g., Expired/Unroadworthy)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-zinc-200 dark:border-zinc-800 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-sm font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Submit Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}