"use client";

import { useState } from "react";
import { Menu, X, Wrench } from "lucide-react";
import TechnicianSidebar from "@/components/technician/TechnicianSidebar";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default function TechnicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {sidebarOpen && (
        <button
          aria-label="Close technician navigation overlay"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 w-72 max-w-[86vw] transform border-r border-white/10 bg-zinc-950 shadow-2xl transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        ].join(" ")}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4 lg:hidden">
          <div className="flex items-center gap-2 font-bold">
            <Wrench size={18} className="text-emerald-400" />
            Technician
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-xl border border-white/10 p-2 text-zinc-300 hover:bg-white/10"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <div onClick={() => setSidebarOpen(false)} className="h-full overflow-y-auto">
          <TechnicianSidebar />
        </div>
      </aside>

      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-zinc-950/85 px-3 backdrop-blur-xl sm:px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-white/10 p-2 text-zinc-200 hover:bg-white/10 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
                MUNI-VRESS
              </p>
              <h1 className="text-sm font-bold text-white sm:text-base">
                Technician Workspace
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] p-3 sm:p-4 md:p-5 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
