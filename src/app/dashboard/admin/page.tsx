"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Database,
  Loader2,
  PackageSearch,
  ShieldCheck,
  TrendingUp,
  Users,
  Wrench,
  ExternalLink,
} from "lucide-react";
import { api } from "@/lib/api";

const currency = (value: any) =>
  `R ${Number(value || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

function StatCard({
  title,
  value,
  subtitle,
  icon,
  tone = "emerald",
}: {
  title: string;
  value: any;
  subtitle?: string;
  icon: React.ReactNode;
  tone?: "emerald" | "purple" | "amber" | "cyan" | "rose";
}) {
  const tones: Record<string, string> = {
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
    purple: "border-purple-500/20 bg-purple-500/10 text-purple-500",
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-500",
    cyan: "border-cyan-500/20 bg-cyan-500/10 text-cyan-500",
    rose: "border-rose-500/20 bg-rose-500/10 text-rose-500",
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-card-dark">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">{title}</p>
          <p className="mt-3 text-3xl font-black text-zinc-950 dark:text-white">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
        </div>
        <div className={`rounded-2xl border p-3 ${tones[tone]}`}>{icon}</div>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-brand-primary/40 hover:bg-brand-primary/5 dark:border-zinc-800 dark:bg-card-dark"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-xl bg-brand-primary/10 p-2 text-brand-primary">{icon}</div>
        <ExternalLink size={16} className="text-zinc-400 transition group-hover:text-brand-primary" />
      </div>
      <h3 className="font-bold text-zinc-950 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{description}</p>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/dashboard");
      setData(res);
    } catch (err: any) {
      setError(err?.message || "Failed to load admin dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const stats = data?.stats || {};

  const throughput = useMemo(() => {
    const active = Number(stats.active_jobs || 0);
    const blocked = Number(stats.waiting_for_parts || 0) + Number(stats.awaiting_approval || 0);
    if (!active) return 100;
    return Math.max(0, Math.min(100, Math.round(((active - blocked) / active) * 100)));
  }, [stats]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-card-dark">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.15),transparent_35%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_35%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-brand-primary">Admin Control Centre</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
              LMG Operations Command
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              Manage all jobs, approvals, users, parts, supplier quotes, comments and operational bottlenecks from one admin workspace.
            </p>
          </div>

          <button
            onClick={fetchDashboard}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-bold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <TrendingUp size={16} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Active Jobs" value={stats.active_jobs || 0} subtitle="Open workshop workload" icon={<ClipboardList size={22} />} />
        <StatCard title="Awaiting Approval" value={stats.awaiting_approval || 0} subtitle="Admin decision required" icon={<ShieldCheck size={22} />} tone="amber" />
        <StatCard title="Waiting Parts" value={stats.waiting_for_parts || 0} subtitle="Parts or supplier blocked" icon={<PackageSearch size={22} />} tone="cyan" />
        <StatCard title="Low Stock Parts" value={stats.low_stock_parts || 0} subtitle="Inventory attention" icon={<AlertTriangle size={22} />} tone="rose" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Selected Estimates" value={currency(stats.selected_estimate_total)} subtitle="Submitted or selected" icon={<Database size={22} />} tone="purple" />
        <StatCard title="Approved Estimate Total" value={currency(stats.approved_estimate_total)} subtitle="Approved repair value" icon={<CheckCircle2 size={22} />} />
        <StatCard title="Actual Spend" value={currency(stats.actual_spend_total)} subtitle="Recorded actual cost" icon={<Wrench size={22} />} tone="cyan" />
        <StatCard title="High Variance Jobs" value={stats.high_variance_jobs || 0} subtitle={`${throughput}% throughput signal`} icon={<TrendingUp size={22} />} tone="amber" />
      </div>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-card-dark">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-brand-primary">Live Jobs</p>
              <h2 className="text-xl font-black text-zinc-950 dark:text-white">Recent active jobs</h2>
            </div>
            <Link href="/dashboard/admin/jobs" className="text-sm font-bold text-brand-primary hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {(data?.recent_jobs || []).length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-200 p-8 text-center text-sm text-zinc-500 dark:border-zinc-800">
                No active jobs found.
              </div>
            ) : (
              data.recent_jobs.map((job: any) => (
                <Link
                  key={job.id}
                  href={`/dashboard/admin/jobs/${job.id}`}
                  className="block rounded-xl border border-zinc-200 p-4 transition hover:border-brand-primary/40 hover:bg-brand-primary/5 dark:border-zinc-800"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-bold text-zinc-950 dark:text-white">{job.title || "Untitled job"}</h3>
                      <p className="mt-1 text-sm text-zinc-500">
                        {job.make} {job.model} · {job.license_plate || job.vin || "No plate"}
                      </p>
                    </div>
                    <span className="w-fit rounded-full border border-zinc-200 px-3 py-1 text-xs font-bold text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
                      {job.status}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <QuickLink href="/dashboard/admin/approvals" title="Approval Queue" description="Review selected estimates, approve, reject, or request revision." icon={<ShieldCheck size={20} />} />
          <QuickLink href="/dashboard/admin/users" title="Users & Workload" description="Track users, roles, status and technician job load." icon={<Users size={20} />} />
          <QuickLink href="/dashboard/admin/parts" title="Parts Inventory" description="Manage stock, low-stock parts, suppliers and job reservations." icon={<PackageSearch size={20} />} />
        </div>
      </section>
    </div>
  );
}
