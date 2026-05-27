"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, Calculator, ClipboardList, Loader2, Search, Wrench } from "lucide-react";
import { api } from "@/lib/api";

function Stat({ title, value, icon: Icon }: any) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">{title}</p>
        <span className="rounded-lg bg-zinc-800 p-2 text-zinc-300"><Icon size={18} /></span>
      </div>
      <p className="mt-4 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

export default function TechnicianHomePage() {
  const [data, setData] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/technicians/dashboard"),
      api.get("/technicians/jobs"),
    ])
      .then(([dashboard, jobsData]) => {
        setData(dashboard);
        setJobs(jobsData || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>;
  }

  const stats = data?.stats || {};

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-emerald-400">Technician Workspace</p>
        <h1 className="text-2xl font-bold text-white">Today’s Repair Desk</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Your assigned jobs, inspections, estimates, VIN tools, repair guidance and maintenance updates.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Stat title="Assigned" value={stats.assigned_jobs || 0} icon={ClipboardList} />
        <Stat title="Open Jobs" value={stats.open_jobs || 0} icon={Wrench} />
        <Stat title="In Progress" value={stats.in_progress || 0} icon={Wrench} />
        <Stat title="Waiting Parts" value={stats.waiting_for_parts || 0} icon={Calculator} />
        <Stat title="Critical" value={stats.critical_jobs || 0} icon={AlertTriangle} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70">
          <div className="flex items-center justify-between border-b border-zinc-800 p-5">
            <div>
              <h2 className="font-semibold text-white">Latest Assigned Jobs</h2>
              <p className="text-sm text-zinc-500">Open the job card to start inspection or update progress.</p>
            </div>
            <Link href="/technician/jobs" className="text-sm font-medium text-emerald-400 hover:text-emerald-300">
              View all
            </Link>
          </div>

          <div className="divide-y divide-zinc-800">
            {jobs.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">No technician jobs assigned yet.</div>
            ) : (
              jobs.slice(0, 5).map((job) => (
                <Link key={job.id} href={`/technician/jobs/${job.id}`} className="block p-5 hover:bg-zinc-800/40">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{job.title}</p>
                      <p className="mt-1 text-sm text-zinc-400">
                        {job.vehicles?.make} {job.vehicles?.model} • {job.vehicles?.license_plate || job.vehicles?.vin}
                      </p>
                      <p className="mt-2 text-sm text-zinc-300">{job.reported_issue}</p>
                    </div>
                    <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">{job.status}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="space-y-3">
          <Link href="/technician/jobs" className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 hover:border-emerald-500/50">
            <ClipboardList className="text-emerald-400" />
            <div>
              <p className="font-semibold text-white">Open Assigned Jobs</p>
              <p className="text-sm text-zinc-500">Inspect and update vehicle work.</p>
            </div>
          </Link>

          <Link href="/technician/vin" className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 hover:border-emerald-500/50">
            <Search className="text-emerald-400" />
            <div>
              <p className="font-semibold text-white">Quick VIN Lookup</p>
              <p className="text-sm text-zinc-500">Decode or manually verify vehicle data.</p>
            </div>
          </Link>

          <Link href="/technician/estimates" className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 hover:border-emerald-500/50">
            <Calculator className="text-emerald-400" />
            <div>
              <p className="font-semibold text-white">Repair Estimates</p>
              <p className="text-sm text-zinc-500">Draft labour, parts and paint estimates.</p>
            </div>
          </Link>
        </section>
      </div>
    </div>
  );
}
