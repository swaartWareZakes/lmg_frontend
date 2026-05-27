"use client";

import { useMemo, useState } from "react";
import { Car, Loader2, Save, Search, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import OpenJobPicker from "@/components/technician/OpenJobPicker";

export default function TechnicianVinPage() {
  const [job, setJob] = useState<any>(null);
  const [vin, setVin] = useState("");
  const [decoded, setDecoded] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const vehicle = job?.vehicles;

  const activeVin = useMemo(() => {
    return vin || vehicle?.vin || "";
  }, [vin, vehicle?.vin]);

  const decodeVin = async () => {
    if (!activeVin.trim()) {
      alert("Enter or select a VIN first.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/technicians/vin/decode", {
        vin: activeVin.trim(),
        job_id: job?.id || null,
        vehicle_id: vehicle?.id || null,
      });

      setDecoded(res);
    } catch (err: any) {
      alert(err?.message || "VIN decode failed.");
    } finally {
      setLoading(false);
    }
  };

  const saveDecoded = async () => {
    if (!decoded || !vehicle?.id) {
      alert("Decode a VIN linked to a job vehicle first.");
      return;
    }

    setSaving(true);
    try {
      await api.post("/technicians/vin/manual-save", {
        job_id: job?.id,
        vehicle_id: vehicle.id,
        vin: activeVin,
        decoded_data: decoded,
      });

      alert("Decoded VIN data saved to vehicle.");
    } catch (err: any) {
      alert(err?.message || "Failed to save VIN data.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <p className="text-sm font-medium text-emerald-400">Repair Tool</p>
        <h1 className="text-3xl font-bold text-white">Quick VIN Lookup</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Select an open job card, decode the VIN, then save normalized vehicle data back to the job vehicle.
        </p>
      </div>

      <OpenJobPicker
        onJobSelected={(selected) => {
          setJob(selected);
          setVin(selected?.vehicles?.vin || "");
          setDecoded(null);
        }}
        navigateOnSelect={false}
      />

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
            <Car size={22} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Selected Vehicle</h2>
            <p className="text-sm text-zinc-400">
              {vehicle
                ? `${vehicle.make || "-"} ${vehicle.model || ""} · ${vehicle.license_plate || vehicle.vin || "-"}`
                : "No job selected"}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <input
            value={activeVin}
            onChange={(e) => setVin(e.target.value.toUpperCase())}
            placeholder="Enter VIN"
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
          />

          <button
            onClick={decodeVin}
            disabled={loading}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
            Decode VIN
          </button>

          <button
            onClick={saveDecoded}
            disabled={saving || !decoded}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-semibold text-zinc-200 hover:border-emerald-500 disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Save to Vehicle
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-emerald-400" size={20} />
          <h2 className="text-lg font-semibold text-white">Decoded Result</h2>
        </div>

        {!decoded ? (
          <div className="mt-5 rounded-2xl border border-dashed border-zinc-700 p-10 text-center text-sm text-zinc-500">
            No decoded VIN data yet.
          </div>
        ) : (
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <Card label="Make" value={decoded.make || decoded.normalized_data?.make} />
            <Card label="Model" value={decoded.model || decoded.normalized_data?.model} />
            <Card label="Year" value={decoded.year || decoded.normalized_data?.year} />
            <Card label="Body Class" value={decoded.body_class || decoded.normalized_data?.body_class} />
            <Card label="Engine" value={decoded.engine || decoded.normalized_data?.engine} />
            <Card label="Fuel Type" value={decoded.fuel_type || decoded.normalized_data?.fuel_type} />
          </div>
        )}

        {decoded && (
          <pre className="mt-5 max-h-80 overflow-auto rounded-2xl bg-zinc-950 p-4 text-xs text-zinc-400">
            {JSON.stringify(decoded, null, 2)}
          </pre>
        )}
      </section>
    </div>
  );
}

function Card({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value || "-"}</p>
    </div>
  );
}
