// --- ./src/app/dashboard/fleet/page.tsx ---
"use client";

import { useState, useEffect } from "react";
import { Search, Filter, MoreVertical, Plus, Loader2, AlertCircle, X, Zap, Save, User } from "lucide-react";
import clsx from "clsx";
import { api } from "@/lib/api";

// Define the shape of our data coming from FastAPI
interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  license_plate: string;
  current_mileage: number;
  assigned_to?: string; // New field
  status?: string; 
}

export default function FleetRegisterPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal & Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    vin: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    license_plate: "",
    current_mileage: 0,
    assigned_to: "" // Initializing new field
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      // Calls FastAPI GET /api/vehicles/ which securely filters by organization
      const data = await api.get('/vehicles/');
      // Map the backend data
      const formattedData = data.map((v: any) => ({
        ...v,
        status: v.current_mileage > 100000 ? "In Maintenance" : "Active" 
      }));
      setVehicles(formattedData);
    } catch (err: any) {
      setError("Failed to load LMG-Fleet data. Please ensure you are logged in.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle the form submission to POST a new vehicle
  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post('/vehicles/', newVehicle);
      
      // Close modal, reset form, and refresh the table
      setIsAddModalOpen(false);
      setNewVehicle({ vin: "", make: "", model: "", year: new Date().getFullYear(), license_plate: "", current_mileage: 0, assigned_to: "" });
      await fetchVehicles();
    } catch (err: any) {
      setError(err.message || "Failed to add vehicle.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simple client-side search filter
  const filteredVehicles = vehicles.filter(v => 
    v.vin.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.license_plate && v.license_plate.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (v.assigned_to && v.assigned_to.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 relative">
      
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Vehicle Register</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage all registered LMG-Fleet assets.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-brand-primary hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus size={16} /> Add Asset
        </button>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* TABLE COMPONENT */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex gap-4 bg-zinc-50/50 dark:bg-zinc-900/20">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={16} className="text-zinc-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-lg border border-zinc-200 dark:border-zinc-700 py-2 pl-9 pr-4 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:ring-2 focus:ring-brand-primary outline-none transition-all"
              placeholder="Search by VIN, Make, Plate, or Driver..."
            />
          </div>
          <button className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Filter size={16} /> Filter
          </button>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-zinc-500">
              <Loader2 className="animate-spin mr-2" size={24} /> Loading fleet database...
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-5 py-3 font-medium">Vehicle Make/Model</th>
                  <th className="px-5 py-3 font-medium">VIN (Instant ID)</th>
                  <th className="px-5 py-3 font-medium">License Plate</th>
                  <th className="px-5 py-3 font-medium">Assigned Driver</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredVehicles.length === 0 && !loading && (
                   <tr>
                     <td colSpan={6} className="px-5 py-8 text-center text-zinc-500">No vehicles found matching your criteria.</td>
                   </tr>
                )}
                {filteredVehicles.map((row) => (
                  <tr key={row.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">{row.make} {row.model}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{row.year} • {row.current_mileage?.toLocaleString() || 0} km</p>
                    </td>
                    <td className="px-5 py-4 text-brand-primary dark:text-brand-primary font-mono text-xs font-semibold tracking-wider">{row.vin}</td>
                    <td className="px-5 py-4 text-zinc-700 dark:text-zinc-300 font-mono text-xs">{row.license_plate || 'N/A'}</td>
                    <td className="px-5 py-4 text-zinc-700 dark:text-zinc-300">
                      {row.assigned_to ? (
                        <div className="flex items-center gap-2"><User size={14} className="text-zinc-400" /> {row.assigned_to}</div>
                      ) : (
                        <span className="text-zinc-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={clsx(
                        "px-2.5 py-1 rounded-full text-xs font-medium",
                        row.status === "Active" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                        row.status === "In Maintenance" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                        row.status === "Critical" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      )}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ADD VEHICLE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-card-dark rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Register New Asset</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="p-5 space-y-4">
              {/* VIN with Auto-Decode Teaser */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">VIN Number (17 Chars) *</label>
                <div className="flex gap-2">
                  <input 
                    type="text" required maxLength={17} minLength={17}
                    value={newVehicle.vin} onChange={(e) => setNewVehicle({...newVehicle, vin: e.target.value.toUpperCase()})}
                    className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary outline-none font-mono uppercase"
                    placeholder="e.g. WAUZZZ..."
                  />
                  <button type="button" className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1 border border-zinc-200 dark:border-zinc-700">
                    <Zap size={14} className="text-brand-accent" /> Decode
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Make *</label>
                  <input 
                    type="text" required value={newVehicle.make} onChange={(e) => setNewVehicle({...newVehicle, make: e.target.value})}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                    placeholder="e.g. Haval"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Model *</label>
                  <input 
                    type="text" required value={newVehicle.model} onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                    placeholder="e.g. Jolion"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Year *</label>
                  <input 
                    type="number" required min="1990" max="2026"
                    value={newVehicle.year} onChange={(e) => setNewVehicle({...newVehicle, year: parseInt(e.target.value)})}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">License Plate</label>
                  <input 
                    type="text" value={newVehicle.license_plate} onChange={(e) => setNewVehicle({...newVehicle, license_plate: e.target.value})}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary outline-none uppercase"
                    placeholder="e.g. SAPS 01 GP"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Current Mileage (km)</label>
                  <input 
                    type="number" min="0" value={newVehicle.current_mileage} onChange={(e) => setNewVehicle({...newVehicle, current_mileage: parseInt(e.target.value)})}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Assigned Driver</label>
                  <input 
                    type="text" value={newVehicle.assigned_to} onChange={(e) => setNewVehicle({...newVehicle, assigned_to: e.target.value})}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                    placeholder="e.g. Sgt. Molefe"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-zinc-200 dark:border-zinc-800 mt-6">
                <button 
                  type="button" onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={isSubmitting}
                  className="px-4 py-2 bg-brand-primary hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {isSubmitting ? "Saving..." : "Save Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}