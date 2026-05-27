"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bot, ClipboardList, ExternalLink, Loader2, Send, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import OpenJobPicker from "@/components/technician/OpenJobPicker";

function money(value: any) {
  return `R ${Number(value || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function TechnicianEstimatesPage() {
  const [job, setJob] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [estimates, setEstimates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const latestEstimate = estimates?.[0];
  const lines = latestEstimate?.technician_estimate_lines || latestEstimate?.lines || [];

  const canGenerate = useMemo(() => {
    return job && photos.length > 0 && ["Inspection Started", "Diagnosis Done"].includes(job.status);
  }, [job, photos.length]);

  const canSubmit = useMemo(() => {
    return job && latestEstimate && job.status === "Estimate Drafted";
  }, [job, latestEstimate]);

  const loadJobContext = async (selectedJob: any) => {
    setJob(selectedJob);
    setLoading(true);

    try {
      const [photoData, estimateData] = await Promise.all([
        api.get(`/technicians/jobs/${selectedJob.id}/photos`),
        api.get(`/technicians/jobs/${selectedJob.id}/estimates`),
      ]);

      setPhotos(photoData || []);
      setEstimates(estimateData || []);
    } catch (err) {
      console.error(err);
      setPhotos([]);
      setEstimates([]);
    } finally {
      setLoading(false);
    }
  };

  const generateEstimate = async () => {
    if (!job || photos.length === 0) {
      alert("Select a job with uploaded photos first.");
      return;
    }

    setGenerating(true);
    try {
      await api.post(`/technicians/jobs/${job.id}/ai-estimate`, {
        photo_ids: photos.map((p) => p.id),
        labor_rate: 450,
        technician_notes: "Generate AI estimate from the selected open job.",
      });

      await loadJobContext(job);
    } catch (err: any) {
      alert(err?.message || "AI estimate failed.");
    } finally {
      setGenerating(false);
    }
  };

  const submitEstimate = async () => {
    if (!latestEstimate?.id) return;

    setSubmitting(true);
    try {
      await api.post(`/technicians/estimates/${latestEstimate.id}/submit`, {});
      await loadJobContext({ ...job, status: "Awaiting Approval" });
    } catch (err: any) {
      alert(err?.message || "Submit failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <p className="text-sm font-medium text-emerald-400">Repair Tool</p>
        <h1 className="text-3xl font-bold text-white">Repair Estimates</h1>
        <p className="mt-2 text-sm text-zinc-400">
          This page does not create a separate workflow. It uses the selected open job card and opens the job card for full review.
        </p>
      </div>

      <OpenJobPicker onJobSelected={loadJobContext} navigateOnSelect={false} />

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6">
            <div className="flex items-center gap-2">
              <ClipboardList className="text-emerald-400" size={20} />
              <h2 className="font-semibold text-white">Selected Job</h2>
            </div>

            <div className="mt-5 space-y-3">
              <Mini label="Status" value={job?.status} />
              <Mini
                label="Vehicle"
                value={`${job?.vehicles?.make || "-"} ${job?.vehicles?.model || ""}`}
              />
              <Mini label="Plate" value={job?.vehicles?.license_plate || "-"} />
              <Mini label="Photos" value={`${photos.length}`} />
            </div>

            {job?.id && (
              <Link
                href={`/technician/jobs/${job.id}`}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm font-semibold text-zinc-200 hover:border-emerald-500"
              >
                <ExternalLink size={16} />
                Open Full Job Card
              </Link>
            )}
          </section>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Bot className="text-emerald-400" size={20} />
                  <h2 className="font-semibold text-white">Estimate Queue</h2>
                </div>
                <p className="mt-1 text-sm text-zinc-500">
                  Generate only when the job has photos. Submit only when the selected job is in Estimate Drafted.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={generateEstimate}
                  disabled={!canGenerate || generating}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-purple-500 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {generating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                  Generate AI Estimate
                </button>

                <button
                  onClick={submitEstimate}
                  disabled={!canSubmit || submitting}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                  Submit for Approval
                </button>
              </div>
            </div>

            {!latestEstimate ? (
              <div className="mt-6 rounded-2xl border border-dashed border-zinc-700 p-10 text-center">
                <Bot className="mx-auto text-zinc-600" size={36} />
                <p className="mt-3 font-medium text-white">No estimate for this job yet</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Upload photos inside the job card, then generate the AI estimate here or inside the job card.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="grid gap-3 md:grid-cols-4">
                  <Summary label="Parts" value={money(latestEstimate.total_parts)} />
                  <Summary label="Labour" value={money(latestEstimate.total_labor)} />
                  <Summary label="Paint" value={money(latestEstimate.total_paint)} />
                  <Summary label="Total" value={money(latestEstimate.total_estimate)} strong />
                </div>

                <div className="overflow-hidden rounded-2xl border border-zinc-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-950 text-xs uppercase text-zinc-500">
                      <tr>
                        <th className="p-3">Component</th>
                        <th className="p-3">Damage</th>
                        <th className="p-3">Action</th>
                        <th className="p-3 text-right">Labour</th>
                        <th className="p-3 text-right">Parts</th>
                        <th className="p-3 text-right">Paint</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {lines.map((line: any) => (
                        <tr key={line.id} className="bg-zinc-900/50">
                          <td className="p-3 text-white">{line.component_name}</td>
                          <td className="p-3 text-zinc-300">{line.damage_type}</td>
                          <td className="p-3 text-zinc-300">{line.action}</td>
                          <td className="p-3 text-right text-zinc-300">{line.labor_hours}h</td>
                          <td className="p-3 text-right text-zinc-300">{money(line.parts_cost)}</td>
                          <td className="p-3 text-right text-zinc-300">{money(line.paint_cost)}</td>
                          <td className="p-3 text-right font-semibold text-white">{money(line.line_total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-xs text-zinc-500">
                  Estimate status:{" "}
                  <span className="font-medium text-emerald-400">
                    {latestEstimate.status}
                  </span>
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-xs uppercase text-zinc-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value || "-"}</p>
    </div>
  );
}

function Summary({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-xs uppercase text-zinc-500">{label}</p>
      <p className={`mt-2 text-lg font-bold ${strong ? "text-emerald-300" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}
