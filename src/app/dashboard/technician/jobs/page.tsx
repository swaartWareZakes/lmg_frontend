"use client";

export default function TechnicianJobsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-emerald-400 font-medium">Technician Tool</p>
        <h1 className="text-2xl font-bold text-white">Assigned Jobs</h1>
        <p className="text-sm text-slate-400 mt-1">
          View assigned vehicles, open repair tasks and job status.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <p className="text-slate-300">Assigned jobs list will live here.</p>
      </div>
    </div>
  );
}
