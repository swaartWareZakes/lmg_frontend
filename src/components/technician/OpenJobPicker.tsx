"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ClipboardList } from "lucide-react";

type OpenJobPickerProps = {
  currentJobId?: string;
  onJobSelected?: (job: any) => void;
  compact?: boolean;
  navigateOnSelect?: boolean;
};

const closedStatuses = ["Completed", "Cancelled"];

export default function OpenJobPicker({
  currentJobId,
  onJobSelected,
  compact = false,
  navigateOnSelect = true,
}: OpenJobPickerProps) {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState(currentJobId || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelectedId(currentJobId || "");
  }, [currentJobId]);

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      try {
        const res = await api.get("/technicians/jobs");
        const list = Array.isArray(res) ? res : res?.jobs || [];
        const openJobs = list.filter(
          (job: any) => !closedStatuses.includes(job.status)
        );

        setJobs(openJobs);

        const initial =
          openJobs.find((job: any) => job.id === currentJobId) || openJobs[0];

        if (initial) {
          setSelectedId(initial.id);
          onJobSelected?.(initial);
        }
      } catch (err) {
        console.error("Failed to load open technician jobs", err);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedId),
    [jobs, selectedId]
  );

  const handleChange = (id: string) => {
    setSelectedId(id);
    const job = jobs.find((item) => item.id === id);

    if (job) {
      onJobSelected?.(job);

      if (navigateOnSelect) {
        router.push(`/technician/jobs/${job.id}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 text-sm text-zinc-400">
        Loading open jobs...
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 text-sm text-zinc-400">
        No open technician jobs available.
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400">
            <ClipboardList size={18} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Open Job Card
            </p>
            <p className="text-sm text-zinc-300">
              Select the active job this tool should use.
            </p>
          </div>
        </div>

        <select
          value={selectedId}
          onChange={(e) => handleChange(e.target.value)}
          className="min-w-[320px] cursor-pointer rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
        >
          {jobs.map((job) => {
            const vehicle = job.vehicles || {};
            return (
              <option key={job.id} value={job.id}>
                {vehicle.make || "Vehicle"} {vehicle.model || ""} ·{" "}
                {vehicle.license_plate || vehicle.vin || "No plate"} ·{" "}
                {job.status}
              </option>
            );
          })}
        </select>
      </div>

      {!compact && selectedJob && (
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <Mini label="Status" value={selectedJob.status} />
          <Mini
            label="Vehicle"
            value={`${selectedJob.vehicles?.make || "-"} ${
              selectedJob.vehicles?.model || ""
            }`}
          />
          <Mini
            label="Plate"
            value={selectedJob.vehicles?.license_plate || "-"}
          />
          <Mini label="VIN" value={selectedJob.vehicles?.vin || "-"} />
        </div>
      )}
    </section>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
      <p className="text-xs uppercase text-zinc-500">{label}</p>
      <p className="mt-1 truncate text-sm font-medium text-white">{value}</p>
    </div>
  );
}
