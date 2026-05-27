"use client";

export default function TechnicianVinPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-emerald-400 font-medium">Technician Tool</p>
        <h1 className="text-2xl font-bold text-white">Quick VIN Lookup</h1>
        <p className="text-sm text-slate-400 mt-1">
          Enter a VIN and preview decoded make, model, year, body class and engine information.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <input
          placeholder="Enter VIN"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
        />
        <button className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white">
          Decode VIN
        </button>
      </div>
    </div>
  );
}
