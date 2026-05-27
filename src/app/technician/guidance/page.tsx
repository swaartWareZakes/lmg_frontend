"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, ExternalLink, Loader2, Search, Wrench } from "lucide-react";
import { api } from "@/lib/api";
import OpenJobPicker from "@/components/technician/OpenJobPicker";

export default function TechnicianGuidancePage() {
  const [job, setJob] = useState<any>(null);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const vehicle = job?.vehicles;

  const loadGuidance = async (selectedJob: any) => {
    setJob(selectedJob);
    setLoading(true);

    try {
      const data = await api.get("/technicians/guidance");
      setProcedures(data || []);
    } catch (err) {
      console.error(err);
      setProcedures([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const make = vehicle?.make?.toLowerCase() || "";
    const model = vehicle?.model?.toLowerCase() || "";
    const q = search.toLowerCase();

    return procedures.filter((p) => {
      const blob = `${p.make || ""} ${p.model || ""} ${p.category || ""} ${p.procedure_text || ""} ${p.component || ""}`.toLowerCase();

      const vehicleMatch =
        !vehicle ||
        blob.includes(make) ||
        blob.includes(model) ||
        p.make?.toLowerCase() === make ||
        p.model?.toLowerCase() === model;

      const searchMatch = !q || blob.includes(q);

      return vehicleMatch && searchMatch;
    });
  }, [procedures, vehicle, search]);

  return (
    <div className="space-y-6 pb-20">
      <div>
        <p className="text-sm font-medium text-emerald-400">Repair Tool</p>
        <h1 className="text-3xl font-bold text-white">Repair Guidance</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Select an open job card, then view OEM-style procedures and labour references for that vehicle.
        </p>
      </div>

      <OpenJobPicker onJobSelected={loadGuidance} navigateOnSelect={false} />

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
              <BookOpen size={22} />
            </div>
            <div>
              <h2 className="font-semibold text-white">Selected Job Guidance</h2>
              <p className="text-sm text-zinc-400">
                {vehicle
                  ? `${vehicle.make || "-"} ${vehicle.model || ""} · ${vehicle.license_plate || vehicle.vin || "-"}`
                  : "No job selected"}
              </p>
            </div>
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

        <div className="relative mt-5">
          <Search className="absolute left-3 top-3 text-zinc-500" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search component, procedure, category..."
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3 pl-9 pr-4 text-sm text-white outline-none focus:border-emerald-500"
          />
        </div>
      </section>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {filtered.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/50 p-12 text-center text-zinc-500">
              No procedure records matched this selected job.
            </div>
          ) : (
            filtered.map((p) => (
              <article
                key={p.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
                    <Wrench size={20} />
                  </div>
                  <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                    {p.category || "Procedure"}
                  </span>
                </div>

                <h2 className="mt-4 font-semibold text-white">
                  {p.make || vehicle?.make || "Vehicle"} {p.model || vehicle?.model || ""}
                </h2>

                <p className="mt-3 line-clamp-5 text-sm leading-6 text-zinc-300">
                  {p.procedure_text || p.description || "No procedure text available."}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Mini label="Labour" value={`${p.labor_time_estimate || 0}h`} />
                  <Mini label="Source" value={p.source || "internal"} />
                </div>

                {p.external_reference && (
                  <p className="mt-4 text-xs text-zinc-500">
                    Ref: {p.external_reference}
                  </p>
                )}
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
      <p className="text-xs uppercase text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value || "-"}</p>
    </div>
  );
}
