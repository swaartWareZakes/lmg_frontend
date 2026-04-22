// --- ./src/app/manual/page.tsx ---
import Link from "next/link";
import { 
  Car, ArrowLeft, Sparkles, ShieldCheck, 
  Wrench, Calculator, Users, Stethoscope, 
  BookOpen, Clock, Zap
} from "lucide-react";

export default function ManualPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0f1115] text-zinc-900 dark:text-zinc-50 pb-24 selection:bg-brand-primary selection:text-white">
      {/* HEADER */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-[#0f1115]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-bold">
            <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white">
              <Car size={18} />
            </div>
            G-FLEET
          </div>
          <nav className="flex gap-4">
            <Link href="/login" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-2">
              <ArrowLeft size={16} /> Back to App
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* HERO SECTION */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            G-Fleet User Manual
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Welcome to the comprehensive guide for the G-Fleet AI-powered vehicle management and repair estimation platform. Learn how to manage assets, run AI diagnostics, and streamline finance approvals.
          </p>
        </div>

        {/* SECTION: ROLES & ACCESS */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <Users className="text-brand-primary" /> Role-Based Access Control (RBAC)
          </h2>
          <p className="mb-4 text-zinc-600 dark:text-zinc-300">
            G-Fleet isolates data and UI experiences based on your assigned organizational role.
          </p>
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">Role</th>
                  <th className="px-6 py-3 font-semibold">Dashboard View</th>
                  <th className="px-6 py-3 font-semibold">Key Capabilities</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="px-6 py-4 font-bold text-brand-primary">Fleet Administrator</td>
                  <td className="px-6 py-4">Full Analytics & Fleet Overview</td>
                  <td className="px-6 py-4">Register vehicles, monitor compliance, assign drivers, view cost analytics.</td>
                </tr>
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="px-6 py-4 font-bold text-emerald-600">VRESS Assessor</td>
                  <td className="px-6 py-4">Estimations & Finance</td>
                  <td className="px-6 py-4">Run AI damage estimates, approve/reject mechanic quotes, manage maintenance logs.</td>
                </tr>
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="px-6 py-4 font-bold text-amber-600">Fleet Driver</td>
                  <td className="px-6 py-4">Driver Portal (Mobile-Optimized)</td>
                  <td className="px-6 py-4">Check-in / Check-out assigned vehicles, report damage directly to admins.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION: AI ESTIMATOR & WORKFLOW */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <Sparkles className="text-brand-accent" /> AI Damage Estimator & Pipeline
          </h2>
          <p className="mb-6 text-zinc-600 dark:text-zinc-300 leading-relaxed">
            The core of the VRESS engine is powered by Groq's Lightning-Fast LPU and LLaMA 4 Vision models. It eliminates the need for manual part searching and automatically audits mechanic invoices.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark shadow-sm">
              <h3 className="font-bold text-lg mb-2">1. Upload & Auto-Detect</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Upload a photo of vehicle damage. The Vision AI will instantly identify the exact car part (e.g., "Front Bumper" or "Left Fender"), assess the severity of the damage, and determine the necessary repair action (Polish, PDR, Repair, or Replace).
              </p>
            </div>
            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark shadow-sm">
              <h3 className="font-bold text-lg mb-2">2. Benchmark vs. Quote</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                The system calculates a "VRESS AI Benchmark" using OEM parts and labor data. Enter the mechanic's quote to instantly see the cost variance and flag overcharging before submitting.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark shadow-sm">
              <h3 className="font-bold text-lg mb-2">3. Finance Approval</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Submitted estimates route directly to the <strong>Finance Approvals</strong> queue. Managers review the AI evidence and variance before clicking "Approve Quote," locking in the budget.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark shadow-sm">
              <h3 className="font-bold text-lg mb-2">4. Mark as Fixed</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Once approved, the issue moves to the <strong>Active Issues</strong> board. Workshop technicians can review the approved scope of work and mark the job as "Paid & Fixed" to clear the board.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION: TECH TOOLS */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <Wrench className="text-blue-500" /> Advanced Tech Tools
          </h2>
          <p className="mb-6 text-zinc-600 dark:text-zinc-300 leading-relaxed">
            The platform provides AI-driven technical assistance to mechanics and workshop managers, utilizing the LLaMA 3.3 70B model.
          </p>

          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark shadow-sm flex items-start gap-4">
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-brand-primary">
                <BookOpen size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Technical Database (Ask the Manual)</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Replaces static PDF manuals. Select a vehicle and ask a natural language question (e.g., <em>"What is the cylinder head torque spec?"</em>) to get an instant, highly technical answer from the AI.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark shadow-sm flex items-start gap-4">
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-brand-primary">
                <Stethoscope size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Diagnostics Assist</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  An interactive troubleshooting tree. Input an OBD2 Error Code or symptom. The AI generates Step 1. If that fails, click "Didn't Work", and the AI dynamically calculates the next most probable diagnostic step based on your history.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark shadow-sm flex items-start gap-4">
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-brand-primary">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Predictive Service Schedules</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  The system reads the live mileage of the selected fleet vehicle and generates a custom, three-tier preventative maintenance checklist (Engine, Chassis, Fluids) tailored to that exact vehicle's life stage.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: COMPLIANCE */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <ShieldCheck className="text-emerald-500" /> Compliance & Risk Management
          </h2>
          <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 p-6 rounded-xl text-emerald-900 dark:text-emerald-100">
            <p className="mb-4 leading-relaxed">
              G-Fleet tracks real-time compliance scores across the organization.
            </p>
            <ul className="space-y-2 list-disc pl-5">
              <li><strong>Critical Violations:</strong> Ground a vehicle immediately (e.g., Unroadworthy damage, Expired license disk). These negatively impact the overall Fleet Readiness score.</li>
              <li><strong>Warnings:</strong> Flag upcoming renewals or routine maintenance checks before they become critical failures.</li>
              <li><strong>Resolution:</strong> Admins can log audits and resolve alerts directly from the dashboard to restore the fleet's Compliance Score back to 100%.</li>
            </ul>
          </div>
        </section>

      </main>
    </div>
  );
}