"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Bot,
  Camera,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Play,
  Plus,
  Save,
  Send,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

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

const damageAreas = [
  "Front bumper",
  "Rear bumper",
  "Bonnet",
  "Left fender",
  "Right fender",
  "Left headlamp assembly",
  "Right headlamp assembly",
  "Grille",
  "Left door",
  "Right door",
  "Tail lamp",
  "Windscreen",
  "Mirror",
  "Suspension",
  "Engine bay",
  "Interior",
  "Other",
];

const actions = [
  "Inspect further",
  "Repair",
  "Replace",
  "Paint",
  "Repair + Paint",
  "PDR",
  "Polish",
  "No action",
];

const photoTypes = [
  "damage",
  "front",
  "rear",
  "left",
  "right",
  "interior",
  "vin_plate",
  "odometer",
  "before",
  "after",
  "other",
];

const statusStyles: Record<string, string> = {
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

function money(value: any) {
  return `R ${Number(value || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function TechnicianJobCardPage() {
  const params = useParams();
  const jobId = params.jobId as string;

  const [data, setData] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [estimates, setEstimates] = useState<any[]>([]);
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoType, setPhotoType] = useState("damage");
  const [photoCaption, setPhotoCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  const [finding, setFinding] = useState({
    component_name: "Front bumper",
    finding_type: "damage",
    description: "",
    severity: "Medium",
    recommended_action: "Inspect further",
  });

  const [note, setNote] = useState("");

  const [actual, setActual] = useState({
    actual_labor_hours: 0,
    actual_labor_rate: 450,
    actual_parts_cost: 0,
    actual_paint_cost: 0,
    misc_cost: 0,
    notes: "",
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [jobData, photoData, estimateData] = await Promise.all([
        api.get(`/technicians/jobs/${jobId}`),
        api.get(`/technicians/jobs/${jobId}/photos`),
        api.get(`/technicians/jobs/${jobId}/estimates`),
      ]);

      setData(jobData);
      setPhotos(photoData || []);
      setEstimates(estimateData || []);

      try {
        const comp = await api.get(`/technicians/jobs/${jobId}/cost-comparison`);
        setComparison(comp);
      } catch {
        setComparison(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [jobId]);

  const job = data?.job;
  const vehicle = job?.vehicles;
  const findings = data?.findings || [];
  const notes = data?.notes || [];
  const latestEstimate = estimates?.[0];
  const lines =
    latestEstimate?.technician_estimate_lines || latestEstimate?.lines || [];

  const updateStatus = async (status: string) => {
    await api.patch(`/technicians/jobs/${jobId}/status`, { status });
    await fetchAll();
  };

  const uploadPhoto = async () => {
    if (!photoFile) {
      alert("Choose a photo first.");
      return;
    }

    setUploading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const form = new FormData();
      form.append("file", photoFile);
      form.append("photo_type", photoType);
      form.append("caption", photoCaption);
      form.append("is_primary", photos.length === 0 ? "true" : "false");

      const res = await fetch(
        `${API_BASE_URL}/technicians/jobs/${jobId}/photos`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: form,
        }
      );

      if (!res.ok) throw new Error(await res.text());

      setPhotoFile(null);
      setPhotoCaption("");
      await fetchAll();
    } catch (err: any) {
      alert(err?.message || "Photo upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const generateAIEstimate = async () => {
    if (photos.length === 0) {
      alert("Upload at least one damage photo first.");
      return;
    }

    setGeneratingAI(true);

    try {
      await api.post(`/technicians/jobs/${jobId}/ai-estimate`, {
        photo_ids: photos.map((p) => p.id),
        labor_rate: 450,
        technician_notes: "Generate AI estimate from uploaded damage photos.",
      });

      await fetchAll();
    } catch (err: any) {
      alert(err?.message || "AI estimate failed.");
    } finally {
      setGeneratingAI(false);
    }
  };

  const submitEstimate = async () => {
    if (!latestEstimate?.id) return;
    await api.post(`/technicians/estimates/${latestEstimate.id}/submit`, {});
    await fetchAll();
  };

  const addFinding = async () => {
    if (!finding.description.trim()) {
      alert("Add a short finding description.");
      return;
    }

    await api.post(`/technicians/jobs/${jobId}/findings`, finding);

    setFinding({
      component_name: "Front bumper",
      finding_type: "damage",
      description: "",
      severity: "Medium",
      recommended_action: "Inspect further",
    });

    await fetchAll();
  };

  const addNote = async () => {
    if (!note.trim()) return;

    await api.post(`/technicians/jobs/${jobId}/notes`, {
      note_type: "general",
      note,
    });

    setNote("");
    await fetchAll();
  };

  const saveActualCosts = async () => {
    await api.post(`/technicians/jobs/${jobId}/actual-costs`, {
      ...actual,
      estimate_id: latestEstimate?.id || null,
    });

    setActual({
      actual_labor_hours: 0,
      actual_labor_rate: 450,
      actual_parts_cost: 0,
      actual_paint_cost: 0,
      misc_cost: 0,
      notes: "",
    });

    await fetchAll();
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-400">Job Card</p>
          <h1 className="text-2xl font-bold text-white">{job?.title}</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {vehicle?.make} {vehicle?.model} •{" "}
            {vehicle?.license_plate || vehicle?.vin}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => updateStatus("Inspection Started")}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-amber-500/15 px-4 py-2 text-sm text-amber-300 hover:bg-amber-500/25"
          >
            <Play size={16} />
            Start Inspection
          </button>

          <button
            onClick={() => updateStatus("Completed")}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400"
          >
            <CheckCircle2 size={16} />
            Complete
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
        <div className="grid gap-4 md:grid-cols-5">
          <Info label="Status" value={job?.status} />
          <Info label="Priority" value={job?.priority} />
          <Info label="VIN" value={vehicle?.vin} />
          <Info
            label="Mileage"
            value={job?.intake_mileage || vehicle?.current_mileage || "-"}
          />
          <Info
            label="Latest Estimate"
            value={latestEstimate ? money(latestEstimate.total_estimate) : "-"}
          />
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
            <button
              key={status}
              onClick={() => updateStatus(status)}
              className={`cursor-pointer rounded-lg border px-3 py-2 text-sm transition hover:scale-[1.02] ${
                statusStyles[status] || "border-zinc-700 text-zinc-300"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
          <div className="flex items-center gap-2">
            <Camera className="text-emerald-400" size={20} />
            <h2 className="font-semibold text-white">Damage Photos</h2>
          </div>

          <div className="mt-4 space-y-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
              className="w-full cursor-pointer rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-300"
            />

            <div className="grid gap-3 md:grid-cols-2">
              <select
                value={photoType}
                onChange={(e) => setPhotoType(e.target.value)}
                className="cursor-pointer rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
              >
                {photoTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace("_", " ")}
                  </option>
                ))}
              </select>

              <input
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
                placeholder="Caption"
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
              />
            </div>

            <button
              onClick={uploadPhoto}
              disabled={uploading}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400 disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <ImagePlus size={16} />
              )}
              Upload Photo
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {photos.length === 0 ? (
              <div className="col-span-2 rounded-xl border border-dashed border-zinc-700 p-8 text-center text-sm text-zinc-500">
                No photos uploaded yet.
              </div>
            ) : (
              photos.map((photo) => (
                <div
                  key={photo.id}
                  className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950"
                >
                  <img
                    src={photo.image_url}
                    alt={photo.caption || "Job photo"}
                    className="h-36 w-full object-cover"
                  />
                  <div className="p-3">
                    <p className="text-xs font-medium uppercase text-emerald-400">
                      {photo.photo_type?.replace("_", " ")}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
                      {photo.caption || "No caption"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Bot className="text-emerald-400" size={20} />
                <h2 className="font-semibold text-white">
                  AI Repair Estimate
                </h2>
              </div>
              <p className="mt-1 text-sm text-zinc-500">
                Upload photos, then generate a draft estimate.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={generateAIEstimate}
                disabled={generatingAI || photos.length === 0}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {generatingAI ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Sparkles size={16} />
                )}
                Generate AI Estimate
              </button>

              {latestEstimate && (
                <button
                  onClick={submitEstimate}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400"
                >
                  <Send size={16} />
                  Submit for Approval
                </button>
              )}
            </div>
          </div>

          {!latestEstimate ? (
            <div className="mt-6 rounded-xl border border-dashed border-zinc-700 p-10 text-center">
              <Bot className="mx-auto text-zinc-600" size={36} />
              <p className="mt-3 font-medium text-white">No AI estimate yet</p>
              <p className="mt-1 text-sm text-zinc-500">
                Upload the Ranger damage photos, then click Generate AI Estimate.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <div className="grid gap-3 md:grid-cols-4">
                <SummaryCard label="Parts" value={money(latestEstimate.total_parts)} />
                <SummaryCard label="Labour" value={money(latestEstimate.total_labor)} />
                <SummaryCard label="Paint" value={money(latestEstimate.total_paint)} />
                <SummaryCard label="Total" value={money(latestEstimate.total_estimate)} strong />
              </div>

              <div className="overflow-hidden rounded-xl border border-zinc-800">
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
                        <td className="p-3 text-right text-zinc-300">
                          {line.labor_hours}h
                        </td>
                        <td className="p-3 text-right text-zinc-300">
                          {money(line.parts_cost)}
                        </td>
                        <td className="p-3 text-right text-zinc-300">
                          {money(line.paint_cost)}
                        </td>
                        <td className="p-3 text-right font-semibold text-white">
                          {money(line.line_total)}
                        </td>
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

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
          <h2 className="font-semibold text-white">Add Inspection Finding</h2>

          <div className="mt-4 space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <select
                value={finding.component_name}
                onChange={(e) =>
                  setFinding({ ...finding, component_name: e.target.value })
                }
                className="cursor-pointer rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
              >
                {damageAreas.map((area) => (
                  <option key={area}>{area}</option>
                ))}
              </select>

              <select
                value={finding.finding_type}
                onChange={(e) =>
                  setFinding({ ...finding, finding_type: e.target.value })
                }
                className="cursor-pointer rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
              >
                <option value="damage">Damage</option>
                <option value="mechanical">Mechanical</option>
                <option value="electrical">Electrical</option>
                <option value="service">Service</option>
                <option value="other">Other</option>
              </select>
            </div>

            <textarea
              value={finding.description}
              onChange={(e) =>
                setFinding({ ...finding, description: e.target.value })
              }
              placeholder="Short technician note..."
              className="min-h-24 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
            />

            <div className="grid gap-3 md:grid-cols-3">
              <select
                value={finding.severity}
                onChange={(e) =>
                  setFinding({ ...finding, severity: e.target.value })
                }
                className="cursor-pointer rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>

              <select
                value={finding.recommended_action}
                onChange={(e) =>
                  setFinding({
                    ...finding,
                    recommended_action: e.target.value,
                  })
                }
                className="cursor-pointer rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white md:col-span-2"
              >
                {actions.map((action) => (
                  <option key={action}>{action}</option>
                ))}
              </select>
            </div>

            <button
              onClick={addFinding}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400"
            >
              <Plus size={16} />
              Add Finding
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
          <h2 className="font-semibold text-white">Add Job Note</h2>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional technician note..."
            className="mt-4 min-h-32 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
          />

          <button
            onClick={addNote}
            className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400"
          >
            <Save size={16} />
            Save Note
          </button>
        </section>
      </div>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
        <h2 className="font-semibold text-white">Actual Repair Costs & Variance</h2>

        <div className="mt-4 grid gap-3 md:grid-cols-5">
          <NumberInput
            label="Labour Hours"
            value={actual.actual_labor_hours}
            onChange={(v) => setActual({ ...actual, actual_labor_hours: v })}
          />
          <NumberInput
            label="Labour Rate"
            value={actual.actual_labor_rate}
            onChange={(v) => setActual({ ...actual, actual_labor_rate: v })}
          />
          <NumberInput
            label="Parts Cost"
            value={actual.actual_parts_cost}
            onChange={(v) => setActual({ ...actual, actual_parts_cost: v })}
          />
          <NumberInput
            label="Paint Cost"
            value={actual.actual_paint_cost}
            onChange={(v) => setActual({ ...actual, actual_paint_cost: v })}
          />
          <NumberInput
            label="Misc Cost"
            value={actual.misc_cost}
            onChange={(v) => setActual({ ...actual, misc_cost: v })}
          />
        </div>

        <textarea
          value={actual.notes}
          onChange={(e) => setActual({ ...actual, notes: e.target.value })}
          placeholder="Actual repair notes..."
          className="mt-3 min-h-20 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
        />

        <button
          onClick={saveActualCosts}
          className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400"
        >
          <Save size={16} />
          Save Actual Costs
        </button>

        {comparison?.summary && (
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <SummaryCard
              label="Estimated"
              value={money(comparison.summary.estimated_total)}
            />
            <SummaryCard
              label="Actual"
              value={money(comparison.summary.actual_total)}
            />
            <SummaryCard
              label="Variance"
              value={money(comparison.summary.variance_amount)}
            />
            <SummaryCard
              label="Variance %"
              value={`${Number(comparison.summary.variance_percent || 0).toFixed(1)}%`}
              strong
            />
          </div>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <List title="Findings" items={findings} />
        <List title="Notes / Timeline" items={notes} />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-sm text-zinc-200">{value || "-"}</p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-xs uppercase text-zinc-500">{label}</p>
      <p className={`mt-2 text-lg font-bold ${strong ? "text-emerald-300" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="text-sm text-zinc-300">
      {label}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
      />
    </label>
  );
}

function List({ title, items }: { title: string; items: any[] }) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
      <h2 className="font-semibold text-white">{title}</h2>

      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-zinc-500">No records yet.</p>
        ) : (
          items.map((item: any) => (
            <div key={item.id} className="rounded-xl bg-zinc-950 p-3 text-sm">
              <p className="font-medium text-white">
                {item.component_name || item.note_type || "Record"}
              </p>
              <p className="mt-1 text-zinc-400">
                {item.description || item.note}
              </p>
              {item.cost ? (
                <p className="mt-2 text-xs font-medium text-emerald-400">
                  Cost: {money(item.cost)}
                </p>
              ) : null}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
