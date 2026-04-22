// --- ./src/app/dashboard/estimations/approvals/page.tsx ---
"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Loader2, FileText, Image as ImageIcon } from "lucide-react";
import { api } from "@/lib/api";

export default function FinanceApprovalsPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const data = await api.get('/maintenance/logs');
      // Only show damage items waiting for approval
      setApprovals(data.filter((log: any) => log.status === 'Pending Quote Approval' && log.log_type === 'damage'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApprovals(); }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/maintenance/logs/${id}/status`, { status: "Approved for Repair" });
      fetchApprovals();
    } catch (err) {
      alert("Approval failed");
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Finance Quote Approvals</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Review and approve pending VRESS damage estimates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? <div className="flex justify-center p-12 w-full"><Loader2 className="animate-spin text-brand-primary" /></div> :
         approvals.length === 0 ? <div className="p-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-center text-zinc-500 w-full col-span-2">No quotes pending approval.</div> :
         approvals.map(quote => (
          <div key={quote.id} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark shadow-sm flex flex-col md:flex-row overflow-hidden">
            <div className="w-full md:w-48 h-48 md:h-auto bg-zinc-100 dark:bg-zinc-900 relative flex-shrink-0">
              {quote.image_url ? <img src={quote.image_url} className="w-full h-full object-cover" alt="Damage" /> : <div className="flex h-full items-center justify-center text-zinc-400"><ImageIcon /></div>}
            </div>
            <div className="p-5 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-zinc-900 dark:text-zinc-50">{quote.vehicles?.make} {quote.vehicles?.model}</h3>
                <span className="px-2.5 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded text-xs font-bold">Pending Review</span>
              </div>
              <p className="text-sm font-mono text-zinc-500 mb-3">{quote.vehicles?.license_plate}</p>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium mb-4 line-clamp-2">{quote.job_description}</p>
              
              <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-500 uppercase font-semibold">Total Ask</span>
                  <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">R {quote.cost.toLocaleString()}</span>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-500 hover:text-red-500 transition-colors"><XCircle size={20} /></button>
                  <button onClick={() => handleApprove(quote.id)} className="px-4 py-2 bg-zinc-900 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"><CheckCircle2 size={16} /> Approve Quote</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}