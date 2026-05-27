"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Loader2,
  RotateCcw,
  Stethoscope,
} from "lucide-react";
import { api } from "@/lib/api";
import OpenJobPicker from "@/components/technician/OpenJobPicker";

export default function TechnicianDiagnosticsPage() {
  const [job, setJob] = useState<any>(null);
  const [symptom, setSymptom] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const vehicle = job?.vehicles;

  const runDiagnostic = async (nextHistory: string[]) => {
    if (!job?.id || !vehicle?.id) {
      alert("Select an open job first.");
      return;
    }

    if (!symptom.trim()) {
      alert("Enter a symptom or DTC code first.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/oem/diagnostics", {
        job_id: job.id,
        vehicle_id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        symptom,
        history: nextHistory,
      });

      setCurrentStep(res);
      setHistory(nextHistory);
    } catch (err: any) {
      alert(err?.message || "Diagnostic failed.");
    } finally {
      setLoading(false);
    }
  };

  const startDiagnostic = () => {
    setHistory([]);
    setCurrentStep(null);
    runDiagnostic([]);
  };

  const failedStep = () => {
    const nextHistory = [
      ...history,
      `Tried: ${currentStep?.step_title}. Result: Did not fix issue.`,
    ];
    runDiagnostic(nextHistory);
  };

  const markFixed = async () => {
    if (job?.id) {
      await api.post(`/technicians/jobs/${job.id}/notes`, {
        note_type: "diagnostic",
        note: `Diagnostic completed. Symptom: ${symptom}. Final step: ${currentStep?.step_title || "Resolved"}`,
      }).catch(() => null);
    }

    alert("Diagnostic marked as resolved.");
    setHistory([]);
    setCurrentStep(null);
    setSymptom("");
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <p className="text-sm font-medium text-emerald-400">Repair Tool</p>
        <h1 className="text-3xl font-bold text-white">Diagnostics Assist</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Select an open job card, then run guided AI diagnostics using that job’s vehicle context.
        </p>
      </div>

      <OpenJobPicker
        onJobSelected={(selected) => {
          setJob(selected);
          setHistory([]);
          setCurrentStep(null);
        }}
        navigateOnSelect={false}
      />

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Stethoscope className="text-emerald-400" size={22} />
              <h2 className="font-semibold text-white">Selected Job Diagnostic</h2>
            </div>
            <p className="mt-1 text-sm text-zinc-400">
              {vehicle
                ? `${vehicle.make || "-"} ${vehicle.model || ""} · ${vehicle.license_plate || vehicle.vin || "-"}`
                : "No job selected"}
            </p>
          </div>

          {job?.id && (
            <Link
              href={`/technician/jobs/${job.id}`}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm font-semibold text-zinc-200 hover:border-emerald-500"
            >
              <ExternalLink size={16} />
              Open Full Job Card
            </Link>
          )}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
            placeholder="Enter symptom or code, e.g. P0303 engine misfire"
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
          />

          <button
            onClick={startDiagnostic}
            disabled={loading || !job || !symptom}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && history.length === 0 ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Stethoscope size={16} />
            )}
            Start Diagnostic
          </button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-4">
          {history.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5"
            >
              <div className="flex gap-3">
                <CheckCircle2 className="mt-1 text-emerald-400" size={20} />
                <div>
                  <h3 className="font-semibold text-white">
                    Step {index + 1} completed
                  </h3>
                  <p className="mt-1 text-sm text-zinc-300">{item}</p>
                </div>
              </div>
            </div>
          ))}

          {loading && history.length > 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-800 p-10 text-center text-emerald-400">
              <Loader2 className="mx-auto animate-spin" size={32} />
            </div>
          )}

          {currentStep && !loading && (
            <div className="rounded-3xl border-2 border-emerald-500 bg-zinc-900/80 p-6">
              <div className="flex gap-4">
                <ArrowRight className="mt-1 text-emerald-400" size={22} />
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                    Current Step
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-white">
                    Step {history.length + 1}: {currentStep.step_title}
                  </h3>

                  <p className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm leading-6 text-zinc-300">
                    {currentStep.instruction}
                  </p>

                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300">
                    <AlertCircle size={14} />
                    Suspected: {currentStep.suspected_component}
                  </div>

                  <div className="mt-6 grid gap-3 md:grid-cols-2">
                    <button
                      onClick={markFixed}
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-400"
                    >
                      <CheckCircle2 size={18} />
                      Solved Issue
                    </button>

                    <button
                      onClick={failedStep}
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm font-semibold text-zinc-200 hover:border-emerald-500"
                    >
                      <RotateCcw size={18} />
                      Didn't Work, Next Step
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!currentStep && !loading && history.length === 0 && (
            <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/50 p-14 text-center text-zinc-500">
              Select a job and enter a symptom to generate a diagnostic path.
            </div>
          )}
        </section>

        <aside className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 h-fit">
          <h3 className="font-semibold text-white">Diagnostic Session Rules</h3>
          <div className="mt-4 space-y-3 text-sm text-zinc-400">
            <p>This page does not replace the job card.</p>
            <p>Resolved diagnostic notes are saved back to the selected job timeline.</p>
            <p>Actual costs and completion still happen inside the guided job card.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
