"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Car, ClipboardList, Loader2, Search, SlidersHorizontal } from "lucide-react";
import { api } from "@/lib/api";

const currency = (value: any) =>
  `R ${Number(value || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const statusClass = (status?: string) => {
  if (status === "Completed") return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  if (status === "Approved") return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400";
  if (status === "Awaiting Approval") return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
  if (status === "Waiting for Parts") return "bg-orange-500/10 text-orange-600 dark:text-orange-400";
  return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";
};

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (search) params.set("search", search);

      const qs = params.toString();
      const data = await api.get(`/admin/jobs${qs ? `?${qs}` : ""}`);
      setJobs(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [status]);

  const visibleJobs = useMemo(() => jobs, [jobs]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-brand-primary">Admin Jobs</p>
          <h1 className="mt-1 text-3xl font-black text-zinc-950 dark:text-white">All Jobs & Progress</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Track every technician job, selected estimate, approval state, parts state and cost variance.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchJobs();
              }}
              placeholder="Search job, plate, VIN, technician..."
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-brand-primary dark:border-zinc-800 dark:bg-card-dark sm:w-80"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-primary dark:border-zinc-800 dark:bg-card-dark"
          >
            <option value="">All statuses</option>
            <option>Assigned</option>
            <option>Inspection Started</option>
            <option>Diagnosis Done</option>
            <option>Estimate Drafted</option>
            <option>Awaiting Approval</option>
            <option>Approved</option>
            <option>Repair In Progress</option>
            <option>Waiting for Parts</option>
            <option>Quality Check</option>
            <option>Completed</option>
          </select>

          <button
            onClick={fetchJobs}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-500"
          >
            <SlidersHorizontal size={16} /> Apply
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-card-dark">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
          </div>
        ) : visibleJobs.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">No jobs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/40">
                <tr>
                  <th className="px-5 py-3">Job</th>
                  <th className="px-5 py-3">Vehicle</th>
                  <th className="px-5 py-3">Technician</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Parts</th>
                  <th className="px-5 py-3">Selected</th>
                  <th className="px-5 py-3">Actual</th>
                  <th className="px-5 py-3">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {visibleJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                    <td className="px-5 py-4">
                      <Link href={`/dashboard/admin/jobs/${job.id}`} className="font-bold text-zinc-950 hover:text-brand-primary dark:text-white">
                        {job.title || "Untitled job"}
                      </Link>
                      <p className="mt-1 line-clamp-1 text-xs text-zinc-500">{job.reported_issue || "No issue captured"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Car size={15} className="text-zinc-400" />
                        <div>
                          <p className="font-semibold">{job.make} {job.model}</p>
                          <p className="text-xs text-zinc-500">{job.license_plate || job.vin || "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">{job.technician_name || "Unassigned"}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(job.status)}`}>{job.status}</span>
                    </td>
                    <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">{job.parts_status || "not_required"}</td>
                    <td className="px-5 py-4 font-mono font-bold text-brand-primary">{currency(job.selected_total_estimate || job.selected_estimate_total)}</td>
                    <td className="px-5 py-4 font-mono">{currency(job.total_actual_cost)}</td>
                    <td className="px-5 py-4">
                      <span className={Number(job.cost_variance || 0) > 1000 ? "font-bold text-red-500" : "text-zinc-500"}>
                        {currency(job.cost_variance)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
