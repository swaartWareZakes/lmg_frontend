"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  Camera,
  CheckCircle2,
  Database,
  FileSearch,
  Loader2,
  RefreshCw,
  Send,
  Upload,
  Wrench,
} from "lucide-react";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";

type Job = {
  id: string;
  title: string;
  status: string;
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

type Photo = {
  id: string;
  image_url: string;
  photo_type?: string;
  caption?: string;
};

type EstimateLine = {
  id?: string;
  component_name: string;
  damage_type?: string;
  action?: string;
  labor_hours?: number;
  labor_cost?: number;
  parts_cost?: number;
  paint_cost?: number;
  line_total?: number;
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
  technician_estimate_lines?: EstimateLine[];
  lines?: EstimateLine[];
};

const currency = (value: any) =>
  `R ${Number(value || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

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

export default function TechnicianAiEstimatesPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobId, setJobId] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [photoType, setPhotoType] = useState("damage");
  const [caption, setCaption] = useState("");

  const selectedJob = jobs.find((j) => j.id === jobId);
  const latest = estimates.find((e) => e.source === "ai" || e.source === "technician_adjusted") || estimates[0];
  const lines = latest?.technician_estimate_lines || latest?.lines || [];

  const loadJobs = async () => {
    const data = await api.get("/technicians/jobs");
    const open = (data || []).filter((j: Job) => openStatuses.has(j.status));
    setJobs(open);
    if (!jobId && open.length) setJobId(open[0].id);
  };

  const loadJobData = async (id: string) => {
    if (!id) return;
    const [photoData, estimateData] = await Promise.all([
      api.get(`/technicians/jobs/${id}/photos`),
      api.get(`/technicians/jobs/${id}/estimates`),
    ]);
    setPhotos(photoData || []);
    setEstimates(estimateData || []);
  };

  const refresh = async () => {
    setLoading(true);
    try {
      await loadJobs();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (jobId) loadJobData(jobId);
  }, [jobId]);

  const uploadPhoto = async () => {
    if (!jobId || !file) {
      alert("Choose a job and photo first.");
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("photo_type", photoType);
      form.append("caption", caption);

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        throw new Error("Missing auth session. Please log out and log back in.");
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/technicians/jobs/${jobId}/photos`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        }
      );

      if (!res.ok) throw new Error(await res.text());

      setFile(null);
      setCaption("");
      await loadJobData(jobId);
    } catch (err: any) {
      alert(err?.message || "Photo upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const generateAiEstimate = async () => {
    if (!jobId) return;
    if (!photos.length) {
      alert("Upload at least one damage photo first.");
      return;
    }

    setGenerating(true);
    try {
      await api.post(`/technicians/jobs/${jobId}/ai-estimate`, {});
      await loadJobData(jobId);
    } catch (err: any) {
      alert(err?.message || "AI estimate failed.");
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
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-400">Estimates</p>
          <h1 className="text-3xl font-bold text-white">AI Estimate</h1>
          <p className="mt-2 max-w-3xl text-sm text-zinc-400">
            Upload job evidence and generate the LMG AI estimate here. The job card only submits saved estimates for approval.
          </p>
        </div>

        <button
          onClick={refresh}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300 hover:border-emerald-500"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6">
        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Open Job Card
        </label>
        <select
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
          className="mt-2 w-full cursor-pointer rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
        >
          {jobs.length === 0 ? (
            <option>No open jobs available</option>
          ) : (
            jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} — {job.vehicles?.make} {job.vehicles?.model} ({job.vehicles?.license_plate || job.vehicles?.vin})
              </option>
            ))
          )}
        </select>

        {selectedJob && (
          <div className="mt-5 grid gap-3 md:grid-cols-5">
            <Mini title="Vehicle" value={`${selectedJob.vehicles?.make || "-"} ${selectedJob.vehicles?.model || ""}`} icon={<Wrench size={16} />} />
            <Mini title="Year" value={selectedJob.vehicles?.year || "-"} icon={<Database size={16} />} />
            <Mini title="VIN" value={selectedJob.vehicles?.vin || "-"} icon={<FileSearch size={16} />} />
            <Mini title="Status" value={selectedJob.status} icon={<CheckCircle2 size={16} />} />
            <Mini title="Mileage" value={selectedJob.intake_mileage || selectedJob.vehicles?.current_mileage || "-"} icon={<Wrench size={16} />} />
          </div>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6">
          <div className="flex items-center gap-2">
            <Camera className="text-emerald-400" size={18} />
            <h2 className="font-semibold text-white">Photos & Evidence</h2>
          </div>

          <div className="mt-4 space-y-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full cursor-pointer rounded-xl border border-zinc-700 bg-black px-3 py-3 text-sm text-zinc-300"
            />

            <select
              value={photoType}
              onChange={(e) => setPhotoType(e.target.value)}
              className="w-full cursor-pointer rounded-xl border border-zinc-700 bg-black px-3 py-3 text-sm text-white"
            >
              <option value="damage">Damage</option>
              <option value="front">Front</option>
              <option value="rear">Rear</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="vin_plate">VIN Plate</option>
              <option value="odometer">Odometer</option>
              <option value="before">Before</option>
              <option value="after">After</option>
              <option value="other">Other</option>
            </select>

            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Caption"
              className="w-full rounded-xl border border-zinc-700 bg-black px-3 py-3 text-sm text-white"
            />

            <button
              onClick={uploadPhoto}
              disabled={uploading || !file || !jobId}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
              Upload Photo
            </button>
          </div>

          <div className="mt-5 grid gap-3">
            {photos.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
                No photos uploaded yet.
              </div>
            ) : (
              photos.map((photo) => (
                <div key={photo.id} className="overflow-hidden rounded-2xl border border-zinc-800 bg-black">
                  <img src={photo.image_url} alt="" className="h-40 w-full object-cover" />
                  <div className="p-3">
                    <p className="text-xs font-semibold uppercase text-emerald-400">{photo.photo_type}</p>
                    <p className="mt-1 text-sm text-zinc-400">{photo.caption || "No caption"}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Bot className="text-emerald-400" size={18} />
                <h2 className="font-semibold text-white">LMG AI Estimate</h2>
              </div>
              <p className="mt-1 text-sm text-zinc-500">
                Generate or review the AI draft. Submit approval from the job card.
              </p>
            </div>

            <button
              onClick={generateAiEstimate}
              disabled={generating || !jobId || photos.length === 0}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-purple-500 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              Generate AI Estimate
            </button>
          </div>

          {!latest ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 p-14 text-center text-zinc-500">
              Upload photos, then generate an AI estimate.
            </div>
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-4">
                <Mini title="Parts" value={currency(latest.total_parts)} icon={<Database size={16} />} />
                <Mini title="Labour" value={currency(latest.total_labor)} icon={<Wrench size={16} />} />
                <Mini title="Paint" value={currency(latest.total_paint)} icon={<Bot size={16} />} />
                <Mini title="Total" value={currency(latest.total_estimate)} icon={<CheckCircle2 size={16} />} />
              </div>

              <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-800 bg-black">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase text-zinc-500">
                    <tr>
                      <th className="px-4 py-3">Component</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Labour</th>
                      <th className="px-4 py-3">Parts</th>
                      <th className="px-4 py-3">Paint</th>
                      <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {lines.map((line, index) => (
                      <tr key={line.id || index}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-white">{line.component_name}</p>
                          <p className="text-xs text-zinc-500">{line.reasoning}</p>
                        </td>
                        <td className="px-4 py-3 text-zinc-300">{line.action}</td>
                        <td className="px-4 py-3 text-zinc-300">{line.labor_hours || 0}h</td>
                        <td className="px-4 py-3 text-zinc-300">{currency(line.parts_cost)}</td>
                        <td className="px-4 py-3 text-zinc-300">{currency(line.paint_cost)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-white">{currency(line.line_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function Mini({ title, value, icon }: { title: string; value: any; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-zinc-500">{title}</p>
        <span className="text-emerald-400">{icon}</span>
      </div>
      <p className="mt-3 truncate text-lg font-bold text-white">{value}</p>
    </div>
  );
}
