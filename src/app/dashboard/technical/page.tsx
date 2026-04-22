// --- ./src/app/dashboard/technical/page.tsx ---
"use client";

import { useState, useEffect } from "react";
import { Search, BookOpen, Loader2, Wrench, Settings2, Zap, FileText } from "lucide-react";
import { api } from "@/lib/api";
import clsx from "clsx";

export default function TechnicalDataPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/vehicles/').then(data => {
      setVehicles(data);
      if(data.length > 0) setSelectedVehicle(data[0].id);
    }).catch(console.error);
  }, []);

  const askManual = async () => {
    if (!selectedVehicle || !question) return;
    setLoading(true);
    
    const vehicle = vehicles.find(v => v.id === selectedVehicle);
    
    try {
      const res = await api.post("/oem/ask-manual", {
        make: vehicle.make,
        model: vehicle.model,
        question: question
      });
      setAnswer(res.answer);
    } catch (err) {
      alert("Failed to query the manual.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">OEM Technical Database</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Ask the AI Master Technician for torque specs, procedures, and fluid capacities.</p>
        </div>
      </div>

      <div className="flex gap-4">
        <select 
          value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)}
          className="w-1/3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark px-4 py-3 text-sm focus:ring-2 focus:ring-brand-primary outline-none"
        >
          {vehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model} ({v.license_plate})</option>)}
        </select>
        
        <div className="relative w-2/3">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search size={20} className="text-zinc-400" />
          </div>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && askManual()}
            className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-800 py-3 pl-12 pr-32 text-sm bg-white dark:bg-card-dark text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-brand-primary outline-none shadow-sm"
            placeholder="e.g. What is the cylinder head torque spec?"
          />
          <button 
            onClick={askManual}
            disabled={loading || !question}
            className="absolute inset-y-1.5 right-1.5 px-4 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <BookOpen size={16} />}
            Search
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center bg-zinc-50/50 dark:bg-zinc-900/20 gap-2">
          <Wrench size={18} className="text-brand-primary" />
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">AI Manual Output</h3>
        </div>
        
        <div className="flex-1 p-8 bg-[#fafafa] dark:bg-[#0a0a0a]">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-4">
               <Loader2 size={40} className="animate-spin text-brand-primary" />
               <p className="animate-pulse">Searching OEM Database...</p>
             </div>
          ) : answer ? (
            <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-6 rounded-xl shadow-lg">
              <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">{answer}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-4 opacity-50">
               <BookOpen size={64} />
               <p>Select a vehicle and ask a technical question.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}