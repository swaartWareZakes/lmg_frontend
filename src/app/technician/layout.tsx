"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, Menu, UserCircle, Wrench, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import TechnicianSidebar from "@/components/technician/TechnicianSidebar";
import ThemeToggle from "@/components/layout/ThemeToggle";

type Profile = {
  id?: string;
  full_name?: string;
  email?: string;
  role?: string;
  organizations?: {
    name?: string;
  };
};

export default function TechnicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    setSidebarOpen(desktop.matches);

    const onChange = (event: MediaQueryListEvent) => {
      setSidebarOpen(event.matches);
    };

    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      try {
        const userProfile = await api.get("/orgs/me");

        if (
          userProfile?.role !== "technician" &&
          userProfile?.role !== "super_admin" &&
          userProfile?.role !== "org_admin"
        ) {
          router.replace("/dashboard");
          return;
        }

        setProfile(userProfile);
        setLoading(false);
      } catch {
        router.replace("/login");
      }
    };

    checkAccess();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.replace("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const displayName =
    profile?.full_name ||
    profile?.email ||
    "Technician";

  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-9 w-9 animate-spin text-emerald-500" />
          <p className="text-sm">Opening technician workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-zinc-100">
      {sidebarOpen && (
        <button
          aria-label="Close technician navigation overlay"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 w-[82vw] max-w-[360px] transform border-r border-zinc-200 bg-white shadow-2xl transition-transform duration-300 dark:border-white/10 dark:bg-zinc-950 lg:w-72 lg:max-w-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-4 dark:border-white/10">
          <div className="flex items-center gap-2 font-bold">
            <Wrench size={18} className="text-emerald-500" />
            Technician
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-xl border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10"
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
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/85 px-3 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/85 sm:px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setSidebarOpen((value) => !value)}
              className="rounded-xl border border-zinc-200 p-2 text-zinc-700 hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/10"
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="min-w-0">
              <p className="truncate text-xs font-semibold uppercase tracking-[0.22em] text-emerald-500">
                LMG
              </p>
              <h1 className="truncate text-sm font-bold text-zinc-950 dark:text-white sm:text-base">
                Technician Workspace
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/technician/profile"
              className="hidden items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/10 sm:flex"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-xs font-black text-white">
                {initials}
              </span>
              <span className="max-w-[140px] truncate">{displayName}</span>
            </Link>

            <Link
              href="/technician/profile"
              className="rounded-xl border border-zinc-200 p-2 text-zinc-700 hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/10 sm:hidden"
              aria-label="Open profile"
            >
              <UserCircle size={20} />
            </Link>

            <ThemeToggle />

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-500/20"
              aria-label="Log out"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] p-3 sm:p-4 md:p-5 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
