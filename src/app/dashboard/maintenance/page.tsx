// --- ./src/app/dashboard/maintenance/page.tsx ---
"use client";

import { useState, useEffect } from "react";
import { Search, Wrench, Calendar, CheckCircle2, Plus, Loader2, AlertCircle, X, Save } from "lucide-react";
import clsx from "clsx";
import { api } from "@/lib/api";

export default function MaintenancePage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newLog, setNewLog] = useState({
    vehicle_id: "",
    job_description: "",
    completion_date: new Date().toISOString().split('T')[0], // Today's date
    next_due: "",
    status: "In Progress",
    cost: 0.0
  });

  // Load Data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch logs and vehicles concurrently
      const [logsData, vehiclesData] = await Promise.all([
        api.get('/maintenance/logs'),
        api.get('/vehicles/')
      ]);
      setLogs(logsData);
      setVehicles(vehiclesData);
      
      // Default to first vehicle if none selected
      if (vehiclesData.length > 0 && !newLog.vehicle_id) {
        setNewLog(prev => ({ ...prev, vehicle_id: vehiclesData[0].id }));
      }
    } catch (err: any) {
      setError("Failed to load maintenance data. Please ensure you are logged in.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post('/maintenance/logs', newLog);
      setIsAddModalOpen(false);
      setNewLog({ vehicle_id: vehicles[0]?.id || "", job_description: "", completion_date: new Date().toISOString().split('T')[0], next_due: "", status: "In Progress", cost: 0.0 });
      await fetchData(); // Refresh table
    } catch (err: any) {
      setError(err.message || "Failed to schedule service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.job_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.vehicles?.license_plate && log.vehicles.license_plate.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (log.vehicles?.make && log.vehicles.make.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 relative">
      
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Maintenance & Service Logs</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Track routine services and LMG repair history.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Schedule Service
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* TABLE COMPONENT */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/20">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={16} className="text-zinc-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-lg border border-zinc-200 dark:border-zinc-700 py-2 pl-9 pr-4 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:ring-2 focus:ring-brand-primary outline-none transition-all"
              placeholder="Search records by vehicle or job..."
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
             <div className="flex items-center justify-center h-64 text-zinc-500">
               <Loader2 className="animate-spin mr-2" size={24} /> Loading service records...
             </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-5 py-3 font-medium">Vehicle / Driver</th>
                  <th className="px-5 py-3 font-medium">Job Description</th>
                  <th className="px-5 py-3 font-medium">Completion Date</th>
                  <th className="px-5 py-3 font-medium">Next Due</th>
                  <th className="px-5 py-3 font-medium">Cost</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredLogs.length === 0 && !loading && (
                   <tr>
                     <td colSpan={6} className="px-5 py-8 text-center text-zinc-500">No maintenance records found.</td>
                   </tr>
                )}
                {filteredLogs.map((row) => (
                  <tr key={row.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        {row.vehicles?.make} {row.vehicles?.model} ({row.vehicles?.license_plate || 'No Plate'})
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{row.vehicles?.assigned_to || 'Unassigned'}</p>
                    </td>
                    <td className="px-5 py-4 text-zinc-700 dark:text-zinc-300 font-medium">{row.job_description}</td>
                    <td className="px-5 py-4 text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                      <Calendar size={14} /> {row.completion_date || 'Pending'}
                    </td>
                    <td className="px-5 py-4 text-zinc-500 dark:text-zinc-400">{row.next_due || '-'}</td>
                    <td className="px-5 py-4 font-mono text-zinc-700 dark:text-zinc-300">R {row.cost.toLocaleString()}</td>
                    <td className="px-5 py-4">
                       <span className={clsx(
                        "px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1",
                        row.status === "Completed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      )}>
                        {row.status === "Completed" && <CheckCircle2 size={12} />}
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* SCHEDULE SERVICE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-card-dark rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Wrench size={18} className="text-brand-primary" /> Schedule Service
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddLog} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Select LMG-Fleet Vehicle *</label>
                <select 
                  required value={newLog.vehicle_id} onChange={(e) => setNewLog({...newLog, vehicle_id: e.target.value})}
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                >
                  {vehicles.length === 0 && <option value="">No vehicles found in fleet</option>}
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.license_plate || v.vin} - {v.make} {v.model}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Job Description *</label>
                <input 
                  type="text" required value={newLog.job_description} onChange={(e) => setNewLog({...newLog, job_description: e.target.value})}
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                  placeholder="e.g. 15,000km Major Service"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Target Completion Date</label>
                  <input 
                    type="date" value={newLog.completion_date} onChange={(e) => setNewLog({...newLog, completion_date: e.target.value})}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Next Service Due (Text)</label>
                  <input 
                    type="text" value={newLog.next_due} onChange={(e) => setNewLog({...newLog, next_due: e.target.value})}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                    placeholder="e.g. 30,000km or Oct 2026"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Status</label>
                  <select 
                    value={newLog.status} onChange={(e) => setNewLog({...newLog, status: e.target.value})}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Cost (ZAR)</label>
                  <input 
                    type="number" min="0" step="0.01" value={newLog.cost} onChange={(e) => setNewLog({...newLog, cost: parseFloat(e.target.value)})}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-zinc-200 dark:border-zinc-800 mt-6">
                <button 
                  type="button" onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || !newLog.vehicle_id}  
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {isSubmitting ? "Saving..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}