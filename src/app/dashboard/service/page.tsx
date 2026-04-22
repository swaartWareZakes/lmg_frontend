// --- ./src/app/dashboard/service/page.tsx ---
"use client";

import { useState, useEffect } from "react";
// FIX: Added 'Wrench' to the import list below
import { Clock, CheckCircle, Droplet, Wind, Settings, Loader2, Car, Wrench } from "lucide-react";
import { api } from "@/lib/api";

export default function ServiceSchedulesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [schedule, setSchedule] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/vehicles/').then(data => {
      setVehicles(data);
      if(data.length > 0) setSelectedVehicle(data[0].id);
    }).catch(console.error);
  }, []);

  const generateSchedule = async () => {
    if (!selectedVehicle) return;
    setLoading(true);
    
    const vehicle = vehicles.find(v => v.id === selectedVehicle);
    
    try {
      const res = await api.post("/oem/dynamic-schedule", {
        vehicle_id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        mileage: vehicle.current_mileage || 0
      });
      setSchedule(res);
    } catch (err) {
      alert("Failed to generate predictive schedule.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Predictive Service Schedules</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Generate dynamic, mileage-based preventative maintenance checklists.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <select 
          value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)}
          className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark px-4 py-3 text-sm focus:ring-2 focus:ring-brand-primary outline-none shadow-sm"
        >
          {vehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model} ({v.current_mileage?.toLocaleString() || 0} km)</option>)}
        </select>
        
        <button 
          onClick={generateSchedule} disabled={loading || !selectedVehicle}
          className="px-6 py-3 bg-zinc-900 hover:bg-emerald-500 dark:bg-brand-primary dark:hover:bg-emerald-400 text-white rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Clock size={18} />}
          Generate {vehicles.find(v => v.id === selectedVehicle)?.current_mileage?.toLocaleString() || 0}km Schedule
        </button>
      </div>

      {schedule && !loading && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark shadow-sm overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-brand-primary/5">
            <h3 className="font-bold text-lg text-brand-primary flex items-center gap-2">
              <Car size={20} />
              AI Predictive Checklist
            </h3>
            <span className="text-sm font-bold bg-white dark:bg-zinc-800 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-700">
              {vehicles.find(v => v.id === selectedVehicle)?.current_mileage?.toLocaleString()} km
            </span>
          </div>
          
          <div className="p-6">
            <p className="text-zinc-700 dark:text-zinc-300 font-medium mb-8 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-lg border border-zinc-100 dark:border-zinc-700">
              {schedule.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-md text-zinc-600 dark:text-zinc-400"><Settings size={16} /></div> Engine & Core
                </h4>
                <ul className="space-y-3">
                  {schedule.engine?.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                      <div className="mt-0.5 text-zinc-300 dark:text-zinc-600"><CheckCircle size={16} /></div> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-md text-zinc-600 dark:text-zinc-400"><Wrench size={16} /></div> Chassis & Brakes
                </h4>
                <ul className="space-y-3">
                  {schedule.chassis?.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                      <div className="mt-0.5 text-zinc-300 dark:text-zinc-600"><CheckCircle size={16} /></div> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-md text-zinc-600 dark:text-zinc-400"><Droplet size={16} /></div> Fluids & Filters
                </h4>
                <ul className="space-y-3">
                  {schedule.fluids?.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                      <div className="mt-0.5 text-zinc-300 dark:text-zinc-600"><CheckCircle size={16} /></div> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}