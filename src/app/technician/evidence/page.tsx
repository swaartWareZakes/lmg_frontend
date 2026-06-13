"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Loader2,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import DamageIntakeForm from "@/components/evidence/DamageIntakeForm";
import EvidencePackagePanel from "@/components/evidence/EvidencePackagePanel";

const steps = [
  {
    id: 1,
    title: "Open Job",
    short: "Job",
    description: "Select the active technician job card.",
  },
  {
    id: 2,
    title: "Damage Intake",
    short: "Intake",
    description: "Capture what the technician sees before AI analysis.",
  },
  {
    id: 3,
    title: "Evidence Capture",
    short: "Evidence",
    description: "Upload required photos, video or voice notes.",
  },
  {
    id: 4,
    title: "Review & Estimate",
    short: "Review",
    description: "Check readiness before generating the LMG LMG estimate.",
  },
];

function statusTone(status?: string) {
  if (status === "Completed") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  if (status === "Awaiting Approval") return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  if (status === "Approved") return "border-cyan-500/30 bg-cyan-500/10 text-cyan-300";
  if (status === "Repair In Progress" || status === "Waiting for Parts") return "border-orange-500/30 bg-orange-500/10 text-orange-300";
  return "border-zinc-700 bg-zinc-900 text-zinc-300";
}

export default function TechnicianEvidencePage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [packageData, setPackageData] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedJobId),
    [jobs, selectedJobId]
  );

  const vehicle = selectedJob?.vehicles || {};

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await api.get("/technicians/jobs");
      const openJobs = (data || []).filter(
        (job: any) => !["Completed", "Cancelled"].includes(job.status)
      );

      setJobs(openJobs);

      if (!selectedJobId && openJobs.length) {
        setSelectedJobId(openJobs[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPackage = async (jobId: string) => {
    if (!jobId) return;

    try {
      const data = await api.get(`/technicians/jobs/${jobId}/evidence-package`);
      setPackageData(data);
    } catch {
      setPackageData(null);
    }
  };

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedJobId) loadPackage(selectedJobId);
  }, [selectedJobId, refreshKey]);

  const readiness = Number(
    packageData?.damage_intake?.ai_readiness_score ||
      packageData?.job?.evidence_completeness_score ||
      0
  );

  const mediaCount = packageData?.media?.length || 0;
  const requiredCount = packageData?.damage_intake?.required_evidence?.length || 0;
  const missingCount = packageData?.damage_intake?.missing_evidence?.length || 0;

  const canGoNext = selectedJobId && step < 4;

  const goNext = async () => {
    if (!canGoNext) return;
    setRefreshKey((value) => value + 1);
    setStep((value) => Math.min(4, value + 1));
  };

  const goBack = () => {
    setStep((value) => Math.max(1, value - 1));
  };

  const refreshEvidence = async () => {
    setRefreshKey((value) => value + 1);
    if (selectedJobId) await loadPackage(selectedJobId);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[1300px] flex-col gap-6 pb-24">
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#10131a] sm:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_34%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_32%)]" />

        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-brand-primary">
              LMG Evidence Wizard
            </p>
            <h1 className="mt-2 text-3xl font-black text-zinc-950 dark:text-white">
              Guided Damage Intake
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              A technician-friendly step-by-step flow for job selection, damage observations,
              required photos, video evidence and LMG estimate readiness.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Mini title="Readiness" value={`${readiness}%`} />
            <Mini title="Evidence" value={mediaCount} />
            <Mini title="Missing" value={missingCount || 0} warn={missingCount > 0} />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-card-dark">
        <div className="grid gap-3 md:grid-cols-4">
          {steps.map((item) => {
            const active = step === item.id;
            const done = step > item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (selectedJobId || item.id === 1) setStep(item.id);
                }}
                className={[
                  "rounded-2xl border p-4 text-left transition",
                  active
                    ? "border-brand-primary bg-brand-primary/10"
                    : done
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/40",
                ].join(" ")}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span
                    className={[
                      "flex h-8 w-8 items-center justify-center rounded-full text-sm font-black",
                      active || done
                        ? "bg-brand-primary text-white"
                        : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800",
                    ].join(" ")}
                  >
                    {done ? <CheckCircle2 size={17} /> : item.id}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    {item.short}
                  </span>
                </div>
                <h3 className="font-black text-zinc-950 dark:text-white">{item.title}</h3>
                <p className="mt-1 text-xs leading-5 text-zinc-500">{item.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      {jobs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-200 p-12 text-center text-zinc-500 dark:border-zinc-800">
          <ClipboardCheck className="mx-auto mb-3" />
          No open technician jobs available.
        </div>
      ) : (
        <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            {step === 1 && (
              <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-card-dark">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-2xl bg-brand-primary/10 p-3 text-brand-primary">
                    <ClipboardList size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-zinc-950 dark:text-white">
                      Select Job Card
                    </h2>
                    <p className="text-sm text-zinc-500">
                      Start by choosing the open job this evidence package belongs to.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3">
                  {jobs.map((job) => {
                    const v = job.vehicles || {};
                    const active = job.id === selectedJobId;

                    return (
                      <button
                        key={job.id}
                        onClick={() => {
                          setSelectedJobId(job.id);
                          setRefreshKey((value) => value + 1);
                        }}
                        className={[
                          "rounded-2xl border p-4 text-left transition hover:border-brand-primary/50",
                          active
                            ? "border-brand-primary bg-brand-primary/10"
                            : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/40",
                        ].join(" ")}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="font-black text-zinc-950 dark:text-white">
                              {job.title || "Untitled job"}
                            </h3>
                            <p className="mt-1 text-sm text-zinc-500">
                              {v.make || "-"} {v.model || ""} · {v.license_plate || v.vin || "No plate"}
                            </p>
                            <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                              {job.reported_issue || "No issue captured."}
                            </p>
                          </div>

                          <span className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${statusTone(job.status)}`}>
                            {job.status || "Assigned"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && selectedJobId && (
              <DamageIntakeForm
                key={`intake-${selectedJobId}`}
                jobId={selectedJobId}
                onSaved={refreshEvidence}
              />
            )}

            {step === 3 && selectedJobId && (
              <EvidencePackagePanel
                key={`evidence-${selectedJobId}-${refreshKey}`}
                jobId={selectedJobId}
              />
            )}

            {step === 4 && selectedJobId && (
              <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-card-dark">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-2xl bg-purple-500/10 p-3 text-purple-400">
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-zinc-950 dark:text-white">
                      Review Evidence Package
                    </h2>
                    <p className="text-sm text-zinc-500">
                      Confirm the evidence is strong enough before generating the LMG estimate.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <ReviewCard
                    icon={<ClipboardCheck size={20} />}
                    title="Damage intake"
                    value={packageData?.damage_intake ? "Captured" : "Missing"}
                    good={Boolean(packageData?.damage_intake)}
                  />
                  <ReviewCard
                    icon={<Camera size={20} />}
                    title="Evidence uploaded"
                    value={`${mediaCount} file${mediaCount === 1 ? "" : "s"}`}
                    good={mediaCount > 0}
                  />
                  <ReviewCard
                    icon={<ShieldAlert size={20} />}
                    title="AI readiness"
                    value={`${readiness}%`}
                    good={readiness >= 60}
                  />
                </div>

                <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950/40">
                  <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-500">
                    <span>Evidence readiness</span>
                    <span>{readiness}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-brand-primary"
                      style={{ width: `${Math.min(100, Math.max(0, readiness))}%` }}
                    />
                  </div>

                  <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    Required slots: <strong>{requiredCount}</strong> · Uploaded evidence:{" "}
                    <strong>{mediaCount}</strong> · Missing: <strong>{missingCount || 0}</strong>
                  </p>
                </div>

                {readiness < 60 && (
                  <div className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-700 dark:text-amber-300">
                    This job can still be estimated, but accuracy will improve if the technician uploads
                    the required wide, corner and close-up photos first.
                  </div>
                )}

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Link
                    href="/technician/ai-estimates"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-500 px-5 py-3 text-sm font-black text-white hover:bg-purple-400"
                  >
                    <Bot size={17} />
                    Go to LMG Estimate
                  </Link>

                  <Link
                    href={`/technician/jobs/${selectedJobId}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-5 py-3 text-sm font-black text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
                  >
                    Open Job Card
                  </Link>
                </div>
              </div>
            )}
          </div>

          <aside className="h-fit rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-card-dark">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-primary">
              Current Job
            </p>

            {!selectedJob ? (
              <div className="mt-5 rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-sm text-zinc-500 dark:border-zinc-800">
                Select a job to continue.
              </div>
            ) : (
              <>
                <h2 className="mt-3 text-lg font-black text-zinc-950 dark:text-white">
                  {selectedJob.title}
                </h2>
                <p className="mt-2 text-sm text-zinc-500">
                  {vehicle.make} {vehicle.model} · {vehicle.license_plate || vehicle.vin || "No plate"}
                </p>

                <div className="mt-4 space-y-3">
                  <SideMini label="Status" value={selectedJob.status || "Assigned"} />
                  <SideMini label="Priority" value={selectedJob.priority || "-"} />
                  <SideMini label="Mileage" value={selectedJob.intake_mileage || vehicle.current_mileage || "-"} />
                  <SideMini label="Evidence files" value={mediaCount} />
                </div>

                <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Technician Reminder
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    Capture the story first, then upload evidence. The LMG estimate should only run after the package is clear.
                  </p>
                </div>
              </>
            )}
          </aside>
        </section>
      )}

      <section className="sticky bottom-3 z-20 rounded-2xl border border-zinc-200 bg-white/90 p-3 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={goBack}
            disabled={step === 1}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-bold text-zinc-600 disabled:opacity-40 dark:border-zinc-800 dark:text-zinc-300"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="hidden text-center text-sm text-zinc-500 sm:block">
            Step {step} of {steps.length}: <strong>{steps[step - 1]?.title}</strong>
          </div>

          {step < 4 ? (
            <button
              onClick={goNext}
              disabled={!canGoNext}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-40"
            >
              Next
              <ArrowRight size={16} />
            </button>
          ) : (
            <Link
              href="/technician/ai-estimates"
              className="inline-flex items-center gap-2 rounded-xl bg-purple-500 px-4 py-2 text-sm font-bold text-white hover:bg-purple-400"
            >
              Generate Estimate
              <Bot size={16} />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

function Mini({ title, value, warn = false }: { title: string; value: any; warn?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{title}</p>
      <p className={`mt-1 text-lg font-black ${warn ? "text-amber-400" : "text-white"}`}>{value}</p>
    </div>
  );
}

function SideMini({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-2 truncate font-black text-zinc-950 dark:text-white">{value || "-"}</p>
    </div>
  );
}

function ReviewCard({
  icon,
  title,
  value,
  good,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  good: boolean;
}) {
  return (
    <div
      className={[
        "rounded-2xl border p-4",
        good
          ? "border-emerald-500/30 bg-emerald-500/10"
          : "border-amber-500/30 bg-amber-500/10",
      ].join(" ")}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className={good ? "text-emerald-500" : "text-amber-500"}>{icon}</div>
        {good ? (
          <CheckCircle2 size={18} className="text-emerald-500" />
        ) : (
          <ShieldAlert size={18} className="text-amber-500" />
        )}
      </div>
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{title}</p>
      <p className="mt-2 text-lg font-black text-zinc-950 dark:text-white">{value}</p>
    </div>
  );
}
