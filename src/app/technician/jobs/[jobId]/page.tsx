"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ClipboardList,
  Database,
  ExternalLink,
  Loader2,
  Lock,
  Save,
  Send,
  Wrench,
} from "lucide-react";
import { api } from "@/lib/api";

const steps = [
  "Assigned",
  "Inspection Started",
  "Diagnosis Done",
  "Estimate Drafted",
  "Awaiting Approval",
  "Approved",
  "Repair In Progress",
  "Waiting for Parts",
  "Quality Check",
  "Completed",
];

const statusColor: Record<string, string> = {
  Assigned: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  "Inspection Started": "border-blue-500/40 bg-blue-500/10 text-blue-300",
  "Diagnosis Done": "border-indigo-500/40 bg-indigo-500/10 text-indigo-300",
  "Estimate Drafted": "border-purple-500/40 bg-purple-500/10 text-purple-300",
  "Awaiting Approval": "border-amber-500/40 bg-amber-500/10 text-amber-300",
  Approved: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  "Repair In Progress": "border-orange-500/40 bg-orange-500/10 text-orange-300",
  "Waiting for Parts": "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
  "Quality Check": "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
  Completed: "border-green-500/40 bg-green-500/10 text-green-300",
};

const currency = (value: any) =>
  `R ${Number(value || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

function estimateLabel(e: any) {
  if (!e) return "-";
  if (e.source === "vehicle_databases_benchmark" || e.source === "oem_benchmark") {
    return `OEM Benchmark · ${currency(e.total_estimate)} · ${e.status}`;
  }
  if (e.source === "ai") return `VRESS AI · ${currency(e.total_estimate)} · ${e.status}`;
  return `${e.source} · ${currency(e.total_estimate)} · ${e.status}`;
}

export default function GuidedJobCardPage() {
  const params = useParams();
  const router = useRouter();

  const jobId = typeof params?.jobId === "string"
    ? params.jobId
    : Array.isArray(params?.jobId)
      ? params.jobId[0]
      : "";

  const [job, setJob] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [findings, setFindings] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [aiEstimates, setAiEstimates] = useState<any[]>([]);
  const [oemEstimates, setOemEstimates] = useState<any[]>([]);
  const [costComparison, setCostComparison] = useState<any>(null);
  const [selectedEstimateId, setSelectedEstimateId] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [note, setNote] = useState("");
  const [actual, setActual] = useState({
    actual_labor_hours: 0,
    actual_labor_rate: 450,
    actual_parts_cost: 0,
    actual_paint_cost: 0,
    misc_cost: 0,
    notes: "",
  });

  const allEstimates = useMemo(
    () => [...aiEstimates, ...oemEstimates],
    [aiEstimates, oemEstimates]
  );

  const approvedEstimate = allEstimates.find((e) => e.status === "approved");
  const selectedEstimate = allEstimates.find((e) => e.id === selectedEstimateId);
  const latestAi = aiEstimates[0];
  const latestOem = oemEstimates[0];

  const currentStep = Math.max(0, steps.indexOf(job?.status || "Assigned"));
  const progress = Math.round(((currentStep + 1) / steps.length) * 100);
  const canSubmitApproval = selectedEstimate && ["draft", "technician_reviewed"].includes(selectedEstimate.status);
  const canEnterActuals = Boolean(approvedEstimate) || ["Approved", "Repair In Progress", "Waiting for Parts", "Quality Check"].includes(job?.status);

  const load = async () => {
    if (!jobId || jobId === "undefined") {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [jobData, photoData, aiData, oemData, comparison] = await Promise.all([
        api.get(`/technicians/jobs/${jobId}`),
        api.get(`/technicians/jobs/${jobId}/photos`),
        api.get(`/technicians/jobs/${jobId}/estimates`),
        api.get(`/technicians/jobs/${jobId}/oem-estimates`).catch(() => []),
        api.get(`/technicians/jobs/${jobId}/cost-comparison`).catch(() => null),
      ]);

      const normalizedJob =
        jobData?.job ||
        jobData?.data ||
        (Array.isArray(jobData) ? jobData[0] : jobData);

      setJob(normalizedJob);
      setPhotos(photoData || []);
      setFindings(jobData?.findings || normalizedJob?.findings || []);
      setNotes(jobData?.notes || normalizedJob?.notes || []);
      setAiEstimates(Array.isArray(aiData) ? aiData : aiData?.estimates || aiData?.data || []);
      setOemEstimates(Array.isArray(oemData) ? oemData : oemData?.estimates || oemData?.data || []);
      setCostComparison(comparison?.data || comparison);

      const combined = [...(aiData || []), ...(oemData || [])];
      const preferred =
        combined.find((e) => e.status === "submitted_for_approval") ||
        combined.find((e) => e.status === "approved") ||
        combined.find((e) => e.status === "draft");

      if (preferred) setSelectedEstimateId(preferred.id);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!jobId || jobId === "undefined") {
      setLoading(false);
      return;
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const updateStatus = async (status: string) => {
    setSavingStatus(status);
    try {
      await api.patch(`/technicians/jobs/${jobId}/status`, { status });
      await load();
    } catch (err: any) {
      alert(err?.message || "Failed to update status.");
    } finally {
      setSavingStatus(null);
    }
  };

  const submitSelectedEstimate = async () => {
    if (!selectedEstimateId) {
      alert("Select an estimate first.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/technicians/estimates/${selectedEstimateId}/submit`, {});
      await load();
    } catch (err: any) {
      alert(err?.message || "Failed to submit estimate.");
    } finally {
      setSubmitting(false);
    }
  };

  const saveNote = async () => {
    if (!note.trim()) return;
    await api.post(`/technicians/jobs/${jobId}/notes`, {
      note_type: "general",
      note,
    });
    setNote("");
    await load();
  };

  const saveActualCosts = async () => {
    await api.post(`/technicians/jobs/${jobId}/actual-costs`, {
      estimate_id: approvedEstimate?.id || selectedEstimateId || null,
      ...actual,
    });
    await load();
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-emerald-400" size={32} />
      </div>
    );
  }

  if (!jobId || jobId === "undefined") {
    return (
      <div className="space-y-4 p-8 text-zinc-400">
        <p>Invalid job card link.</p>
        <button
          onClick={() => router.replace("/technician/jobs")}
          className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white"
        >
          Back to Assigned Jobs
        </button>
      </div>
    );
  }

  if (!job) {
    return <div className="p-8 text-zinc-400">Job not found.</div>;
  }

  const vehicle = job.vehicles || {};

  return (
    <div className="space-y-6 pb-20">
      <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/70">
        <div className="bg-gradient-to-r from-emerald-500/10 via-zinc-900 to-purple-500/20 p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-emerald-400">
                Guided Job Card
              </p>
              <h1 className="mt-3 text-3xl font-bold text-white">{job.title}</h1>
              <p className="mt-2 text-sm text-zinc-400">
                {vehicle.make} {vehicle.model} · {vehicle.license_plate || vehicle.vin} · {job.priority} priority
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <span className={`rounded-full border px-4 py-2 text-sm font-bold ${statusColor[job.status] || "border-zinc-700 text-zinc-300"}`}>
                Current Status: {job.status}
              </span>

              <button
                onClick={submitSelectedEstimate}
                disabled={!canSubmitApproval || submitting}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                Submit Selected Estimate
              </button>
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-2 flex justify-between text-xs text-zinc-500">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-black/40">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-purple-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-5 grid gap-2 md:grid-cols-5 xl:grid-cols-10">
              {steps.map((step, index) => (
                <button
                  key={step}
                  onClick={() => updateStatus(step)}
                  disabled={savingStatus === step}
                  className={`cursor-pointer rounded-xl border px-3 py-3 text-xs font-semibold transition hover:scale-[1.01] ${
                    index <= currentStep
                      ? statusColor[step] || "border-zinc-700 bg-zinc-900 text-zinc-300"
                      : "border-zinc-800 bg-black text-zinc-600 hover:text-zinc-300"
                  }`}
                >
                  {savingStatus === step ? <Loader2 className="mx-auto animate-spin" size={14} /> : step}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-5">
          <Mini title="VIN" value={vehicle.vin || "-"} />
          <Mini title="Plate" value={vehicle.license_plate || "-"} />
          <Mini title="Mileage" value={job.intake_mileage || vehicle.current_mileage || "-"} />
          <Mini title="AI Estimate" value={latestAi ? currency(latestAi.total_estimate) : "-"} />
          <Mini title="OEM Benchmark" value={latestOem ? currency(latestOem.total_estimate) : "-"} />
        </div>

        <div className="px-6 pb-6">
          <div className="rounded-2xl border border-zinc-800 bg-black p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Reported Issue</p>
            <p className="mt-2 text-sm leading-6 text-zinc-200">{job.reported_issue}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-white">Estimate Selection</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Estimates are created on their own pages. Select one here when ready for approval.
              </p>
            </div>

            {approvedEstimate && (
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300">
                <Lock size={14} />
                Approved source locked
              </span>
            )}
          </div>

          <select
            value={selectedEstimateId}
            onChange={(e) => setSelectedEstimateId(e.target.value)}
            className="w-full cursor-pointer rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm text-white"
          >
            <option value="">Select saved estimate</option>
            {allEstimates.map((estimate) => (
              <option key={estimate.id} value={estimate.id}>
                {estimateLabel(estimate)}
              </option>
            ))}
          </select>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Link
              href="/technician/ai-estimates"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-purple-500/40 bg-purple-500/10 px-4 py-3 text-sm font-semibold text-purple-200 hover:bg-purple-500/20"
            >
              <Bot size={16} />
              Open AI Estimates
              <ExternalLink size={14} />
            </Link>

            <Link
              href="/technician/oem-estimates"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-sky-500/40 bg-sky-500/10 px-4 py-3 text-sm font-semibold text-sky-200 hover:bg-sky-500/20"
            >
              <Database size={16} />
              Open OEM Benchmark
              <ExternalLink size={14} />
            </Link>
          </div>

          {selectedEstimate ? (
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <Mini title="Parts" value={currency(selectedEstimate.total_parts)} />
              <Mini title="Labour" value={currency(selectedEstimate.total_labor)} />
              <Mini title="Paint" value={currency(selectedEstimate.total_paint)} />
              <Mini title="Total" value={currency(selectedEstimate.total_estimate)} />
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-zinc-800 p-10 text-center text-sm text-zinc-500">
              No estimate selected yet.
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6">
          <h2 className="font-semibold text-white">Photos & Evidence</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {photos.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-zinc-800 p-10 text-center text-sm text-zinc-500">
                No photos yet. Upload from AI Estimates page.
              </div>
            ) : (
              photos.map((photo) => (
                <div key={photo.id} className="overflow-hidden rounded-2xl border border-zinc-800 bg-black">
                  <img src={photo.image_url} alt="" className="h-40 w-full object-cover" />
                  <div className="p-3">
                    <p className="text-xs font-bold uppercase text-emerald-400">{photo.photo_type}</p>
                    <p className="mt-1 text-sm text-zinc-400">{photo.caption || "No caption"}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6">
          <h2 className="font-semibold text-white">Findings</h2>
          <div className="mt-4 space-y-3">
            {findings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 p-10 text-center text-sm text-zinc-500">
                No findings captured yet.
              </div>
            ) : (
              findings.map((finding) => (
                <div key={finding.id} className="rounded-2xl bg-black p-4">
                  <p className="font-semibold text-white">{finding.component_name}</p>
                  <p className="mt-1 text-sm text-zinc-400">{finding.description}</p>
                  <p className="mt-2 text-xs text-emerald-400">{finding.recommended_action}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6">
          <h2 className="font-semibold text-white">Notes / Timeline</h2>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add job note..."
            className="mt-4 min-h-24 w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm text-white"
          />

          <button
            onClick={saveNote}
            className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-400"
          >
            <Save size={16} />
            Save Note
          </button>

          <div className="mt-5 space-y-3">
            {notes.map((n) => (
              <div key={n.id} className="rounded-2xl bg-black p-4">
                <p className="text-xs font-bold uppercase text-zinc-500">{n.note_type}</p>
                <p className="mt-1 text-sm text-zinc-300">{n.note}</p>
                {Number(n.cost || 0) > 0 && (
                  <p className="mt-2 text-xs font-bold text-emerald-400">Cost: {currency(n.cost)}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {canEnterActuals ? (
      <section className={`rounded-3xl border p-6 ${
        canEnterActuals
          ? "border-zinc-800 bg-zinc-900/70"
          : "border-zinc-800 bg-zinc-950/60 opacity-60"
      }`}>
        <div className="mb-4 flex items-center gap-2">
          {canEnterActuals ? (
            <ClipboardList className="text-emerald-400" size={18} />
          ) : (
            <AlertTriangle className="text-amber-400" size={18} />
          )}
          <div>
            <h2 className="font-semibold text-white">Actual Repair Costs & Variance</h2>
            <p className="text-sm text-zinc-500">
              Actual costs unlock after estimate approval.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-5">
          <Input label="Labour Hours" value={actual.actual_labor_hours} onChange={(v) => setActual({ ...actual, actual_labor_hours: v })} disabled={!canEnterActuals} />
          <Input label="Labour Rate" value={actual.actual_labor_rate} onChange={(v) => setActual({ ...actual, actual_labor_rate: v })} disabled={!canEnterActuals} />
          <Input label="Parts Cost" value={actual.actual_parts_cost} onChange={(v) => setActual({ ...actual, actual_parts_cost: v })} disabled={!canEnterActuals} />
          <Input label="Paint Cost" value={actual.actual_paint_cost} onChange={(v) => setActual({ ...actual, actual_paint_cost: v })} disabled={!canEnterActuals} />
          <Input label="Misc Cost" value={actual.misc_cost} onChange={(v) => setActual({ ...actual, misc_cost: v })} disabled={!canEnterActuals} />
        </div>

        <textarea
          value={actual.notes}
          onChange={(e) => setActual({ ...actual, notes: e.target.value })}
          disabled={!canEnterActuals}
          placeholder="Actual repair notes..."
          className="mt-3 min-h-24 w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm text-white disabled:cursor-not-allowed"
        />

        <button
          onClick={saveActualCosts}
          disabled={!canEnterActuals}
          className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Save size={16} />
          Save Actual Costs
        </button>

        {costComparison && (
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <Mini title="Estimated" value={currency(costComparison.estimated_total)} />
            <Mini title="Actual" value={currency(costComparison.actual_total)} />
            <Mini title="Variance" value={currency(costComparison.variance)} />
            <Mini title="Variance %" value={`${Number(costComparison.variance_percent || 0).toFixed(1)}%`} />
          </div>
        )}
      </section>

      ) : (
        <section className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-1 text-amber-400" size={18} />
            <div>
              <h2 className="font-semibold text-white">Actual costs locked</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Actual repair costs unlock only after admin approves the selected estimate.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function Mini({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{title}</p>
      <p className="mt-3 truncate text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <label className="text-sm text-zinc-400">
      {label}
      <input
        type="number"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value || 0))}
        className="mt-1 w-full rounded-xl border border-zinc-700 bg-black px-3 py-3 text-sm text-white disabled:cursor-not-allowed"
      />
    </label>
  );
}
