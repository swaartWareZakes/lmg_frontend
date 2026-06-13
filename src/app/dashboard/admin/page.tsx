"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Database,
  ExternalLink,
  Gauge,
  Loader2,
  PackageSearch,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import { api } from "@/lib/api";

const currency = (value: any) =>
  `R ${Number(value || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const number = (value: any) => Number(value || 0).toLocaleString("en-ZA");

const dateTime = (value: any) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("en-ZA", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return String(value);
  }
};

function toneForStatus(status: string) {
  const value = String(status || "").toLowerCase();

  if (value.includes("completed") || value.includes("approved")) {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-500";
  }

  if (value.includes("approval") || value.includes("pending")) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-500";
  }

  if (value.includes("part") || value.includes("blocked")) {
    return "border-rose-500/30 bg-rose-500/10 text-rose-500";
  }

  if (value.includes("progress") || value.includes("repair")) {
    return "border-cyan-500/30 bg-cyan-500/10 text-cyan-500";
  }

  return "border-zinc-300 bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300";
}

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
  tone?: "emerald" | "purple" | "amber" | "cyan" | "rose" | "zinc";
}) {
  const tones: Record<string, string> = {
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
    purple: "border-purple-500/20 bg-purple-500/10 text-purple-500",
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-500",
    cyan: "border-cyan-500/20 bg-cyan-500/10 text-cyan-500",
    rose: "border-rose-500/20 bg-rose-500/10 text-rose-500",
    zinc: "border-zinc-500/20 bg-zinc-500/10 text-zinc-500",
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

function SectionCard({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-card-dark">
      <div className="flex items-start justify-between gap-4 border-b border-zinc-200 p-5 dark:border-zinc-800">
        <div>
          <h2 className="font-black text-zinc-950 dark:text-white">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const res = await api.get("/admin/dashboard");
      setData(res);
    } catch (err: any) {
      setError(err?.message || "Failed to load admin dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    const timer = window.setInterval(() => {
      fetchDashboard(true);
    }, 60000);

    return () => window.clearInterval(timer);
  }, []);

  const stats = data?.stats || {};
  const recentJobs = data?.recent_jobs || [];
  const approvalQueue = data?.approval_queue || [];
  const lowStockParts = data?.low_stock_parts || [];
  const workload = data?.workload || [];
  const statusBreakdown = data?.status_breakdown || [];
  const estimateSources = data?.estimate_sources || [];

  const operationalScore = Number(stats.operational_score ?? 100);

  const throughput = useMemo(() => {
    const active = Number(stats.active_jobs || 0);
    const blocked = Number(stats.waiting_for_parts || 0) + Number(stats.pending_approval_requests || 0);
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.15),transparent_35%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_30%)]" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-primary">Live Admin Control</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
              LMG Operational Dashboard
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              Real-time view from Supabase jobs, approvals, estimates, parts, users and evidence records.
            </p>
            <p className="mt-2 text-xs text-zinc-400">
              Last generated: {dateTime(data?.generated_at)} {refreshing ? "· refreshing..." : ""}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => fetchDashboard(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-bold text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Refresh
            </button>

            <Link
              href="/dashboard/admin/jobs"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-500"
            >
              <ClipboardList size={16} />
              Open Jobs
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-bold text-red-500">
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <StatCard title="Active Jobs" value={number(stats.active_jobs)} subtitle={`${number(stats.total_jobs)} total jobs`} icon={<Wrench size={22} />} tone="emerald" />
        <StatCard title="Approval Queue" value={number(stats.pending_approval_requests)} subtitle={`${number(stats.awaiting_approval)} jobs awaiting approval`} icon={<ShieldCheck size={22} />} tone="amber" />
        <StatCard title="Parts Blockers" value={number(stats.waiting_for_parts)} subtitle={`${number(stats.low_stock_parts)} low/out-of-stock parts`} icon={<PackageSearch size={22} />} tone="rose" />
        <StatCard title="Operational Score" value={`${operationalScore}%`} subtitle={`${throughput}% throughput after blockers`} icon={<Gauge size={22} />} tone="cyan" />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <StatCard title="Approved Estimate Value" value={currency(stats.approved_estimate_total)} subtitle="Approved repair value" icon={<TrendingUp size={22} />} tone="emerald" />
        <StatCard title="Selected Estimate Value" value={currency(stats.selected_estimate_total)} subtitle="Selected but not necessarily approved" icon={<BarChart3 size={22} />} tone="purple" />
        <StatCard title="Actual Spend" value={currency(stats.actual_spend_total)} subtitle={`${number(stats.high_variance_jobs)} high variance jobs`} icon={<AlertTriangle size={22} />} tone="amber" />
        <StatCard title="Evidence Ready" value={number(stats.evidence_ready_jobs)} subtitle={`${number(stats.media_items)} media items captured`} icon={<CheckCircle2 size={22} />} tone="cyan" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
        <SectionCard
          title="Live Job Pipeline"
          subtitle="Newest jobs from technician_jobs/admin overview."
          action={<Link href="/dashboard/admin/jobs" className="text-sm font-bold text-brand-primary hover:underline">View all</Link>}
        >
          <div className="space-y-3">
            {recentJobs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
                No jobs found yet.
              </div>
            ) : (
              recentJobs.map((job: any) => (
                <Link
                  key={job.id}
                  href={`/dashboard/admin/jobs/${job.id}`}
                  className="block rounded-2xl border border-zinc-200 p-4 transition hover:border-brand-primary/40 hover:bg-brand-primary/5 dark:border-zinc-800"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-black text-zinc-950 dark:text-white">{job.title}</h3>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${toneForStatus(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{job.vehicle}</p>
                      <p className="mt-1 text-xs text-zinc-400">
                        Technician: {job.technician} · Created {dateTime(job.created_at)}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-right text-xs sm:min-w-[280px]">
                      <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950/40">
                        <p className="font-bold text-zinc-500">Estimate</p>
                        <p className="mt-1 font-black text-zinc-950 dark:text-white">{currency(job.estimate_total)}</p>
                      </div>
                      <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950/40">
                        <p className="font-bold text-zinc-500">Evidence</p>
                        <p className="mt-1 font-black text-zinc-950 dark:text-white">{job.readiness || 0}%</p>
                      </div>
                      <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950/40">
                        <p className="font-bold text-zinc-500">Media</p>
                        <p className="mt-1 font-black text-zinc-950 dark:text-white">{number(job.media_count)}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Status Breakdown" subtitle="Current job status mix.">
            <div className="space-y-3">
              {statusBreakdown.length === 0 ? (
                <p className="text-sm text-zinc-500">No status data yet.</p>
              ) : (
                statusBreakdown.slice(0, 8).map((item: any) => {
                  const max = Math.max(...statusBreakdown.map((x: any) => Number(x.count || 0)), 1);
                  const width = Math.round((Number(item.count || 0) / max) * 100);

                  return (
                    <div key={item.status}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-bold text-zinc-700 dark:text-zinc-200">{item.status}</span>
                        <span className="text-zinc-500">{number(item.count)}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
                        <div className="h-full rounded-full bg-brand-primary" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </SectionCard>

          <SectionCard title="Estimate Sources" subtitle="AI/manual/benchmark mix.">
            <div className="space-y-3">
              {estimateSources.length === 0 ? (
                <p className="text-sm text-zinc-500">No estimates generated yet.</p>
              ) : (
                estimateSources.slice(0, 6).map((item: any) => (
                  <div key={item.source} className="flex items-center justify-between rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950/40">
                    <span className="font-mono text-sm font-bold text-zinc-700 dark:text-zinc-200">{item.source}</span>
                    <span className="rounded-full bg-brand-primary/10 px-2 py-1 text-xs font-black text-brand-primary">{number(item.count)}</span>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <SectionCard
          title="Approval Queue"
          subtitle="Latest pending/admin approval requests."
          action={<Link href="/dashboard/admin/approvals" className="text-sm font-bold text-brand-primary hover:underline">Open</Link>}
        >
          <div className="space-y-3">
            {approvalQueue.length === 0 ? (
              <p className="text-sm text-zinc-500">No approval requests pending.</p>
            ) : (
              approvalQueue.slice(0, 5).map((item: any) => (
                <Link
                  key={item.approval_request_id}
                  href={item.job_id ? `/dashboard/admin/jobs/${item.job_id}` : "/dashboard/admin/approvals"}
                  className="block rounded-xl border border-zinc-200 p-3 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-zinc-950 dark:text-white">{item.job_title}</p>
                      <p className="mt-1 text-xs text-zinc-500">{dateTime(item.submitted_at)}</p>
                    </div>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${toneForStatus(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-black text-zinc-950 dark:text-white">{currency(item.total_estimate)}</p>
                </Link>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Technician Workload"
          subtitle="Open work per technician."
          action={<Link href="/dashboard/admin/users" className="text-sm font-bold text-brand-primary hover:underline">Users</Link>}
        >
          <div className="space-y-3">
            {workload.length === 0 ? (
              <p className="text-sm text-zinc-500">No technician workload yet.</p>
            ) : (
              workload.slice(0, 6).map((item: any) => (
                <div key={item.technician_id || item.name} className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate font-bold text-zinc-950 dark:text-white">{item.name}</p>
                    <span className="rounded-full bg-brand-primary/10 px-2 py-1 text-xs font-black text-brand-primary">
                      {number(item.open_jobs)} open
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    {number(item.awaiting_approval)} approvals · {number(item.waiting_for_parts)} parts blockers · {number(item.completed_jobs)} completed
                  </p>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Parts Attention"
          subtitle="Low stock and out-of-stock items."
          action={<Link href="/dashboard/admin/parts" className="text-sm font-bold text-brand-primary hover:underline">Parts</Link>}
        >
          <div className="space-y-3">
            {lowStockParts.length === 0 ? (
              <p className="text-sm text-zinc-500">No low stock parts found.</p>
            ) : (
              lowStockParts.slice(0, 6).map((part: any) => (
                <div key={part.id || part.part_name} className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-zinc-950 dark:text-white">{part.part_name}</p>
                      <p className="mt-1 text-xs text-zinc-500">{part.supplier}</p>
                    </div>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${toneForStatus(part.status)}`}>
                      {part.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    On hand: <strong>{number(part.quantity_on_hand)}</strong> · Minimum: <strong>{number(part.minimum_stock_level)}</strong>
                  </p>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <QuickLink href="/dashboard/admin/approvals" title="Approval Queue" description="Review selected estimates, approve, reject, or request revision." icon={<ShieldCheck size={20} />} />
        <QuickLink href="/dashboard/admin/users" title="Users & Workload" description="Track users, roles, status and technician job load." icon={<Users size={20} />} />
        <QuickLink href="/dashboard/admin/pricing" title="Pricing Matrix" description="Manage LMG repair benchmarks for parts, labour and paint." icon={<Database size={20} />} />
        <QuickLink href="/dashboard/admin/parts" title="Parts Inventory" description="Manage stock, low-stock parts, suppliers and job reservations." icon={<PackageSearch size={20} />} />
      </section>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-card-dark">
        <div className="flex flex-wrap items-center gap-3">
          <Clock3 size={14} />
          <span>Auto-refreshes every 60 seconds.</span>
          <span>Source: {data?.meta?.source || "live_supabase_tables"}</span>
          <span>Jobs: {number(data?.meta?.tables?.technician_jobs)}</span>
          <span>Estimates: {number(data?.meta?.tables?.technician_ai_estimates)}</span>
          <span>Parts: {number(data?.meta?.tables?.parts_inventory)}</span>
        </div>
      </div>
    </div>
  );
}
