// --- ./src/app/dashboard/issues/page.tsx ---
"use client";

import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, Image as ImageIcon, Loader2, Trash2 } from "lucide-react";
import clsx from "clsx";
import { api } from "@/lib/api";

export default function ActiveIssuesPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const data = await api.get('/maintenance/logs');
      // Show ALL damages except completed ones
      setIssues(data.filter((log: any) => log.log_type === 'damage' && log.status !== 'Completed'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIssues(); }, []);

  const markCompleted = async (id: string) => {
    try {
      await api.patch(`/maintenance/logs/${id}/status`, { status: "Completed" });
      fetchIssues();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  // NEW: Delete function
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this issue?")) return;
    
    try {
      await api.delete(`/maintenance/logs/${id}`);
      fetchIssues(); // Refresh the board
    } catch (err) {
      alert("Failed to delete issue.");
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Reported Damage & Issues</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Track un-scheduled damages, view AI evidence, and mark repairs as resolved.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? <div className="col-span-full flex justify-center py-12"><Loader2 className="animate-spin text-brand-primary" size={32} /></div> : 
         issues.length === 0 ? <div className="col-span-full text-center py-12 text-zinc-500 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">No active vehicle issues.</div> : 
         issues.map((issue) => {
           const isApproved = issue.status === 'Approved for Repair';
           
           return (
            <div key={issue.id} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark shadow-sm overflow-hidden flex flex-col group">
              <div className="h-48 bg-zinc-100 dark:bg-zinc-900 relative flex items-center justify-center border-b border-zinc-200 dark:border-zinc-800">
                {issue.image_url ? <img src={issue.image_url} alt="Damage" className="w-full h-full object-cover" /> : <div className="text-zinc-400 flex flex-col items-center"><ImageIcon size={32} /></div>}
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className={clsx("px-2.5 py-1 rounded-full text-xs font-bold shadow-sm", isApproved ? "bg-brand-primary text-white" : "bg-amber-500 text-white")}>
                    {issue.status}
                  </span>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-zinc-900 dark:text-zinc-50 mb-1 flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-500"/>
                  {issue.vehicles?.make} {issue.vehicles?.model}
                </h3>
                <p className="text-sm font-mono text-zinc-500 mb-3">{issue.vehicles?.license_plate}</p>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium line-clamp-2 flex-1">{issue.job_description}</p>
                
                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Cost: R {issue.cost}</span>
                  
                  <div className="flex items-center gap-2">
                    {/* Delete Button */}
                    <button 
                      onClick={() => handleDelete(issue.id)} 
                      className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Delete Issue"
                    >
                      <Trash2 size={16} />
                    </button>

                    {isApproved ? (
                      <button onClick={() => markCompleted(issue.id)} className="px-3 py-1.5 bg-zinc-900 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1">
                        <CheckCircle2 size={14} /> Mark Paid & Fixed
                      </button>
                    ) : (
                      <span className="text-xs font-medium text-amber-500 bg-amber-50 dark:bg-amber-900/10 px-2 py-1 rounded">Awaiting Finance</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
         })}
      </div>
    </div>
  );
}