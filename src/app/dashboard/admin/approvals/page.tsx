"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck, XCircle, RefreshCcw } from "lucide-react";
import { api } from "@/lib/api";

const currency = (value: any) =>
  `R ${Number(value || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function AdminApprovalsPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const data = await api.get("/admin/approvals");
      setApprovals(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const decide = async (id: string, action: "approve" | "reject" | "request-revision") => {
    const comment =
      action === "approve"
        ? "Estimate approved by admin."
        : action === "reject"
        ? prompt("Reason for rejection?") || "Estimate rejected by admin."
        : prompt("What changes are required?") || "Revision requested by admin.";

    setBusyId(id);
    try {
      await api.post(`/admin/approvals/${id}/${action}`, {
        comment,
        requested_changes: action === "request-revision" ? comment : undefined,
      });
      await fetchApprovals();
    } catch (err: any) {
      alert(err?.message || "Approval action failed.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.22em] text-brand-primary">Admin Approvals</p>
        <h1 className="mt-1 text-3xl font-black text-zinc-950 dark:text-white">Estimate Approval Queue</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Review selected estimates submitted by technicians and approve, reject or request revision.
        </p>
      </div>

      <div className="grid gap-5">
        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
          </div>
        ) : approvals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 p-12 text-center text-zinc-500 dark:border-zinc-800">
            No estimates awaiting approval yet.
          </div>
        ) : (
          approvals.map((item) => (
            <div key={item.approval_request_id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-card-dark">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <ShieldCheck size={18} className="text-brand-primary" />
                    <h2 className="text-lg font-black text-zinc-950 dark:text-white">{item.job_title}</h2>
                    <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                      Pending
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-500">
                    {item.make} {item.model} · {item.license_plate || item.vin || "No plate"} · {item.priority || "No priority"}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Submitted by {item.submitted_by_name || "Technician"} · Source: {item.estimate_source}
                  </p>
                </div>

                <div className="text-left lg:text-right">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Estimate total</p>
                  <p className="mt-1 text-2xl font-black text-brand-primary">{currency(item.total_estimate)}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950/40">
                  <p className="text-xs font-bold uppercase text-zinc-500">Parts</p>
                  <p className="mt-1 font-black">{currency(item.total_parts)}</p>
                </div>
                <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950/40">
                  <p className="text-xs font-bold uppercase text-zinc-500">Labour</p>
                  <p className="mt-1 font-black">{currency(item.total_labor)}</p>
                </div>
                <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950/40">
                  <p className="text-xs font-bold uppercase text-zinc-500">Paint</p>
                  <p className="mt-1 font-black">{currency(item.total_paint)}</p>
                </div>
                <Link href={`/dashboard/admin/jobs/${item.job_id}`} className="flex items-center justify-center rounded-xl border border-zinc-200 text-sm font-bold hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
                  Open Job
                </Link>
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  onClick={() => decide(item.approval_request_id, "request-revision")}
                  disabled={busyId === item.approval_request_id}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-bold hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                >
                  <RefreshCcw size={16} /> Request Revision
                </button>
                <button
                  onClick={() => decide(item.approval_request_id, "reject")}
                  disabled={busyId === item.approval_request_id}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-500/20"
                >
                  <XCircle size={16} /> Reject
                </button>
                <button
                  onClick={() => decide(item.approval_request_id, "approve")}
                  disabled={busyId === item.approval_request_id}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500"
                >
                  {busyId === item.approval_request_id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  Approve
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
