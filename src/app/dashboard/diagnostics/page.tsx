// --- ./src/app/dashboard/diagnostics/page.tsx ---
"use client";

import { useState, useEffect } from "react";
import { Search, Stethoscope, ArrowRight, CheckCircle2, AlertCircle, Loader2, RotateCcw } from "lucide-react";
import { api } from "@/lib/api";
import clsx from "clsx";

export default function DiagnosticsPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [symptom, setSymptom] = useState("");
  
  const [history, setHistory] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/vehicles/').then(data => {
      setVehicles(data);
      if(data.length > 0) setSelectedVehicle(data[0].id);
    }).catch(console.error);
  }, []);

  const runDiagnostic = async (currentHistory: string[]) => {
    if (!selectedVehicle || !symptom) return;
    setLoading(true);
    
    const vehicle = vehicles.find(v => v.id === selectedVehicle);
    
    try {
      const res = await api.post("/oem/diagnostics", {
        vehicle_id: selectedVehicle,
        make: vehicle.make,
        model: vehicle.model,
        symptom: symptom,
        history: currentHistory
      });
      setCurrentStep(res);
      setHistory(currentHistory);
    } catch (err) {
      alert("Diagnostic failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    setHistory([]);
    setCurrentStep(null);
    runDiagnostic([]);
  };

  const handleFailedStep = () => {
    const newHistory = [...history, `Tried: ${currentStep.step_title}. Result: Did not fix issue.`];
    runDiagnostic(newHistory);
  };

  const handleFixed = () => {
    alert("Diagnostic Complete! Vehicle is fixed.");
    setHistory([]);
    setCurrentStep(null);
    setSymptom("");
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Diagnostics Assist</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Step-by-step AI troubleshooting paths based on vehicle symptoms.</p>
      </div>

      {/* Control Bar */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <select 
          value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)}
          className="w-full md:w-1/3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-sm focus:outline-none"
        >
          {vehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model} ({v.license_plate})</option>)}
        </select>
        
        <input 
          type="text" value={symptom} onChange={e => setSymptom(e.target.value)}
          placeholder="Enter Symptom or Error Code (e.g., DTC P0303, Engine Misfire)"
          className="w-full flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
        
        <button 
          onClick={handleStart} disabled={loading || !symptom}
          className="w-full md:w-auto px-6 py-2.5 bg-brand-primary hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading && history.length === 0 ? <Loader2 size={16} className="animate-spin" /> : <Stethoscope size={16} />}
          Start Diagnostic
        </button>
      </div>

      {/* Step-by-Step Tree */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          
          {history.map((histText, idx) => (
            <div key={idx} className="rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/10 p-5 opacity-70">
               <div className="flex items-start gap-4">
                  <div className="mt-1 text-emerald-500"><CheckCircle2 size={20} /></div>
                  <div>
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Step {idx + 1} (Completed)</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{histText}</p>
                  </div>
               </div>
            </div>
          ))}

          {loading && history.length > 0 && (
            <div className="rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-8 flex justify-center text-brand-primary">
              <Loader2 size={32} className="animate-spin" />
            </div>
          )}

          {currentStep && !loading && (
            <div className="rounded-xl border-2 border-brand-primary bg-white dark:bg-card-dark p-5 shadow-md relative">
               <div className="absolute top-0 right-0 p-2 text-xs font-bold text-brand-primary uppercase tracking-wide">Current Step</div>
               <div className="flex items-start gap-4">
                  <div className="mt-1 text-brand-primary"><ArrowRight size={20} /></div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Step {history.length + 1}: {currentStep.step_title}</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-lg border border-zinc-100 dark:border-zinc-700">
                      {currentStep.instruction}
                    </p>
                    
                    <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 px-3 py-1.5 rounded-full w-fit">
                      <AlertCircle size={14} /> Suspected: {currentStep.suspected_component}
                    </div>
                    
                    <div className="mt-6 flex gap-3">
                       <button onClick={handleFixed} className="flex-1 py-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400 rounded-lg font-bold transition-colors border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-2">
                         <CheckCircle2 size={18} /> Solved Issue
                       </button>
                       <button onClick={handleFailedStep} className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 rounded-lg font-bold transition-colors border border-zinc-200 dark:border-zinc-700 flex items-center justify-center gap-2">
                         <RotateCcw size={18} /> Didn't Work, Next Step
                       </button>
                    </div>
                  </div>
               </div>
            </div>
          )}
          
          {!currentStep && !loading && history.length === 0 && (
            <div className="h-48 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500">
              Enter a symptom above to generate an AI diagnostic tree.
            </div>
          )}
        </div>

        <div className="lg:col-span-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark p-5 h-fit shadow-sm">
           <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 mb-4">
             <AlertCircle size={18} className="text-brand-accent" /> AI Session Info
           </h3>
           <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
             The Groq LLaMA engine dynamically calculates the most statistically probable repair steps based on your live feedback.
           </p>
        </div>
      </div>
    </div>
  );
}