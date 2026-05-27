"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Play, CheckCircle2, Plus } from "lucide-react";
import { api } from "@/lib/api";

const statuses = [
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

export default function TechnicianJobCardPage() {
  const params = useParams();
  const jobId = params.jobId as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [finding, setFinding] = useState({
    component_name: "",
    description: "",
    severity: "Medium",
    recommended_action: "Inspect further",
  });

  const fetchJob = async () => {
    setLoading(true);
    api.get(`/technicians/jobs/${jobId}`)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const updateStatus = async (status: string) => {
    await api.patch(`/technicians/jobs/${jobId}/status`, { status });
    await fetchJob();
  };

  const addNote = async () => {
    if (!note.trim()) return;
    await api.post(`/technicians/jobs/${jobId}/notes`, { note_type: "general", note });
    setNote("");
    await fetchJob();
  };

  const addFinding = async () => {
    if (!finding.component_name || !finding.description) return;
    await api.post(`/technicians/jobs/${jobId}/findings`, finding);
    setFinding({ component_name: "", description: "", severity: "Medium", recommended_action: "Inspect further" });
    await fetchJob();
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>;

  const job = data?.job;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-400">Job Card</p>
          <h1 className="text-2xl font-bold text-white">{job?.title}</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {job?.vehicles?.make} {job?.vehicles?.model} • {job?.vehicles?.license_plate || job?.vehicles?.vin}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => updateStatus("Inspection Started")} className="inline-flex items-center gap-2 rounded-lg bg-amber-500/15 px-4 py-2 text-sm text-amber-300">
            <Play size={16} /> Start Inspection
          </button>
          <button onClick={() => updateStatus("Completed")} className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white">
            <CheckCircle2 size={16} /> Complete
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
        <div className="grid gap-4 md:grid-cols-4">
          <Info label="Status" value={job?.status} />
          <Info label="Priority" value={job?.priority} />
          <Info label="VIN" value={job?.vehicles?.vin} />
          <Info label="Mileage" value={job?.intake_mileage || job?.vehicles?.current_mileage || "-"} />
        </div>

        <div className="mt-5 rounded-xl bg-zinc-950 p-4">
          <p className="text-xs uppercase text-zinc-500">Reported issue</p>
          <p className="mt-1 text-sm text-zinc-200">{job?.reported_issue}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
        <h2 className="font-semibold text-white">Move Job Status</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {statuses.map((status) => (
            <button key={status} onClick={() => updateStatus(status)} className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:border-emerald-500 hover:text-emerald-300">
              {status}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
          <h2 className="font-semibold text-white">Add Inspection Finding</h2>
          <div className="mt-4 space-y-3">
            <input value={finding.component_name} onChange={(e) => setFinding({ ...finding, component_name: e.target.value })} placeholder="Component e.g. Front bumper" className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
            <textarea value={finding.description} onChange={(e) => setFinding({ ...finding, description: e.target.value })} placeholder="Describe fault/damage..." className="min-h-24 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
            <div className="grid gap-3 md:grid-cols-2">
              <select value={finding.severity} onChange={(e) => setFinding({ ...finding, severity: e.target.value })} className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white">
                <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
              </select>
              <select value={finding.recommended_action} onChange={(e) => setFinding({ ...finding, recommended_action: e.target.value })} className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white">
                <option>Repair</option><option>Replace</option><option>Paint</option><option>Service</option><option>Inspect further</option><option>No action</option>
              </select>
            </div>
            <button onClick={addFinding} className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white">
              <Plus size={16} /> Add Finding
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
          <h2 className="font-semibold text-white">Add Job Note</h2>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Technician note..." className="mt-4 min-h-32 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white" />
          <button onClick={addNote} className="mt-3 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white">
            Save Note
          </button>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <List title="Findings" items={data?.findings || []} />
        <List title="Notes" items={data?.notes || []} />
      </div>
    </div>
  );
}

function Info({ label, value }: any) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-sm text-zinc-200">{value || "-"}</p>
    </div>
  );
}

function List({ title, items }: any) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
      <h2 className="font-semibold text-white">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? <p className="text-sm text-zinc-500">No records yet.</p> : items.map((item: any) => (
          <div key={item.id} className="rounded-xl bg-zinc-950 p-3 text-sm text-zinc-300">
            <p className="font-medium text-white">{item.component_name || item.note_type || "Record"}</p>
            <p className="mt-1 text-zinc-400">{item.description || item.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
