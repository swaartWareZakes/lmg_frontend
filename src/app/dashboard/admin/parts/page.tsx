"use client";

import { useEffect, useState } from "react";
import { Loader2, PackageSearch, Plus, Search, X } from "lucide-react";
import { api } from "@/lib/api";

const currency = (value: any) =>
  `R ${Number(value || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function AdminPartsPage() {
  const [parts, setParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newPart, setNewPart] = useState({
    part_name: "",
    part_category: "Body",
    part_number: "",
    supplier_name: "",
    quantity_on_hand: 0,
    minimum_stock_level: 0,
    unit_cost: 0,
    location: "",
    condition: "new",
  });

  const fetchParts = async () => {
    setLoading(true);
    try {
      const qs = search ? `?search=${encodeURIComponent(search)}` : "";
      const data = await api.get(`/admin/parts${qs}`);
      setParts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, []);

  const createPart = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/admin/parts", newPart);
      setModalOpen(false);
      setNewPart({
        part_name: "",
        part_category: "Body",
        part_number: "",
        supplier_name: "",
        quantity_on_hand: 0,
        minimum_stock_level: 0,
        unit_cost: 0,
        location: "",
        condition: "new",
      });
      await fetchParts();
    } catch (err: any) {
      alert(err?.message || "Failed to create part.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-brand-primary">Admin Parts</p>
          <h1 className="mt-1 text-3xl font-black text-zinc-950 dark:text-white">Parts Inventory</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Manage stock, suppliers, unit costs and low-stock warnings.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchParts();
              }}
              placeholder="Search parts..."
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-brand-primary dark:border-zinc-800 dark:bg-card-dark sm:w-80"
            />
          </div>

          <button onClick={fetchParts} className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-bold dark:border-zinc-800">
            Search
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-500"
          >
            <Plus size={16} /> Add Part
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-card-dark">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
          </div>
        ) : parts.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">No parts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/40">
                <tr>
                  <th className="px-5 py-3">Part</th>
                  <th className="px-5 py-3">Supplier</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3">Reserved</th>
                  <th className="px-5 py-3">Available</th>
                  <th className="px-5 py-3">Unit Cost</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {parts.map((part) => (
                  <tr key={part.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-brand-primary/10 p-2 text-brand-primary">
                          <PackageSearch size={17} />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-950 dark:text-white">{part.part_name}</p>
                          <p className="text-xs text-zinc-500">{part.part_number || part.oem_number || part.part_category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">{part.supplier_name || "-"}</td>
                    <td className="px-5 py-4 font-bold">{part.quantity_on_hand}</td>
                    <td className="px-5 py-4">{part.quantity_reserved}</td>
                    <td className="px-5 py-4 font-bold text-brand-primary">{part.quantity_available}</td>
                    <td className="px-5 py-4 font-mono">{currency(part.unit_cost)}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold dark:bg-zinc-800">
                        {part.computed_stock_status || part.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-zinc-500">{part.location || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form onSubmit={createPart} className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-card-dark">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black">Add Inventory Part</h2>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <input required placeholder="Part name" value={newPart.part_name} onChange={(e) => setNewPart({ ...newPart, part_name: e.target.value })} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950" />
              <input placeholder="Part number" value={newPart.part_number} onChange={(e) => setNewPart({ ...newPart, part_number: e.target.value })} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950" />
              <input placeholder="Category" value={newPart.part_category} onChange={(e) => setNewPart({ ...newPart, part_category: e.target.value })} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950" />
              <input placeholder="Supplier" value={newPart.supplier_name} onChange={(e) => setNewPart({ ...newPart, supplier_name: e.target.value })} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950" />
              <input type="number" placeholder="Quantity on hand" value={newPart.quantity_on_hand} onChange={(e) => setNewPart({ ...newPart, quantity_on_hand: Number(e.target.value) })} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950" />
              <input type="number" placeholder="Minimum stock" value={newPart.minimum_stock_level} onChange={(e) => setNewPart({ ...newPart, minimum_stock_level: Number(e.target.value) })} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950" />
              <input type="number" placeholder="Unit cost" value={newPart.unit_cost} onChange={(e) => setNewPart({ ...newPart, unit_cost: Number(e.target.value) })} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950" />
              <input placeholder="Location" value={newPart.location} onChange={(e) => setNewPart({ ...newPart, location: e.target.value })} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950" />
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-bold dark:border-zinc-800">
                Cancel
              </button>
              <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                {saving && <Loader2 size={16} className="animate-spin" />}
                Save Part
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
