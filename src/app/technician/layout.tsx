"use client";

import { useEffect, useState } from "react";
import { Menu, X, Wrench } from "lucide-react";
import TechnicianSidebar from "@/components/technician/TechnicianSidebar";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default function TechnicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    setSidebarOpen(desktop.matches);

    const onChange = (event: MediaQueryListEvent) => {
      setSidebarOpen(event.matches);
    };

    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Mobile/tablet overlay only. Desktop pushes content instead. */}
      {sidebarOpen && (
        <button
          aria-label="Close technician navigation overlay"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 w-[82vw] max-w-[360px] transform border-r border-white/10 bg-zinc-950 shadow-2xl transition-transform duration-300 lg:w-72 lg:max-w-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
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

        <div
          onClick={() => {
            if (window.innerWidth < 1024) setSidebarOpen(false);
          }}
          className="h-[calc(100vh-4rem)] overflow-y-auto"
        >
          <TechnicianSidebar />
        </div>
      </aside>

      <div
        className={[
          "min-h-screen transition-[padding] duration-300",
          sidebarOpen ? "lg:pl-72" : "lg:pl-0",
        ].join(" ")}
      >
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-zinc-950/85 px-3 backdrop-blur-xl sm:px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setSidebarOpen((value) => !value)}
              className="rounded-xl border border-white/10 p-2 text-zinc-200 hover:bg-white/10"
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="min-w-0">
              <p className="truncate text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
                LMG
              </p>
              <h1 className="truncate text-sm font-bold text-white sm:text-base">
                Technician Workspace
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
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
