"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Database,
  FileSearch,
  Loader2,
  Lock,
  RefreshCw,
  Send,
  Wrench,
} from "lucide-react";
import { api } from "@/lib/api";

type Job = {
  id: string;
  title: string;
  status: string;
  priority?: string;
  intake_mileage?: number;
  vehicles?: {
    id: string;
    vin?: string;
    make?: string;
    model?: string;
    year?: number;
    license_plate?: string;
    current_mileage?: number;
  };
};

type EstimateLine = {
  id?: string;
  component_name: string;
  damage_type?: string;
  action?: string;
  labor_hours?: number;
  labor_rate?: number;
  labor_cost?: number;
  parts_cost?: number;
  paint_cost?: number;
  line_total?: number;
  confidence?: number;
  reasoning?: string;
};

type Estimate = {
  id: string;
  source: string;
  status: string;
  total_parts: number;
  total_labor: number;
  total_paint: number;
  total_estimate: number;
  confidence?: number;
  created_at?: string;
  technician_notes?: string;
  technician_estimate_lines?: EstimateLine[];
  lines?: EstimateLine[];
};

const currency = (value: number | string | null | undefined) => {
  const number = Number(value || 0);
  return `R ${number.toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const openStatuses = new Set([
  "Assigned",
  "Inspection Started",
  "Diagnosis Done",
  "Estimate Drafted",
  "Awaiting Approval",
  "Approved",
  "Repair In Progress",
  "Waiting for Parts",
  "Quality Check",
]);

function getProviderErrorMessage(err: any) {
  const detail = err?.detail ?? err?.payload?.detail ?? err?.message ?? err;

  if (typeof detail === "object" && detail !== null) {
    return detail.message || detail.next_step || JSON.stringify(detail);
  }

  return String(detail || "Failed to request external benchmark.");
}

function sourceLabel(source?: string) {
  if (source === "vehicle_databases_benchmark" || source === "oem_benchmark") {
    return "OEM / Market Benchmark";
  }
  if (source === "technician_adjusted") return "Technician Adjusted AI";
  if (source === "ai") return "LMG AI";
  return source || "Estimate";
}

function statusClass(status?: string) {
  const value = (status || "").toLowerCase();

  if (value.includes("approved")) {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
  }

  if (value.includes("submitted") || value.includes("awaiting")) {
    return "border-amber-500/40 bg-amber-500/10 text-amber-300";
  }

  if (value.includes("rejected") || value.includes("cancelled")) {
    return "border-red-500/40 bg-red-500/10 text-red-300";
  }

  return "border-zinc-700 bg-zinc-900 text-zinc-300";
}

function Card({
  title,
  value,
  icon,
  sub,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#11141a] p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-zinc-500">{title}</p>
        <div className="rounded-xl bg-zinc-900 p-2 text-emerald-400">{icon}</div>
      </div>
      <p className="mt-3 text-xl font-bold text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-500">{sub}</p>}
    </div>
  );
}

function EstimateTable({ estimate }: { estimate?: Estimate | null }) {
  const lines = estimate?.technician_estimate_lines || estimate?.lines || [];

  if (!estimate) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-800 bg-black/20 p-10 text-center">
        <FileSearch className="mx-auto mb-3 text-zinc-600" size={32} />
        <p className="font-semibold text-zinc-300">No estimate generated yet</p>
        <p className="mt-1 text-sm text-zinc-500">
          Generate an estimate to compare parts, labour and paint totals.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-black/30">
      <div className="grid grid-cols-4 gap-3 border-b border-zinc-800 p-4">
        <Card title="Parts" value={currency(estimate.total_parts)} icon={<Database size={16} />} />
        <Card title="Labour" value={currency(estimate.total_labor)} icon={<Wrench size={16} />} />
        <Card title="Paint" value={currency(estimate.total_paint)} icon={<Bot size={16} />} />
        <Card title="Total" value={currency(estimate.total_estimate)} icon={<CheckCircle2 size={16} />} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Component / Operation</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Labour</th>
              <th className="px-4 py-3">Parts</th>
              <th className="px-4 py-3">Paint</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {lines.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  No line items returned.
                </td>
              </tr>
            ) : (
              lines.map((line, index) => (
                <tr key={line.id || index} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-100">{line.component_name}</p>
                    {line.reasoning && (
                      <p className="mt-1 max-w-xl text-xs text-zinc-500">{line.reasoning}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{line.action || "-"}</td>
                  <td className="px-4 py-3 text-zinc-300">
                    {Number(line.labor_hours || 0).toFixed(2)}h
                    <span className="ml-2 text-zinc-600">{currency(line.labor_cost)}</span>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{currency(line.parts_cost)}</td>
                  <td className="px-4 py-3 text-zinc-300">{currency(line.paint_cost)}</td>
                  <td className="px-4 py-3 text-right font-bold text-white">
                    {currency(line.line_total)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function TechnicianOemEstimatesPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [aiEstimates, setAiEstimates] = useState<Estimate[]>([]);
  const [oemEstimates, setOemEstimates] = useState<Estimate[]>([]);
  const [providerMessage, setProviderMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [laborRate, setLaborRate] = useState(450);
  const [error, setError] = useState<string | null>(null);

  const selectedJob = jobs.find((job) => job.id === selectedJobId);
  const latestAi = aiEstimates[0] || null;
  const latestOem = oemEstimates[0] || null;

  const approvedEstimate = useMemo(() => {
    return [...aiEstimates, ...oemEstimates].find((estimate) =>
      (estimate.status || "").toLowerCase().includes("approved")
    );
  }, [aiEstimates, oemEstimates]);

  const locked = Boolean(approvedEstimate);

  const variance = useMemo(() => {
    const aiTotal = Number(latestAi?.total_estimate || 0);
    const oemTotal = Number(latestOem?.total_estimate || 0);

    if (!aiTotal || !oemTotal) {
      return {
        amount: 0,
        percent: 0,
        label: "Generate both estimates to compare variance.",
      };
    }

    const amount = oemTotal - aiTotal;
    const percent = (amount / aiTotal) * 100;

    return {
      amount,
      percent,
      label:
        amount > 0
          ? "OEM benchmark is above LMG AI."
          : amount < 0
            ? "OEM benchmark is below LMG AI."
            : "OEM benchmark matches LMG AI.",
    };
  }, [latestAi, latestOem]);

  const fetchJobs = async () => {
    const data = await api.get("/technicians/jobs");
    const openJobs = (data || []).filter((job: Job) => openStatuses.has(job.status));
    setJobs(openJobs);

    if (!selectedJobId && openJobs.length > 0) {
      setSelectedJobId(openJobs[0].id);
    }
  };

  const fetchEstimates = async (jobId: string) => {
    if (!jobId) return;

    const [ai, oem] = await Promise.all([
      api.get(`/technicians/jobs/${jobId}/estimates`),
      api.get(`/technicians/jobs/${jobId}/oem-estimates`),
    ]);

    const aiOnly = [...(ai || [])]
      .filter((estimate: Estimate) =>
        estimate.source === "ai" ||
        estimate.source === "ai_estimate" ||
        estimate.source === "lmg_ai" ||
        estimate.source === "technician_adjusted"
      )
      .sort((a: Estimate, b: Estimate) =>
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );

    const oemOnly = [...(oem || [])]
      .filter((estimate: Estimate) =>
        estimate.source === "vehicle_databases_benchmark" ||
        estimate.source === "oem_benchmark" ||
        estimate.source === "market_repair_benchmark"
      )
      .sort((a: Estimate, b: Estimate) =>
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );

    setAiEstimates(aiOnly);
    setOemEstimates(oemOnly);
  };

  const refresh = async () => {
    setLoading(true);
    setProviderMessage(null);
    setError(null);

    try {
      await fetchJobs();
    } catch (err: any) {
      setError(err?.message || "Failed to load technician jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedJobId) return;

    setError(null);
    fetchEstimates(selectedJobId).catch((err) => {
      setError(err?.message || "Failed to load estimates.");
    });
  }, [selectedJobId]);

  const generateOemEstimate = async () => {
    if (!selectedJobId) return;

    if (locked) {
      alert("This job already has an approved estimate. Benchmark generation is locked.");
      return;
    }

    setGenerating(true);
    setProviderMessage(null);
    setError(null);

    try {
      await api.post(`/technicians/jobs/${selectedJobId}/oem-estimate`, {
        labor_rate: laborRate,
        mileage:
          selectedJob?.intake_mileage ||
          selectedJob?.vehicles?.current_mileage ||
          null,
        notes: "Requested from technician OEM Benchmark Estimate page.",
      });

      await fetchEstimates(selectedJobId);
    } catch (err: any) {
      const message = getProviderErrorMessage(err);
      setError(message);
      setProviderMessage(message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-emerald-400" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080a0f] text-zinc-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-400">Estimates</p>
            <h1 className="mt-1 text-3xl font-bold text-white">OEM Benchmark Estimate</h1>
            <p className="mt-2 max-w-3xl text-sm text-zinc-400">
              Compare the LMG AI estimate against Vehicle Databases repair-pricing benchmark data.
              Once admin approves one estimate source, the alternative source becomes read-only.
            </p>
          </div>

          <button
            onClick={refresh}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-300 hover:border-emerald-500/50 hover:text-white"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            <div className="flex items-start gap-2">
              <AlertTriangle size={18} />
              <p>{error}</p>
            </div>
          </div>
        )}

        <section className="rounded-2xl border border-zinc-800 bg-[#10131a] p-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Open Job Card
              </label>
              <select
                value={selectedJobId}
                onChange={(event) => setSelectedJobId(event.target.value)}
                className="w-full cursor-pointer rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
              >
                {jobs.length === 0 ? (
                  <option value="">No open jobs available</option>
                ) : (
                  jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} — {job.vehicles?.make} {job.vehicles?.model} ({job.vehicles?.license_plate || job.vehicles?.vin || "No plate"})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Labour Rate
              </label>
              <input
                type="number"
                value={laborRate}
                onChange={(event) => setLaborRate(Number(event.target.value || 0))}
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div className="lg:col-span-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Estimate Lock
              </label>
              <div
                className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
                  locked
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-zinc-800 bg-black text-zinc-400"
                }`}
              >
                {locked ? <Lock size={16} /> : <FileSearch size={16} />}
                {locked
                  ? `Locked by ${sourceLabel(approvedEstimate?.source)} approval`
                  : "Open for AI and OEM comparison"}
              </div>
            </div>
          </div>

          {selectedJob && (
            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-5">
              <Card title="Vehicle" value={`${selectedJob.vehicles?.make || "-"} ${selectedJob.vehicles?.model || ""}`} sub={selectedJob.vehicles?.license_plate || selectedJob.vehicles?.vin || "-"} icon={<Wrench size={16} />} />
              <Card title="Year" value={String(selectedJob.vehicles?.year || "-")} icon={<Database size={16} />} />
              <Card title="VIN" value={selectedJob.vehicles?.vin || "-"} icon={<FileSearch size={16} />} />
              <Card title="Job Status" value={selectedJob.status} icon={<CheckCircle2 size={16} />} />
              <Card title="Mileage" value={String(selectedJob.intake_mileage || selectedJob.vehicles?.current_mileage || "-")} icon={<Wrench size={16} />} />
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-[#10131a] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-400">Internal</p>
                <h2 className="text-xl font-bold text-white">LMG AI Estimate</h2>
              </div>
              {latestAi && (
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(latestAi.status)}`}>
                  {latestAi.status}
                </span>
              )}
            </div>
            <EstimateTable estimate={latestAi} />
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-[#10131a] p-5">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-sky-400">External Benchmark</p>
                <h2 className="text-xl font-bold text-white">Vehicle Databases Estimate</h2>
              </div>

              <button
                onClick={generateOemEstimate}
                disabled={!selectedJobId || generating || locked}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-bold text-white hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {generating ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                {generating ? "Requesting..." : "Request Benchmark"}
              </button>
            </div>

            {locked && !latestOem && (
              <div className="mb-4 rounded-xl border border-zinc-800 bg-black p-3 text-sm text-zinc-500">
                OEM benchmark is greyed out because an estimate has already been approved for this job.
              </div>
            )}

            {providerMessage && (
              <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-200">
                <p className="font-bold text-amber-100">No external benchmark available</p>
                <p className="mt-1">{providerMessage}</p>
              </div>
            )}

            <EstimateTable estimate={latestOem} />
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-[#10131a] p-5">
          <div className="mb-4">
            <p className="text-sm font-semibold text-amber-400">Comparison</p>
            <h2 className="text-xl font-bold text-white">AI vs OEM Benchmark Variance</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card title="AI Estimate" value={currency(latestAi?.total_estimate)} icon={<Bot size={16} />} />
            <Card title="OEM Benchmark" value={currency(latestOem?.total_estimate)} icon={<Database size={16} />} />
            <Card
              title="Variance"
              value={`${variance.amount >= 0 ? "+" : ""}${currency(variance.amount)}`}
              sub={variance.label}
              icon={<AlertTriangle size={16} />}
            />
            <Card
              title="Variance %"
              value={`${variance.percent >= 0 ? "+" : ""}${variance.percent.toFixed(1)}%`}
              icon={<CheckCircle2 size={16} />}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
