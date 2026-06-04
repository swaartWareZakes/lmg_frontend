"use client";

import { useEffect, useState } from "react";
import { Database, Loader2, Plus, Search, X } from "lucide-react";
import { api } from "@/lib/api";

const money = (value: any) =>
  `R ${Number(value || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const emptyEntry = {
  make: "",
  model: "",
  year_from: 2015,
  year_to: 2026,
  damage_area: "front",
  component_category: "Body",
  component_name: "",
  operation: "Replace + Paint",
  severity: "Medium",
  parts_low: 0,
  parts_typical: 0,
  parts_high: 0,
  labour_hours_low: 0,
  labour_hours_typical: 0,
  labour_hours_high: 0,
  labour_rate: 450,
  paint_low: 0,
  paint_typical: 0,
  paint_high: 0,
  source_type: "admin_benchmark",
  source_notes: "",
  active: true,
};

export default function AdminPricingMatrixPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [components, setComponents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [damageArea, setDamageArea] = useState("");
  const [entry, setEntry] = useState<any>(emptyEntry);

  const fetchRows = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("component_name", search);
      if (damageArea) params.set("damage_area", damageArea);

      const qs = params.toString();
      const [matrix, catalog] = await Promise.all([
        api.get(`/technicians/pricing/matrix${qs ? `?${qs}` : ""}`),
        api.get("/technicians/pricing/component-catalog"),
      ]);

      setRows(matrix || []);
      setComponents(catalog || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const createEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/technicians/pricing/matrix", entry);
      setEntry(emptyEntry);
      setModalOpen(false);
      await fetchRows();
    } catch (err: any) {
      alert(err?.message || "Failed to create pricing entry.");
    } finally {
      setSaving(false);
    }
  };

  const useComponent = (name: string) => {
    const component = components.find((c) => c.component_name === name);
    setEntry({
      ...entry,
      component_name: name,
      component_category: component?.component_category || entry.component_category,
      damage_area: component?.damage_area || entry.damage_area,
      component_catalog_id: component?.id || null,
    });
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-brand-primary">LMG Pricing</p>
          <h1 className="mt-1 text-3xl font-black text-zinc-950 dark:text-white">Repair Pricing Matrix</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Manage internal parts, labour and paint benchmark ranges used by LMG estimates.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Component..."
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-brand-primary dark:border-zinc-800 dark:bg-card-dark sm:w-72"
            />
          </div>

          <select
            value={damageArea}
            onChange={(e) => setDamageArea(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm dark:border-zinc-800 dark:bg-card-dark"
          >
            <option value="">All areas</option>
            <option value="front">Front</option>
            <option value="rear">Rear</option>
            <option value="side">Side</option>
            <option value="suspension">Suspension</option>
          </select>

          <button onClick={fetchRows} className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-bold dark:border-zinc-800">
            Search
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-500"
          >
            <Plus size={16} /> Add Benchmark
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-card-dark">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            No pricing matrix entries yet. Add your first LMG benchmark.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/40">
                <tr>
                  <th className="px-5 py-3">Component</th>
                  <th className="px-5 py-3">Vehicle</th>
                  <th className="px-5 py-3">Area</th>
                  <th className="px-5 py-3">Operation</th>
                  <th className="px-5 py-3">Severity</th>
                  <th className="px-5 py-3">Parts</th>
                  <th className="px-5 py-3">Labour</th>
                  <th className="px-5 py-3">Paint</th>
                  <th className="px-5 py-3">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-brand-primary/10 p-2 text-brand-primary">
                          <Database size={17} />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-950 dark:text-white">{row.component_name}</p>
                          <p className="text-xs text-zinc-500">{row.component_category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">{row.make || "Any"} {row.model || ""}</td>
                    <td className="px-5 py-4">{row.damage_area || "-"}</td>
                    <td className="px-5 py-4">{row.operation}</td>
                    <td className="px-5 py-4">{row.severity}</td>
                    <td className="px-5 py-4 font-mono">{money(row.parts_typical)}</td>
                    <td className="px-5 py-4 font-mono">{row.labour_hours_typical}h @ {money(row.labour_rate)}</td>
                    <td className="px-5 py-4 font-mono">{money(row.paint_typical)}</td>
                    <td className="px-5 py-4 text-zinc-500">{row.source_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form onSubmit={createEntry} className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-card-dark">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black">Add LMG Benchmark</h2>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <input placeholder="Make, optional" value={entry.make} onChange={(e) => setEntry({ ...entry, make: e.target.value })} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950" />
              <input placeholder="Model, optional" value={entry.model} onChange={(e) => setEntry({ ...entry, model: e.target.value })} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950" />
              <select value={entry.component_name} onChange={(e) => useComponent(e.target.value)} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                <option value="">Select component...</option>
                {components.map((c) => <option key={c.id} value={c.component_name}>{c.component_name}</option>)}
              </select>

              <input required placeholder="Component name" value={entry.component_name} onChange={(e) => setEntry({ ...entry, component_name: e.target.value })} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950" />
              <input placeholder="Category" value={entry.component_category} onChange={(e) => setEntry({ ...entry, component_category: e.target.value })} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950" />
              <select value={entry.damage_area} onChange={(e) => setEntry({ ...entry, damage_area: e.target.value })} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                <option value="front">Front</option>
                <option value="rear">Rear</option>
                <option value="side">Side</option>
                <option value="suspension">Suspension</option>
                <option value="interior">Interior</option>
              </select>

              <select value={entry.operation} onChange={(e) => setEntry({ ...entry, operation: e.target.value })} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                <option>Inspect further</option>
                <option>Repair</option>
                <option>Replace</option>
                <option>Paint</option>
                <option>Repair + Paint</option>
                <option>Replace + Paint</option>
                <option>PDR</option>
                <option>Align</option>
                <option>Calibrate</option>
              </select>

              <select value={entry.severity} onChange={(e) => setEntry({ ...entry, severity: e.target.value })} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>

              <input type="number" placeholder="Labour rate" value={entry.labour_rate} onChange={(e) => setEntry({ ...entry, labour_rate: Number(e.target.value) })} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950" />

              {[
                "parts_low", "parts_typical", "parts_high",
                "labour_hours_low", "labour_hours_typical", "labour_hours_high",
                "paint_low", "paint_typical", "paint_high",
              ].map((key) => (
                <input
                  key={key}
                  type="number"
                  placeholder={key.replaceAll("_", " ")}
                  value={entry[key]}
                  onChange={(e) => setEntry({ ...entry, [key]: Number(e.target.value) })}
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                />
              ))}
            </div>

            <textarea
              placeholder="Source notes"
              value={entry.source_notes}
              onChange={(e) => setEntry({ ...entry, source_notes: e.target.value })}
              className="mt-4 min-h-24 w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            />

            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-bold dark:border-zinc-800">
                Cancel
              </button>
              <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                {saving && <Loader2 size={16} className="animate-spin" />}
                Save Benchmark
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
