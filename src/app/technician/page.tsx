"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bot,
  Calculator,
  Car,
  CheckCircle2,
  ClipboardList,
  Cpu,
  Database,
  ExternalLink,
  Gauge,
  Loader2,
  PackageSearch,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  Timer,
  TrendingUp,
  Wrench,
  Zap,
} from "lucide-react";
import { api } from "@/lib/api";

const currency = (value: any) =>
  `R ${Number(value || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const statusOrder: Record<string, number> = {
  Assigned: 1,
  "Inspection Started": 2,
  "Diagnosis Done": 3,
  "Estimate Drafted": 4,
  "Awaiting Approval": 5,
  Approved: 6,
  "Repair In Progress": 7,
  "Waiting for Parts": 8,
  "Quality Check": 9,
  Completed: 10,
};

const statusClass = (status?: string) => {
  if (status === "Completed") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  if (status === "Approved") return "border-cyan-500/30 bg-cyan-500/10 text-cyan-300";
  if (status === "Awaiting Approval") return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  if (status === "Repair In Progress" || status === "Waiting for Parts") return "border-orange-500/30 bg-orange-500/10 text-orange-300";
  if (status === "Estimate Drafted") return "border-purple-500/30 bg-purple-500/10 text-purple-300";
  return "border-zinc-700 bg-zinc-900 text-zinc-300";
};

function MetricCard({
  title,
  value,
  sub,
  icon,
  accent = "emerald",
}: {
  title: string;
  value: any;
  sub?: string;
  icon: React.ReactNode;
  accent?: "emerald" | "purple" | "cyan" | "amber" | "rose";
}) {
  const accents: Record<string, string> = {
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-300 border-emerald-500/20",
    purple: "from-purple-500/20 to-purple-500/5 text-purple-300 border-purple-500/20",
    cyan: "from-cyan-500/20 to-cyan-500/5 text-cyan-300 border-cyan-500/20",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-300 border-amber-500/20",
    rose: "from-rose-500/20 to-rose-500/5 text-rose-300 border-rose-500/20",
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 shadow-xl shadow-black/20 ${accents[accent]}`}>
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5 blur-2xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">{title}</p>
          <p className="mt-3 text-2xl font-black text-white sm:text-3xl">{value}</p>
          {sub && <p className="mt-1 text-xs text-zinc-400">{sub}</p>}
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-3">{icon}</div>
      </div>
    </div>
  );
}

function ActionCard({
  href,
  title,
  description,
  icon,
  tone = "emerald",
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tone?: "emerald" | "purple" | "cyan" | "amber";
}) {
  const tones: Record<string, string> = {
    emerald: "hover:border-emerald-500/50 hover:bg-emerald-500/5 text-emerald-300",
    purple: "hover:border-purple-500/50 hover:bg-purple-500/5 text-purple-300",
    cyan: "hover:border-cyan-500/50 hover:bg-cyan-500/5 text-cyan-300",
    amber: "hover:border-amber-500/50 hover:bg-amber-500/5 text-amber-300",
  };

  return (
    <Link
      href={href}
      className={`group rounded-2xl border border-zinc-800 bg-[#10131a] p-4 transition ${tones[tone]}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-xl border border-white/10 bg-black/30 p-2">{icon}</div>
        <ExternalLink size={15} className="text-zinc-600 transition group-hover:text-zinc-300" />
      </div>
      <h3 className="font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
    </Link>
  );
}

function JobRow({ job }: { job: any }) {
  const vehicle = job?.vehicles || {};
  const progress = Math.max(10, Math.min(100, (statusOrder[job.status] || 1) * 10));

  return (
    <Link
      href={`/technician/jobs/${job.id}`}
      className="group block rounded-2xl border border-zinc-800 bg-black/30 p-4 transition hover:border-emerald-500/40 hover:bg-emerald-500/[0.03]"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-bold text-white">{job.title || "Untitled job"}</h3>
            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusClass(job.status)}`}>
              {job.status || "Assigned"}
            </span>
            {job.priority && (
              <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-[11px] font-bold text-zinc-400">
                {job.priority}
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-zinc-400">
            {vehicle.make || "Vehicle"} {vehicle.model || ""} · {vehicle.license_plate || vehicle.vin || "No plate"}
          </p>

          <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-500">
            {job.reported_issue || "No reported issue captured yet."}
          </p>
        </div>

        <div className="shrink-0 text-left sm:text-right">
          <p className="text-xs uppercase tracking-wider text-zinc-600">Mileage</p>
          <p className="font-mono text-sm font-bold text-zinc-300">
            {Number(job.intake_mileage || vehicle.current_mileage || 0).toLocaleString("en-ZA")} km
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-600">
          <span>Workflow progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-zinc-900">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Link>
  );
}

export default function TechnicianHomePage() {
  const [data, setData] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/technicians/dashboard"), api.get("/technicians/jobs")])
      .then(([dashboard, jobsData]) => {
        setData(dashboard);
        setJobs(jobsData || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openJobs = useMemo(
    () => jobs.filter((job) => job.status !== "Completed"),
    [jobs]
  );

  const priorityJobs = useMemo(
    () =>
      [...openJobs].sort((a, b) => {
        const priorityRank: Record<string, number> = {
          Critical: 1,
          High: 2,
          Medium: 3,
          Low: 4,
        };

        const aPriority = priorityRank[a.priority] || 5;
        const bPriority = priorityRank[b.priority] || 5;

        if (aPriority !== bPriority) return aPriority - bPriority;
        return (statusOrder[a.status] || 1) - (statusOrder[b.status] || 1);
      }),
    [openJobs]
  );

  const awaitingApproval = openJobs.filter((job) => job.status === "Awaiting Approval").length;
  const inRepair = openJobs.filter((job) => ["Repair In Progress", "Waiting for Parts"].includes(job.status)).length;
  const estimateDrafted = openJobs.filter((job) => job.status === "Estimate Drafted").length;

  const stats = data?.stats || {};

  const marketWatch = [
    {
      part: "Front bumper assembly",
      fitment: "Ford Ranger / Hilux class",
      supplier: "Parts supplier feed",
      note: "Ready for live supplier pricing",
      status: "Benchmark",
    },
    {
      part: "Headlamp assembly",
      fitment: "Left/right front lighting",
      supplier: "OEM / aftermarket lookup",
      note: "Useful for collision estimates",
      status: "Check stock",
    },
    {
      part: "Radiator support / grille trim",
      fitment: "Front-end impact parts",
      supplier: "Panel shop supply chain",
      note: "Compare repair vs replace",
      status: "Watch",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-sm">Loading technician command centre...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-[#10131a] p-5 shadow-2xl shadow-black/30 sm:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.16),transparent_32%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-emerald-300">
              <Radar size={14} /> Technician Command Centre
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Today’s Repair Desk
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              A technical cockpit for assigned jobs, AI estimates, OEM/market benchmarks,
              diagnostics, repair guidance, stock awareness and repair progress.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/technician/jobs"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-400"
              >
                <ClipboardList size={16} /> Open Jobs
              </Link>
              <Link
                href="/technician/ai-estimates"
                className="inline-flex items-center gap-2 rounded-xl border border-purple-500/40 bg-purple-500/10 px-4 py-2 text-sm font-bold text-purple-200 hover:bg-purple-500/20"
              >
                <Bot size={16} /> Generate AI Estimate
              </Link>
              <Link
                href="/technician/oem-estimates"
                className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-200 hover:bg-cyan-500/20"
              >
                <Database size={16} /> Benchmark Parts
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">System Readiness</p>
                <h2 className="mt-1 text-xl font-black text-white">Workshop telemetry</h2>
              </div>
              <Cpu className="text-emerald-300" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-zinc-950 p-4">
                <p className="text-zinc-500">Open jobs</p>
                <p className="mt-2 text-2xl font-black text-white">{openJobs.length}</p>
              </div>
              <div className="rounded-2xl bg-zinc-950 p-4">
                <p className="text-zinc-500">In repair</p>
                <p className="mt-2 text-2xl font-black text-white">{inRepair}</p>
              </div>
              <div className="rounded-2xl bg-zinc-950 p-4">
                <p className="text-zinc-500">Awaiting approval</p>
                <p className="mt-2 text-2xl font-black text-white">{awaitingApproval}</p>
              </div>
              <div className="rounded-2xl bg-zinc-950 p-4">
                <p className="text-zinc-500">Draft estimates</p>
                <p className="mt-2 text-2xl font-black text-white">{estimateDrafted}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Assigned Jobs"
          value={stats.assigned_jobs ?? openJobs.length}
          sub="Active technician queue"
          icon={<ClipboardList size={20} />}
          accent="emerald"
        />
        <MetricCard
          title="Estimate Drafts"
          value={stats.estimate_drafted ?? estimateDrafted}
          sub="Ready for approval selection"
          icon={<Calculator size={20} />}
          accent="purple"
        />
        <MetricCard
          title="Approval Queue"
          value={stats.awaiting_approval ?? awaitingApproval}
          sub="Waiting on admin/finance"
          icon={<ShieldCheck size={20} />}
          accent="amber"
        />
        <MetricCard
          title="Repair Load"
          value={stats.repair_in_progress ?? inRepair}
          sub="Jobs in workshop execution"
          icon={<Wrench size={20} />}
          accent="cyan"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-zinc-800 bg-[#10131a] p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-emerald-400">Live Job Radar</p>
              <h2 className="text-xl font-black text-white">Priority repair queue</h2>
            </div>
            <Link
              href="/technician/jobs"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-3 py-2 text-sm font-bold text-zinc-300 hover:bg-zinc-900"
            >
              View all jobs <ExternalLink size={15} />
            </Link>
          </div>

          <div className="space-y-3">
            {priorityJobs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-zinc-500">
                No active jobs assigned right now.
              </div>
            ) : (
              priorityJobs.slice(0, 5).map((job) => <JobRow key={job.id} job={job} />)
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl border border-zinc-800 bg-[#10131a] p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-purple-400">AI Workbench</p>
                <h2 className="text-xl font-black text-white">Fast actions</h2>
              </div>
              <Sparkles className="text-purple-300" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <ActionCard
                href="/technician/ai-estimates"
                title="Photo to estimate"
                description="Upload damage evidence and generate a VRESS AI estimate."
                icon={<Bot size={18} />}
                tone="purple"
              />
              <ActionCard
                href="/technician/oem-estimates"
                title="Market benchmark"
                description="Compare internal AI lines with Vehicle Databases repair benchmark data."
                icon={<Database size={18} />}
                tone="cyan"
              />
              <ActionCard
                href="/technician/guidance"
                title="Repair guidance"
                description="Open job-specific guidance, inspection notes and repair next steps."
                icon={<Wrench size={18} />}
                tone="emerald"
              />
              <ActionCard
                href="/technician/diagnostics"
                title="Diagnostics assist"
                description="Generate a step-by-step diagnostic tree from symptoms or fault codes."
                icon={<Activity size={18} />}
                tone="amber"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-zinc-800 bg-[#10131a] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-cyan-400">Parts Market Watch</p>
              <h2 className="text-xl font-black text-white">Supplier-ready lookup</h2>
            </div>
            <PackageSearch className="text-cyan-300" />
          </div>

          <div className="space-y-3">
            {marketWatch.map((item) => (
              <div key={item.part} className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white">{item.part}</h3>
                    <p className="mt-1 text-sm text-zinc-500">{item.fitment}</p>
                  </div>
                  <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-bold text-cyan-300">
                    {item.status}
                  </span>
                </div>
                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <div className="rounded-xl bg-zinc-950 p-3">
                    <p className="text-xs uppercase tracking-wider text-zinc-600">Source</p>
                    <p className="mt-1 font-semibold text-zinc-300">{item.supplier}</p>
                  </div>
                  <div className="rounded-xl bg-zinc-950 p-3">
                    <p className="text-xs uppercase tracking-wider text-zinc-600">Note</p>
                    <p className="mt-1 font-semibold text-zinc-300">{item.note}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs leading-5 text-amber-200">
            This is a supplier-ready panel. It does not claim live sale prices yet. Next step is connecting
            approved suppliers like parts stores, OEM catalogues or procurement feeds.
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-[#10131a] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-amber-400">Technical Health</p>
              <h2 className="text-xl font-black text-white">Workshop signals</h2>
            </div>
            <Gauge className="text-amber-300" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
              <div className="mb-3 flex items-center gap-2 text-emerald-300">
                <CheckCircle2 size={18} />
                <h3 className="font-bold text-white">Workflow discipline</h3>
              </div>
              <p className="text-sm leading-6 text-zinc-400">
                Estimates are generated on their own pages. The job card only selects a saved estimate for approval,
                keeping the repair flow clean and non-repetitive.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
              <div className="mb-3 flex items-center gap-2 text-cyan-300">
                <TrendingUp size={18} />
                <h3 className="font-bold text-white">Variance awareness</h3>
              </div>
              <p className="text-sm leading-6 text-zinc-400">
                AI estimate, external benchmark and actual repair cost can be compared to expose overrun,
                saving or pricing anomalies.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
              <div className="mb-3 flex items-center gap-2 text-purple-300">
                <Zap size={18} />
                <h3 className="font-bold text-white">Tablet-first execution</h3>
              </div>
              <p className="text-sm leading-6 text-zinc-400">
                Use the technician PWA on Android tablets with the sidebar drawer, dark/light theme and quick actions.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
              <div className="mb-3 flex items-center gap-2 text-rose-300">
                <AlertTriangle size={18} />
                <h3 className="font-bold text-white">Attention points</h3>
              </div>
              <p className="text-sm leading-6 text-zinc-400">
                Jobs waiting for parts, approval or quality check should be cleared before starting new non-critical work.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-600">
              <span>Workshop throughput signal</span>
              <span>{openJobs.length ? Math.min(100, Math.round(((openJobs.length - awaitingApproval) / openJobs.length) * 100)) : 100}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-zinc-900">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500"
                style={{
                  width: `${openJobs.length ? Math.min(100, Math.round(((openJobs.length - awaitingApproval) / openJobs.length) * 100)) : 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <ActionCard
          href="/technician/vin"
          title="Quick VIN Lookup"
          description="Decode or verify VIN details before estimate or guidance work."
          icon={<Search size={18} />}
          tone="cyan"
        />
        <ActionCard
          href="/technician/maintenance"
          title="Maintenance Update"
          description="Record repair updates, maintenance notes and job-related costs."
          icon={<Timer size={18} />}
          tone="emerald"
        />
        <ActionCard
          href="/technician/service"
          title="Service Schedule"
          description="Review upcoming service requirements and preventative checks."
          icon={<Car size={18} />}
          tone="amber"
        />
      </section>
    </div>
  );
}
