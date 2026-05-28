import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Calculator,
  Car,
  CheckCircle2,
  Clock,
  Database,
  FileText,
  Menu,
  Moon,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Stethoscope,
  Sun,
  TabletSmartphone,
  Users,
  Wrench,
  Zap,
} from "lucide-react";

const sections = [
  {
    title: "Getting Started",
    items: [
      "Log in with the role assigned to your account.",
      "Fleet/admin users land on the dashboard.",
      "Technician users are routed to the technician workspace.",
      "Use the sidebar to move between Assigned Jobs, AI Estimates, OEM Benchmark, Repair Guidance, Diagnostics and Service Schedules.",
    ],
  },
  {
    title: "Technician Flow",
    items: [
      "Create or open a technician job card.",
      "Capture inspection findings and photos from the relevant estimate page.",
      "Generate the VRESS AI estimate from job evidence.",
      "Optionally request a Vehicle Databases market repair benchmark.",
      "Return to the job card, select the estimate to submit, and send it for approval.",
      "After approval, unlock actual repair costs and variance tracking.",
    ],
  },
  {
    title: "Tablet / PWA Usage",
    items: [
      "The technician workspace is optimized for tablets.",
      "Use the menu button to open or close the sidebar on smaller screens.",
      "Use the theme toggle in the top bar to switch light or dark mode.",
      "Install the app from Chrome on Android for a full-screen app-like experience.",
    ],
  },
];

function Card({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
      <div className="mb-3 flex items-center gap-3">
        <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-500">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-zinc-950 dark:text-white">{title}</h3>
      </div>
      <div className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">{children}</div>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/70">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-black text-white">
        {number}
      </div>
      <div>
        <h3 className="font-bold text-zinc-950 dark:text-white">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{description}</p>
      </div>
    </div>
  );
}

export default function ManualPage() {
  return (
    <div className="min-h-screen bg-zinc-50 pb-24 text-zinc-900 selection:bg-emerald-500 selection:text-white dark:bg-[#0f1115] dark:text-zinc-50">
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/85 backdrop-blur-xl dark:border-zinc-800 dark:bg-[#0f1115]/85">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3 text-lg font-black">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white">
              <Car size={19} />
            </div>
            MUNI-VRESS
          </div>

          <nav className="flex items-center gap-3">
            <Link
              href="/technician"
              className="hidden rounded-xl border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 sm:inline-flex"
            >
              Technician App
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950"
            >
              <ArrowLeft size={16} /> Back to App
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:pt-14">
        <section className="mb-14 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.28em] text-emerald-500">
              User Manual
            </p>
            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-5xl">
              MUNI-VRESS Fleet, Technician and AI Estimate Manual
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-600 dark:text-zinc-300 sm:text-lg">
              This guide explains how to use MUNI-VRESS across fleet operations, technician job cards,
              AI repair estimates, Vehicle Databases benchmarks, approvals, actual costs, diagnostics,
              maintenance and tablet/PWA workflows.
            </p>
          </div>

          <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/15 to-purple-500/10 p-6 dark:border-emerald-400/20">
            <div className="grid gap-3">
              {sections.map((section) => (
                <div key={section.title} className="rounded-2xl bg-white/70 p-4 dark:bg-black/30">
                  <h3 className="font-bold text-zinc-950 dark:text-white">{section.title}</h3>
                  <ul className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-300">
                    {section.items.slice(0, 2).map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-14">
          <h2 className="mb-5 flex items-center gap-2 text-2xl font-black">
            <Users className="text-emerald-500" /> Roles and Access
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/50">
                <tr>
                  <th className="px-5 py-3 font-bold">Role</th>
                  <th className="px-5 py-3 font-bold">Workspace</th>
                  <th className="px-5 py-3 font-bold">Main Capabilities</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                <tr>
                  <td className="px-5 py-4 font-bold text-emerald-500">Admin / Fleet Manager</td>
                  <td className="px-5 py-4">Dashboard</td>
                  <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">
                    Vehicles, users, compliance, finance, maintenance, approvals and reporting.
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-bold text-purple-500">Assessor / Finance</td>
                  <td className="px-5 py-4">Estimations and approvals</td>
                  <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">
                    Review estimates, compare quotes, approve or reject repair costs and monitor variance.
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-bold text-cyan-500">Technician</td>
                  <td className="px-5 py-4">Technician Workspace</td>
                  <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">
                    Assigned jobs, job photos, AI estimates, OEM/market benchmarks, notes, diagnostics, guidance and actual costs.
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-bold text-amber-500">Driver</td>
                  <td className="px-5 py-4">Driver portal</td>
                  <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">
                    Vehicle check-in/check-out, issue reporting and damage notifications.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-14">
          <h2 className="mb-5 flex items-center gap-2 text-2xl font-black">
            <Wrench className="text-emerald-500" /> Technician Job Card Workflow
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Step
              number="1"
              title="Create or open a job card"
              description="A technician job card starts with a vehicle, title, reported issue, mileage, priority and intake notes. The card shows the job progress and the current status."
            />
            <Step
              number="2"
              title="Capture evidence"
              description="Use the AI Estimates page to upload damage photos. Photos become evidence for the selected job and are visible back on the job card."
            />
            <Step
              number="3"
              title="Generate the VRESS AI estimate"
              description="The AI estimate uses the job details and uploaded photos to draft repair lines, labour, parts, paint and total estimate values."
            />
            <Step
              number="4"
              title="Request a benchmark"
              description="Use OEM Benchmark to request Vehicle Databases repair benchmark data. This provides an external market comparison when provider data is available."
            />
            <Step
              number="5"
              title="Select estimate for approval"
              description="The job card does not generate estimates directly. It shows saved estimates and allows the technician to select the correct one for approval."
            />
            <Step
              number="6"
              title="Complete actual repair costs"
              description="Actual repair costs unlock after approval. Enter labour, parts, paint and miscellaneous costs to compare actual spend against the approved estimate."
            />
          </div>
        </section>

        <section className="mb-14">
          <h2 className="mb-5 flex items-center gap-2 text-2xl font-black">
            <Sparkles className="text-purple-500" /> Estimates
          </h2>
          <div className="grid gap-5 lg:grid-cols-2">
            <Card icon={<Sparkles size={22} />} title="AI Estimates">
              <p>
                The AI Estimates page is where technicians upload evidence and generate the internal VRESS estimate.
                It should be used for photo-based collision, body, bumper, headlamp, grille, fender and paint assessments.
              </p>
              <ul className="mt-3 space-y-1">
                <li>• Select the open job card.</li>
                <li>• Upload one or more damage photos.</li>
                <li>• Generate or refresh the AI estimate.</li>
                <li>• Review the line items before submitting from the job card.</li>
              </ul>
            </Card>

            <Card icon={<Database size={22} />} title="OEM / Market Benchmark">
              <p>
                The OEM Benchmark page compares the VRESS AI estimate against Vehicle Databases repair benchmark data.
                It keeps AI and external benchmark estimates separate so one does not overwrite the other.
              </p>
              <ul className="mt-3 space-y-1">
                <li>• Left panel: internal VRESS AI estimate.</li>
                <li>• Right panel: external Vehicle Databases benchmark.</li>
                <li>• Bottom panel: variance between AI and benchmark.</li>
                <li>• If provider data is general service data, validate relevance before approval.</li>
              </ul>
            </Card>
          </div>
        </section>

        <section className="mb-14">
          <h2 className="mb-5 flex items-center gap-2 text-2xl font-black">
            <BookOpen className="text-blue-500" /> Guidance, Diagnostics and Maintenance
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            <Card icon={<BookOpen size={22} />} title="Repair Guidance">
              Select an active job and ask for repair guidance. Use it for process steps, inspection checks and technician notes.
            </Card>
            <Card icon={<Stethoscope size={22} />} title="Diagnostics Assist">
              Use symptoms or fault codes to generate a step-by-step diagnostic path. Mark steps as solved or continue to the next suggestion.
            </Card>
            <Card icon={<Clock size={22} />} title="Service Schedules">
              View preventative maintenance schedules and use mileage/service data to plan upcoming work.
            </Card>
          </div>
        </section>

        <section className="mb-14">
          <h2 className="mb-5 flex items-center gap-2 text-2xl font-black">
            <ShieldCheck className="text-emerald-500" /> Admin, Finance and Compliance
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            <Card icon={<ShieldCheck size={22} />} title="Compliance">
              Admin users can monitor compliance alerts, roadworthiness issues, licensing risks and fleet readiness.
            </Card>
            <Card icon={<Calculator size={22} />} title="Finance and Approvals">
              Finance users review estimates, compare costs, approve quotes and monitor repair cost variance.
            </Card>
            <Card icon={<FileText size={22} />} title="Audit Trail">
              Job notes, status changes, generated estimates, selected estimates and actual costs form the job timeline.
            </Card>
            <Card icon={<CheckCircle2 size={22} />} title="Completion">
              Once actual repairs are recorded and quality checks are done, the job can move to completed status.
            </Card>
          </div>
        </section>

        <section className="mb-14 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
          <h2 className="mb-5 flex items-center gap-2 text-2xl font-black">
            <TabletSmartphone className="text-emerald-500" /> Tablet, Sidebar and Theme Usage
          </h2>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <div className="mb-2 flex items-center gap-2 font-bold">
                <Menu size={18} className="text-emerald-500" /> Sidebar
              </div>
              <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                On tablets and smaller screens, tap the menu icon in the top bar to open the technician sidebar.
                Tap the X button or outside the sidebar to close it.
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 font-bold">
                <Sun size={18} className="text-amber-500" />
                <Moon size={18} className="text-purple-500" /> Theme
              </div>
              <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                Use the theme button in the top-right of the technician workspace to switch between light and dark mode.
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 font-bold">
                <Smartphone size={18} className="text-cyan-500" /> PWA
              </div>
              <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                The app can be installed on Android tablets from Chrome once deployed over HTTPS.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-14 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-black">
            <Smartphone className="text-emerald-500" /> Install on Android A7 Tablet
          </h2>
          <ol className="space-y-3 text-sm leading-6 text-zinc-700 dark:text-zinc-200">
            <li><strong>1.</strong> Open <strong>Chrome</strong> on the Samsung/Android A7 tablet.</li>
            <li><strong>2.</strong> Go to the deployed VRESS URL, for example the Vercel production link.</li>
            <li><strong>3.</strong> Log in once so the technician workspace loads correctly.</li>
            <li><strong>4.</strong> Tap the <strong>three-dot menu</strong> in the top-right of Chrome.</li>
            <li><strong>5.</strong> Tap <strong>Add to Home screen</strong> or <strong>Install app</strong>.</li>
            <li><strong>6.</strong> Confirm the app name, for example <strong>VRESS</strong>.</li>
            <li><strong>7.</strong> Open VRESS from the tablet home screen. It should open like a standalone app.</li>
          </ol>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
            If the install option does not show, refresh the page, confirm the site is using HTTPS, and make sure the latest
            version has been deployed with the manifest and service worker.
          </p>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-black">
            <Zap className="text-yellow-500" /> Recommended Daily Workflow
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <ul className="space-y-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              <li>• Open Assigned Jobs.</li>
              <li>• Choose the active job card.</li>
              <li>• Upload evidence from AI Estimates.</li>
              <li>• Generate the VRESS AI estimate.</li>
              <li>• Compare against Vehicle Databases where useful.</li>
            </ul>
            <ul className="space-y-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              <li>• Return to the job card.</li>
              <li>• Select the saved estimate for approval.</li>
              <li>• Move the job through approval and repair statuses.</li>
              <li>• Add actual costs after approval.</li>
              <li>• Complete quality check and close the job.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
