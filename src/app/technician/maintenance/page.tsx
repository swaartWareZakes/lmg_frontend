"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2, Save, Wrench } from "lucide-react";
import { api } from "@/lib/api";
import OpenJobPicker from "@/components/technician/OpenJobPicker";

const statuses = [
  "Repair In Progress",
  "Waiting for Parts",
  "Quality Check",
  "Completed",
];

const updateTypes = [
  "damage",
  "routine",
  "service",
  "inspection",
  "parts",
  "quality_check",
];

export default function TechnicianMaintenancePage() {
  const [job, setJob] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    job_description: "",
    status: "Repair In Progress",
    cost: 0,
    notes: "",
    next_due: "",
    log_type: "damage",
  });

  const vehicle = job?.vehicles;

  const saveUpdate = async () => {
    if (!job?.id) {
      alert("Select an open job first.");
      return;
    }

    if (!form.job_description.trim()) {
      alert("Add a short work update.");
      return;
    }

    setSaving(true);

    try {
      await api.post("/technicians/maintenance/update", {
        technician_job_id: job.id,
        vehicle_id: vehicle?.id,
        ...form,
      });

      alert("Maintenance update saved to selected job.");

      setForm({
        job_description: "",
        status: "Repair In Progress",
        cost: 0,
        notes: "",
        next_due: "",
        log_type: "damage",
      });
    } catch (err: any) {
      alert(err?.message || "Failed to save maintenance update.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <p className="text-sm font-medium text-emerald-400">Technician Operations</p>
        <h1 className="text-3xl font-bold text-white">Maintenance Updates</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Select an open job card, then record work updates against that job. Actual costs still belong in the guided job card after approval.
        </p>
      </div>

      <OpenJobPicker onJobSelected={setJob} navigateOnSelect={false} />

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6">
          <div className="flex items-center gap-2">
            <Wrench className="text-emerald-400" size={20} />
            <h2 className="font-semibold text-white">Selected Job</h2>
          </div>

          <div className="mt-5 space-y-3">
            <Mini label="Status" value={job?.status} />
            <Mini
              label="Vehicle"
              value={`${vehicle?.make || "-"} ${vehicle?.model || ""}`}
            />
            <Mini label="Plate" value={vehicle?.license_plate || "-"} />
            <Mini label="VIN" value={vehicle?.vin || "-"} />
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
          <h2 className="font-semibold text-white">Job-linked Maintenance Update</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Use this for operational updates. Do not duplicate LMG estimate or approval steps here.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm text-zinc-300">
              Update Type
              <select
                value={form.log_type}
                onChange={(e) => setForm({ ...form, log_type: e.target.value })}
                className="mt-1 w-full cursor-pointer rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-white"
              >
                {updateTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace("_", " ")}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-zinc-300">
              Job Status Update
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="mt-1 w-full cursor-pointer rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-white"
              >
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>

            <label className="text-sm text-zinc-300 md:col-span-2">
              Work Update
              <input
                value={form.job_description}
                onChange={(e) =>
                  setForm({ ...form, job_description: e.target.value })
                }
                placeholder="e.g. Removed damaged bumper and inspected brackets"
                className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-white"
              />
            </label>

            <label className="text-sm text-zinc-300">
              Update Cost, if any
              <input
                type="number"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-white"
              />
            </label>

            <label className="text-sm text-zinc-300">
              Next Due / Next Action
              <input
                value={form.next_due}
                onChange={(e) => setForm({ ...form, next_due: e.target.value })}
                placeholder="e.g. Quality inspection after parts fitted"
                className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-white"
              />
            </label>

            <label className="text-sm text-zinc-300 md:col-span-2">
              Technician Notes
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Optional notes..."
                className="mt-1 min-h-32 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-white"
              />
            </label>
          </div>

          <button
            onClick={saveUpdate}
            disabled={saving || !job}
            className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Save Update
          </button>
        </section>
      </div>
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
