"use client";

import { useEffect, useState } from "react";
import { ClipboardCheck, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import DamageIntakeForm from "@/components/evidence/DamageIntakeForm";
import EvidencePackagePanel from "@/components/evidence/EvidencePackagePanel";

export default function TechnicianEvidencePage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/technicians/jobs")
      .then((data) => {
        setJobs(data || []);
        if (data?.length) setSelectedJobId(data[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-brand-primary">Technician Evidence</p>
          <h1 className="mt-1 text-3xl font-black text-zinc-950 dark:text-white">Damage Intake & Evidence</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Capture structured damage details, photos, video and voice notes before generating the LMG AI estimate.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-card-dark">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Open Job Card</label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="mt-2 w-full min-w-[360px] rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} — {job.vehicles?.make} {job.vehicles?.model} ({job.vehicles?.license_plate || job.vehicles?.vin || "No plate"})
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedJobId ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 p-12 text-center text-zinc-500 dark:border-zinc-800">
          <ClipboardCheck className="mx-auto mb-3" />
          No technician jobs available.
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          <DamageIntakeForm jobId={selectedJobId} />
          <EvidencePackagePanel jobId={selectedJobId} />
        </div>
      )}
    </div>
  );
}
