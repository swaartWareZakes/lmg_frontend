// --- ./src/app/dashboard/estimations/page.tsx ---
"use client";

import { useState, useEffect, useRef } from "react";
import { Save, Layers, Trash2, Building2, Calculator, AlertTriangle, CheckCircle, UploadCloud, Loader2, Sparkles, X, Image as ImageIcon, Camera } from "lucide-react";
import { api } from "@/lib/api";
import clsx from "clsx";

export default function AI_EstimationsPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [providerName, setProviderName] = useState("");
  const [providerQuote, setProviderQuote] = useState<number>(0);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // AI Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get('/vehicles/').then(data => {
      setVehicles(data);
      if(data.length > 0) setSelectedVehicle(data[0].id);
    }).catch(console.error);
  }, []);

  const systemParts = lineItems.reduce((acc, item) => acc + item.part_cost, 0);
  const systemLabor = lineItems.reduce((acc, item) => acc + (item.labor_hours * 850), 0);
  const systemPaint = lineItems.reduce((acc, item) => acc + item.paint_cost, 0);
  const systemTotal = systemParts + systemLabor + systemPaint;

  const varianceAmount = providerQuote - systemTotal;
  const variancePercentage = systemTotal > 0 ? (varianceAmount / systemTotal) * 100 : 0;
  const isOvercharging = providerQuote > systemTotal;

  const openMagicUpload = () => {
    if (!selectedVehicle) {
      alert("Please select a target vehicle first.");
      return;
    }
    setUploadModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const vehicle = vehicles.find(v => v.id === selectedVehicle);
    
    const formData = new FormData();
    formData.append("file", file);
    // Notice we no longer send 'part_name'. The AI figures it out!
    formData.append("make", vehicle.make);
    formData.append("model", vehicle.model);

    setAiLoading(true);
    try {
      const result = await api.postForm("/ai/analyze-part", formData);
      setLineItems([...lineItems, result]);
      if (result.image_url) setUploadedImage(result.image_url); 
      setUploadModalOpen(false);
    } catch (err: any) {
      alert("AI Processing Failed: " + err.message);
    } finally {
      setAiLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePart = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
    if (lineItems.length === 1) setUploadedImage(null);
  };

  const submitAssessment = async () => {
    if (!selectedVehicle || !providerName || providerQuote <= 0 || lineItems.length === 0) {
      alert("Please complete all fields (Vehicle, Workshop Name, Provider Quote, and AI Parts Analysis).");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.post("/assessments/", {
        vehicle_id: selectedVehicle,
        provider_name: providerName,
        provider_quote_total: providerQuote,
        image_url: uploadedImage, 
        line_items: lineItems
      });
      
      alert("Assessment saved successfully! It is now pending in Active Issues.");
      
      setLineItems([]);
      setProviderName("");
      setProviderQuote(0);
      setUploadedImage(null);
    } catch (err: any) {
      alert("Failed to submit assessment: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 min-h-[calc(100vh-8rem)] relative">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            AI Damage Estimator <Sparkles size={20} className="text-brand-accent" />
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Upload a photo and our Vision AI will automatically detect the part and calculate repair costs.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={submitAssessment}
            disabled={isSubmitting || lineItems.length === 0 || providerQuote === 0}
            className="px-4 py-2 bg-brand-primary hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSubmitting ? "Submitting..." : "Submit to Finance"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark p-5 shadow-sm grid grid-cols-2 gap-4 z-10 relative">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2">Target Vehicle</label>
              <select 
                value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none"
              >
                <option value="" disabled>Select vehicle...</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.license_plate} - {v.make} {v.model}</option>)}
              </select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2">Workshop / Provider Name</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3 top-2.5 text-zinc-400" />
                <input 
                  type="text" value={providerName} onChange={(e) => setProviderName(e.target.value)}
                  placeholder="e.g. SupaQuick Randburg"
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/50 overflow-hidden relative flex flex-col shadow-inner min-h-[400px]">
            {uploadedImage && (
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-zinc-900/60 dark:bg-zinc-900/80 backdrop-blur-sm z-10"></div>
                <img src={uploadedImage} alt="Vehicle Damage" className="w-full h-full object-cover z-0 opacity-50" />
              </div>
            )}

            <div className="flex flex-col items-center justify-center p-8 z-20 relative flex-1">
              <div className="w-20 h-20 border-4 border-dashed border-brand-primary/50 rounded-full flex items-center justify-center text-brand-primary bg-white/5 dark:bg-black/20 backdrop-blur-md mb-6">
                {uploadedImage ? <ImageIcon size={32} /> : <Camera size={32} />}
              </div>
              <h3 className={clsx("text-2xl font-bold mb-2", uploadedImage ? "text-white" : "text-zinc-900 dark:text-zinc-50")}>
                {uploadedImage ? "AI Evidence Loaded" : "Auto-Detect Damage"}
              </h3>
              <p className={clsx("text-sm text-center max-w-sm mx-auto mb-8", uploadedImage ? "text-zinc-300" : "text-zinc-500 dark:text-zinc-400")}>
                Upload a photo of any interior or exterior damage. The Vision model will automatically identify the car part and assess repair requirements.
              </p>
              
              <button 
                onClick={openMagicUpload} 
                className="px-6 py-4 bg-brand-primary hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg transition-transform hover:scale-105 flex items-center gap-3 text-lg"
              >
                <Sparkles size={24} /> 
                {uploadedImage ? "Analyze Another Photo" : "Upload & Analyze Image"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-5 flex flex-col gap-6 z-10 relative">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark p-5 shadow-sm flex flex-col flex-1 max-h-[450px]">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
              <Calculator size={18} className="text-brand-primary" /> LMG AI Benchmark
            </h3>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {lineItems.length === 0 && <p className="text-sm text-zinc-500 italic text-center mt-10">Waiting for AI analysis...</p>}
              {lineItems.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 relative group">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                      <Sparkles size={12} className="text-brand-accent"/> {item.component_name}
                    </span>
                    <span className="text-xs font-bold bg-brand-primary text-white px-2 py-0.5 rounded shadow-sm uppercase">{item.action}</span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 leading-relaxed border-b border-zinc-200 dark:border-zinc-700 pb-2">
                    <strong className="text-zinc-700 dark:text-zinc-300">AI Note: </strong>{item.reasoning}
                  </p>
                  <div className="text-xs text-zinc-600 dark:text-zinc-300 flex justify-between pr-6 font-mono">
                    <span>Part: R {item.part_cost}</span>
                    <span>Lab: {item.labor_hours}h</span>
                    <span>Paint: R {item.paint_cost}</span>
                  </div>
                  <button onClick={() => removePart(idx)} className="absolute right-2 top-1/2 -translate-y-1/2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-4 text-sm space-y-2">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400"><span>System Parts:</span> <span>R {systemParts.toLocaleString()}</span></div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400"><span>System Labor (@ R850/h):</span> <span>R {systemLabor.toLocaleString()}</span></div>
              <div className="flex justify-between font-bold text-lg mt-2 text-zinc-900 dark:text-zinc-50 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <span>LMG AI Estimate:</span> <span>R {systemTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className={clsx(
            "rounded-xl border-2 p-5 shadow-md flex flex-col",
            isOvercharging && providerQuote > 0 ? "border-red-400 bg-red-50 dark:bg-red-900/10" : 
            providerQuote > 0 ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10" : 
            "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark"
          )}>
            <label className="block text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">Provider Quoted Total (ZAR)</label>
            <input 
              type="number" min="0" value={providerQuote || ""} onChange={(e) => setProviderQuote(parseFloat(e.target.value) || 0)}
              placeholder="Enter mechanic's total quote..."
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-3 text-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand-accent shadow-inner mb-4"
            />

            {providerQuote > 0 && systemTotal > 0 && (
              <div className="flex items-center justify-between pt-4 border-t border-zinc-300/50 dark:border-zinc-700/50">
                <div className="flex items-center gap-2">
                  {isOvercharging ? <AlertTriangle size={20} className="text-red-500" /> : <CheckCircle size={20} className="text-emerald-500" />}
                  <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Quote Variance</span>
                </div>
                <div className="text-right">
                  <span className={clsx("text-lg font-bold block", isOvercharging ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400")}>
                    {isOvercharging ? "+" : ""}R {varianceAmount.toLocaleString()}
                  </span>
                  <span className="text-xs font-medium text-zinc-500">{isOvercharging ? "Overcharging by " : "Under benchmark by "}{Math.abs(variancePercentage).toFixed(1)}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI UPLOAD MODAL */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-card-dark rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col items-center">
            
            {!aiLoading ? (
              <>
                <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary mb-4">
                  <UploadCloud size={32} />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">AI Damage Detection</h3>
                <p className="text-sm text-zinc-500 text-center mb-6">Upload a photo. The AI will detect the specific component (interior or exterior) and assess the damage.</p>
                
                <input 
                  type="file" 
                  accept="image/jpeg, image/png, image/webp"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-primary file:text-white hover:file:bg-emerald-500 cursor-pointer border border-dashed border-zinc-300 dark:border-zinc-700 p-4 rounded-xl"
                />

                <button onClick={() => setUploadModalOpen(false)} className="mt-6 text-sm font-medium text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                  Cancel Analysis
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center py-10">
                <Loader2 size={48} className="animate-spin text-brand-accent mb-6" />
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Groq LPU is analyzing...</h3>
                <p className="text-sm text-zinc-500 text-center animate-pulse">Auto-detecting vehicle part and evaluating damage severity.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}