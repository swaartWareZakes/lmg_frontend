"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  Car,
  ClipboardList,
  Loader2,
  Plus,
  Save,
  Search,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import clsx from "clsx";

type NewJobForm = {
  vehicle_id: string;
  title: string;
  reported_issue: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  intake_mileage: number | "";
  intake_notes: string;
};

const emptyJobForm: NewJobForm = {
  vehicle_id: "",
  title: "",
  reported_issue: "",
  priority: "Medium",
  intake_mileage: "",
  intake_notes: "",
};

export default function TechnicianJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [newJob, setNewJob] = useState<NewJobForm>(emptyJobForm);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobsData, vehiclesData] = await Promise.all([
        api.get("/technicians/jobs"),
        api.get("/vehicles/"),
      ]);

      setJobs(jobsData || []);
      setVehicles(vehiclesData || []);

      if (vehiclesData?.length && !newJob.vehicle_id) {
        setNewJob((prev) => ({ ...prev, vehicle_id: vehiclesData[0].id }));
      }
    } catch (err) {
      console.error("Failed to load technician jobs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const vehicleText = `${job.vehicles?.make || ""} ${job.vehicles?.model || ""} ${job.vehicles?.license_plate || ""} ${job.vehicles?.vin || ""}`;
      const searchBlob = `${job.title} ${job.reported_issue} ${vehicleText}`.toLowerCase();

      const matchesSearch = searchBlob.includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || job.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, search, statusFilter]);

  const createJob = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newJob.vehicle_id || !newJob.title || !newJob.reported_issue) {
      alert("Please select a vehicle and complete the title and reported issue.");
      return;
    }

    setCreating(true);

    try {
      const payload = {
        vehicle_id: newJob.vehicle_id,
        title: newJob.title,
        reported_issue: newJob.reported_issue,
        priority: newJob.priority,
        intake_mileage:
          newJob.intake_mileage === "" ? null : Number(newJob.intake_mileage),
        intake_notes: newJob.intake_notes || null,
      };

      await api.post("/technicians/jobs", payload);

      setIsCreateOpen(false);
      setNewJob({
        ...emptyJobForm,
        vehicle_id: vehicles[0]?.id || "",
      });

      await fetchData();
    } catch (err: any) {
      alert(err?.message || "Failed to create technician job.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" />
      </div>
    );
  }

  const statusOptions = [
    "All",
    "Assigned",
    "Inspection Started",
    "Diagnosis Done",
    "Estimate Drafted",
    "Awaiting Approval",
    "Approved",
    "Repair In Progress",
    "Waiting for Parts",
    "Quality Check",
    "Completed",
    "Cancelled",
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-400">
            Technician Operations
          </p>
          <h1 className="text-2xl font-bold text-white">Assigned Jobs</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Create, inspect, estimate, update and complete technician jobs.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400"
        >
          <Plus size={16} />
          Create Job
        </button>
      </div>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-2.5 text-zinc-500"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job, issue, plate, VIN, make or model..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
          >
            {statusOptions.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>
      </section>

      <div className="grid gap-4">
        {filteredJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/50 p-12 text-center">
            <ClipboardList className="mx-auto text-zinc-600" size={34} />
            <h2 className="mt-4 font-semibold text-white">
              No technician jobs found
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Create the first job from a vehicle intake or repair request.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400"
            >
              <Plus size={16} />
              Create Job
            </button>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <Link
              key={job.id}
              href={`/technician/jobs/${job.id}`}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 transition hover:border-emerald-500/50 hover:bg-zinc-900"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-semibold text-white">
                      {job.title}
                    </p>
                    <span
                      className={clsx(
                        "rounded-full px-2.5 py-1 text-xs font-medium",
                        job.priority === "Critical"
                          ? "bg-red-500/15 text-red-300"
                          : job.priority === "High"
                          ? "bg-amber-500/15 text-amber-300"
                          : "bg-zinc-800 text-zinc-300"
                      )}
                    >
                      {job.priority}
                    </span>
                  </div>

                  <p className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
                    <Car size={15} />
                    {job.vehicles?.make} {job.vehicles?.model} •{" "}
                    {job.vehicles?.license_plate || job.vehicles?.vin}
                  </p>

                  <p className="mt-3 max-w-3xl text-sm text-zinc-300">
                    {job.reported_issue}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-zinc-500">
                    <span>VIN: {job.vehicles?.vin || "-"}</span>
                    <span>
                      Mileage:{" "}
                      {job.intake_mileage ||
                        job.vehicles?.current_mileage ||
                        "-"}
                    </span>
                    <span>
                      Created:{" "}
                      {job.created_at
                        ? new Date(job.created_at).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
                  <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                    {job.status}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-zinc-500">
                    <CalendarClock size={13} />
                    Job card
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-800 bg-[#111318] shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 p-5">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Create Technician Job
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Create a real Supabase-backed technician job from a vehicle.
                </p>
              </div>

              <button
                onClick={() => setIsCreateOpen(false)}
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={createJob} className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-300">
                  Vehicle
                </label>
                <select
                  required
                  value={newJob.vehicle_id}
                  onChange={(e) =>
                    setNewJob({ ...newJob, vehicle_id: e.target.value })
                  }
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                >
                  {vehicles.length === 0 && (
                    <option value="">No vehicles available</option>
                  )}
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.license_plate || vehicle.vin} - {vehicle.make}{" "}
                      {vehicle.model} ({vehicle.year})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-300">
                  Job Title
                </label>
                <input
                  required
                  value={newJob.title}
                  onChange={(e) =>
                    setNewJob({ ...newJob, title: e.target.value })
                  }
                  placeholder="e.g. Front bumper and headlamp inspection"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-300">
                  Reported Issue
                </label>
                <textarea
                  required
                  value={newJob.reported_issue}
                  onChange={(e) =>
                    setNewJob({ ...newJob, reported_issue: e.target.value })
                  }
                  placeholder="Describe the customer/fleet reported issue..."
                  className="min-h-28 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-300">
                    Priority
                  </label>
                  <select
                    value={newJob.priority}
                    onChange={(e) =>
                      setNewJob({
                        ...newJob,
                        priority: e.target.value as NewJobForm["priority"],
                      })
                    }
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-300">
                    Intake Mileage
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newJob.intake_mileage}
                    onChange={(e) =>
                      setNewJob({
                        ...newJob,
                        intake_mileage:
                          e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    placeholder="e.g. 84600"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-300">
                  Intake Notes
                </label>
                <textarea
                  value={newJob.intake_notes}
                  onChange={(e) =>
                    setNewJob({ ...newJob, intake_notes: e.target.value })
                  }
                  placeholder="Optional notes from intake desk, driver, fleet manager or workshop..."
                  className="min-h-20 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <AlertTriangle size={14} />
                  Job will be assigned to the logged-in technician by default.
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={creating}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400 disabled:opacity-60"
                  >
                    {creating ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    {creating ? "Creating..." : "Create Job"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
