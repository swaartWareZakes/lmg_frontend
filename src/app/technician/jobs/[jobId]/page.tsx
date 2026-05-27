"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  Bot,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  ImagePlus,
  Loader2,
  Lock,
  Play,
  Plus,
  Save,
  Send,
  Sparkles,
  Wrench,
} from "lucide-react";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import OpenJobPicker from "@/components/technician/OpenJobPicker";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const workflowSteps = [
  { key: "Assigned", label: "Assigned" },
  { key: "Inspection Started", label: "Inspection" },
  { key: "Diagnosis Done", label: "Diagnosis" },
  { key: "Estimate Drafted", label: "Estimate" },
  { key: "Awaiting Approval", label: "Approval" },
  { key: "Approved", label: "Approved" },
  { key: "Repair In Progress", label: "Repair" },
  { key: "Quality Check", label: "Quality" },
  { key: "Completed", label: "Completed" },
];

const statusOrder: Record<string, number> = {
  Assigned: 0,
  "Inspection Started": 1,
  "Diagnosis Done": 2,
  "Estimate Drafted": 3,
  "Awaiting Approval": 4,
  Approved: 5,
  "Repair In Progress": 6,
  "Waiting for Parts": 6,
  "Quality Check": 7,
  Completed: 8,
  Cancelled: 8,
};

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

const findingTypes = ["damage", "mechanical", "electrical", "service", "other"];
const severities = ["Low", "Medium", "High", "Critical"];
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

function money(value: any) {
  return `R ${Number(value || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function canInspect(status: string) {
  return [
    "Inspection Started",
    "Diagnosis Done",
    "Estimate Drafted",
    "Awaiting Approval",
    "Approved",
    "Repair In Progress",
    "Waiting for Parts",
    "Quality Check",
    "Completed",
  ].includes(status);
}

function canGenerateEstimate(status: string) {
  return ["Inspection Started", "Diagnosis Done"].includes(status);
}

function canEditEstimate(status: string) {
  return ["Estimate Drafted"].includes(status);
}

function canSubmitApproval(status: string) {
  return ["Estimate Drafted"].includes(status);
}

function canRepair(status: string) {
  return ["Approved", "Repair In Progress", "Waiting for Parts"].includes(status);
}

function canRecordActuals(status: string) {
  return ["Repair In Progress", "Waiting for Parts", "Quality Check"].includes(
    status
  );
}

function isReadonly(status: string) {
  return ["Awaiting Approval", "Completed"].includes(status);
}

export default function TechnicianGuidedJobPage() {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const job = data?.job;
  const vehicle = job?.vehicles;
  const findings = data?.findings || [];
  const notes = data?.notes || [];
  const status = job?.status || "Assigned";
  const latestEstimate = estimates?.[0];
  const estimateLines =
    latestEstimate?.technician_estimate_lines || latestEstimate?.lines || [];

  const progressIndex = statusOrder[status] ?? 0;
  const progressPercent = Math.round(
    (progressIndex / (workflowSteps.length - 1)) * 100
  );

  const nextAction = useMemo(() => {
    if (status === "Assigned") {
      return {
        label: "Start Inspection",
        icon: Play,
        action: () => updateStatus("Inspection Started"),
        tone: "amber",
      };
    }

    if (status === "Inspection Started") {
      return {
        label: photos.length ? "Generate AI Estimate" : "Upload Damage Photos",
        icon: photos.length ? Sparkles : Camera,
        action: photos.length
          ? () => generateAIEstimate()
          : () => {
              const input = document.getElementById("job-photo-input");
              input?.click();
            },
        tone: photos.length ? "purple" : "emerald",
      };
    }

    if (status === "Diagnosis Done") {
      return {
        label: "Generate AI Estimate",
        icon: Sparkles,
        action: () => generateAIEstimate(),
        tone: "purple",
      };
    }

    if (status === "Estimate Drafted") {
      return {
        label: "Submit for Approval",
        icon: Send,
        action: () => submitEstimate(),
        tone: "emerald",
      };
    }

    if (status === "Awaiting Approval") {
      return {
        label: "Waiting for Admin Approval",
        icon: Lock,
        action: () => null,
        tone: "locked",
      };
    }

    if (status === "Approved") {
      return {
        label: "Start Repair",
        icon: Wrench,
        action: () => updateStatus("Repair In Progress"),
        tone: "orange",
      };
    }

    if (status === "Repair In Progress" || status === "Waiting for Parts") {
      return {
        label: "Send to Quality Check",
        icon: ClipboardCheck,
        action: () => updateStatus("Quality Check"),
        tone: "cyan",
      };
    }

    if (status === "Quality Check") {
      return {
        label: "Complete Job",
        icon: CheckCircle2,
        action: () => updateStatus("Completed"),
        tone: "emerald",
      };
    }

    return {
      label: "Job Completed",
      icon: FileCheck2,
      action: () => null,
      tone: "locked",
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, photos.length, latestEstimate?.id]);

  const updateStatus = async (newStatus: string) => {
    await api.patch(`/technicians/jobs/${jobId}/status`, { status: newStatus });
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
    if (!photos.length) {
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
    if (!latestEstimate?.id) {
      alert("Generate an estimate first.");
      return;
    }

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

  const NextIcon = nextAction.icon;

  return (
    <div className="space-y-6 pb-20">
      <OpenJobPicker currentJobId={jobId} compact />

      <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/80 shadow-2xl">
        <div className="border-b border-zinc-800 bg-gradient-to-r from-emerald-500/10 via-zinc-900 to-purple-500/10 p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
                Guided Job Card
              </p>
              <h1 className="mt-2 text-3xl font-bold text-white">
                {job?.title}
              </h1>
              <p className="mt-1 text-sm text-zinc-400">
                {vehicle?.make} {vehicle?.model} ·{" "}
                {vehicle?.license_plate || vehicle?.vin || "No plate"} ·{" "}
                {job?.priority || "Medium"} priority
              </p>
            </div>

            <div className="flex flex-col gap-2 xl:items-end">
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">
                Current Status: {status}
              </span>

              <button
                onClick={nextAction.action}
                disabled={nextAction.tone === "locked" || generatingAI}
                className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  nextAction.tone === "purple"
                    ? "bg-purple-500 text-white hover:bg-purple-400"
                    : nextAction.tone === "amber"
                    ? "bg-amber-500 text-zinc-950 hover:bg-amber-400"
                    : nextAction.tone === "orange"
                    ? "bg-orange-500 text-white hover:bg-orange-400"
                    : nextAction.tone === "cyan"
                    ? "bg-cyan-500 text-zinc-950 hover:bg-cyan-400"
                    : nextAction.tone === "locked"
                    ? "border border-zinc-700 bg-zinc-800 text-zinc-400"
                    : "bg-emerald-500 text-white hover:bg-emerald-400"
                }`}
              >
                {generatingAI ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <NextIcon size={16} />
                )}
                {nextAction.label}
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between text-xs text-zinc-500">
              <span>Progress</span>
              <span>{progressPercent}%</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-purple-500 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="mt-4 grid gap-2 md:grid-cols-9">
              {workflowSteps.map((step, index) => {
                const done = index < progressIndex;
                const current = index === progressIndex;

                return (
                  <div
                    key={step.key}
                    className={`rounded-xl border p-3 text-center text-xs ${
                      done
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                        : current
                        ? "border-purple-500/50 bg-purple-500/10 text-purple-300"
                        : "border-zinc-800 bg-zinc-950 text-zinc-500"
                    }`}
                  >
                    {step.label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-5">
          <Info label="VIN" value={vehicle?.vin} />
          <Info label="Plate" value={vehicle?.license_plate} />
          <Info label="Mileage" value={job?.intake_mileage || vehicle?.current_mileage} />
          <Info
            label="Latest Estimate"
            value={latestEstimate ? money(latestEstimate.total_estimate) : "-"}
          />
          <Info
            label="Actual Cost"
            value={comparison?.summary ? money(comparison.summary.actual_total) : "-"}
          />
        </div>

        <div className="px-6 pb-6">
          <div className="rounded-2xl bg-zinc-950 p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Reported Issue
            </p>
            <p className="mt-2 text-sm text-zinc-200">{job?.reported_issue}</p>
          </div>
        </div>
      </section>

      {status === "Assigned" && (
        <StageCard
          icon={Play}
          title="Start with inspection"
          description="This job has been assigned. Start the inspection before uploading photos or generating estimates."
        />
      )}

      {canInspect(status) && (
        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <PhotosSection
            photos={photos}
            photoFile={photoFile}
            setPhotoFile={setPhotoFile}
            photoType={photoType}
            setPhotoType={setPhotoType}
            photoCaption={photoCaption}
            setPhotoCaption={setPhotoCaption}
            uploading={uploading}
            uploadPhoto={uploadPhoto}
            readonly={status === "Completed"}
          />

          <EstimateSection
            status={status}
            photos={photos}
            latestEstimate={latestEstimate}
            estimateLines={estimateLines}
            generatingAI={generatingAI}
            generateAIEstimate={generateAIEstimate}
            submitEstimate={submitEstimate}
          />
        </div>
      )}

      {canInspect(status) && !isReadonly(status) && (
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
            <h2 className="font-semibold text-white">Inspection Findings</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Use dropdowns first. Add short notes only when needed.
            </p>

            <div className="mt-4 space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <Select
                  value={finding.component_name}
                  options={damageAreas}
                  onChange={(v) =>
                    setFinding({ ...finding, component_name: v })
                  }
                />
                <Select
                  value={finding.finding_type}
                  options={findingTypes}
                  onChange={(v) =>
                    setFinding({ ...finding, finding_type: v })
                  }
                />
              </div>

              <textarea
                value={finding.description}
                onChange={(e) =>
                  setFinding({ ...finding, description: e.target.value })
                }
                placeholder="Short finding note..."
                className="min-h-24 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
              />

              <div className="grid gap-3 md:grid-cols-2">
                <Select
                  value={finding.severity}
                  options={severities}
                  onChange={(v) => setFinding({ ...finding, severity: v })}
                />
                <Select
                  value={finding.recommended_action}
                  options={actions}
                  onChange={(v) =>
                    setFinding({ ...finding, recommended_action: v })
                  }
                />
              </div>

              <button
                onClick={addFinding}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400"
              >
                <Plus size={16} />
                Add Finding
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
            <h2 className="font-semibold text-white">Job Note</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Add context that dropdowns/photos do not capture.
            </p>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional technician note..."
              className="mt-4 min-h-36 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
            />

            <button
              onClick={addNote}
              className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400"
            >
              <Save size={16} />
              Save Note
            </button>
          </section>
        </div>
      )}

      {status === "Awaiting Approval" && (
        <StageCard
          icon={Lock}
          title="Waiting for admin approval"
          description="The technician estimate is locked while admin reviews photos, estimate lines, and notes."
          tone="amber"
        />
      )}

      {status === "Approved" && (
        <StageCard
          icon={Wrench}
          title="Estimate approved"
          description="Start the repair when work begins. Actual costs become available during repair."
          tone="emerald"
        />
      )}

      {canRecordActuals(status) && (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="text-emerald-400" size={20} />
            <h2 className="font-semibold text-white">
              Actual Repair Costs
            </h2>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Capture actual spend only after approval and during repair.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-5">
            <NumberInput
              label="Labour Hours"
              value={actual.actual_labor_hours}
              onChange={(v) =>
                setActual({ ...actual, actual_labor_hours: v })
              }
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
            className="mt-3 min-h-20 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
          />

          <button
            onClick={saveActualCosts}
            className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400"
          >
            <Save size={16} />
            Save Actual Costs
          </button>
        </section>
      )}

      {(status === "Quality Check" || status === "Completed") && (
        <ComparisonSection comparison={comparison} />
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <HistoryList title="Findings" items={findings} />
        <HistoryList title="Notes / Timeline" items={notes} />
      </div>
    </div>
  );
}

function PhotosSection(props: any) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
      <div className="flex items-center gap-2">
        <Camera className="text-emerald-400" size={20} />
        <h2 className="font-semibold text-white">Photos & Evidence</h2>
      </div>

      {!props.readonly && (
        <div className="mt-4 space-y-3">
          <input
            id="job-photo-input"
            type="file"
            accept="image/*"
            onChange={(e) => props.setPhotoFile(e.target.files?.[0] || null)}
            className="w-full cursor-pointer rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-300"
          />

          <div className="grid gap-3 md:grid-cols-2">
            <Select
              value={props.photoType}
              options={photoTypes}
              onChange={props.setPhotoType}
            />

            <input
              value={props.photoCaption}
              onChange={(e) => props.setPhotoCaption(e.target.value)}
              placeholder="Caption"
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
            />
          </div>

          <button
            onClick={props.uploadPhoto}
            disabled={props.uploading}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400 disabled:opacity-50"
          >
            {props.uploading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <ImagePlus size={16} />
            )}
            Upload Photo
          </button>
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3">
        {props.photos.length === 0 ? (
          <div className="col-span-2 rounded-xl border border-dashed border-zinc-700 p-8 text-center text-sm text-zinc-500">
            No photos uploaded yet.
          </div>
        ) : (
          props.photos.map((photo: any) => (
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
  );
}

function EstimateSection(props: any) {
  const hasEstimate = Boolean(props.latestEstimate);
  const status = props.status;

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="text-emerald-400" size={20} />
            <h2 className="font-semibold text-white">AI Estimate Review</h2>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            AI creates the draft. Technician reviews that same estimate before approval.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {canGenerateEstimate(status) && (
            <button
              onClick={props.generateAIEstimate}
              disabled={props.generatingAI || props.photos.length === 0}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-purple-500 px-4 py-2 text-sm font-medium text-white hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {props.generatingAI ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Sparkles size={16} />
              )}
              Generate AI Estimate
            </button>
          )}

          {canSubmitApproval(status) && hasEstimate && (
            <button
              onClick={props.submitEstimate}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400"
            >
              <Send size={16} />
              Submit for Approval
            </button>
          )}
        </div>
      </div>

      {!hasEstimate ? (
        <div className="mt-6 rounded-xl border border-dashed border-zinc-700 p-10 text-center">
          <Bot className="mx-auto text-zinc-600" size={36} />
          <p className="mt-3 font-medium text-white">No estimate yet</p>
          <p className="mt-1 text-sm text-zinc-500">
            Upload photos and generate the AI estimate from this job card.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <SummaryCard label="Parts" value={money(props.latestEstimate.total_parts)} />
            <SummaryCard label="Labour" value={money(props.latestEstimate.total_labor)} />
            <SummaryCard label="Paint" value={money(props.latestEstimate.total_paint)} />
            <SummaryCard label="Total" value={money(props.latestEstimate.total_estimate)} strong />
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
                {props.estimateLines.map((line: any) => (
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
              {props.latestEstimate.status}
            </span>
          </p>

          {status === "Awaiting Approval" && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
              Estimate submitted. Editing is locked until admin approves or requests revision.
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function ComparisonSection({ comparison }: { comparison: any }) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
      <div className="flex items-center gap-2">
        <FileCheck2 className="text-emerald-400" size={20} />
        <h2 className="font-semibold text-white">Final Cost Comparison</h2>
      </div>

      {!comparison?.summary ? (
        <p className="mt-4 text-sm text-zinc-500">
          No actual cost comparison available yet.
        </p>
      ) : (
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <SummaryCard label="Estimated" value={money(comparison.summary.estimated_total)} />
          <SummaryCard label="Actual" value={money(comparison.summary.actual_total)} />
          <SummaryCard label="Variance" value={money(comparison.summary.variance_amount)} />
          <SummaryCard
            label="Variance %"
            value={`${Number(comparison.summary.variance_percent || 0).toFixed(1)}%`}
            strong
          />
        </div>
      )}
    </section>
  );
}

function StageCard({
  icon: Icon,
  title,
  description,
  tone = "default",
}: {
  icon: any;
  title: string;
  description: string;
  tone?: "default" | "amber" | "emerald";
}) {
  return (
    <section
      className={`rounded-2xl border p-5 ${
        tone === "amber"
          ? "border-amber-500/30 bg-amber-500/10"
          : tone === "emerald"
          ? "border-emerald-500/30 bg-emerald-500/10"
          : "border-zinc-800 bg-zinc-900/70"
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-1 text-emerald-400" size={22} />
        <div>
          <h2 className="font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm text-zinc-400">{description}</p>
        </div>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 truncate text-sm font-medium text-zinc-100">
        {value || "-"}
      </p>
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
      <p
        className={`mt-2 text-lg font-bold ${
          strong ? "text-emerald-300" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Select({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="cursor-pointer rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option.replace("_", " ")}
        </option>
      ))}
    </select>
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
        className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
      />
    </label>
  );
}

function HistoryList({ title, items }: { title: string; items: any[] }) {
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
