"use client";

import { useEffect, useState } from "react";
import { LogOut, Mail, ShieldCheck, UserCircle, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import ThemeToggle from "@/components/layout/ThemeToggle";

type Profile = {
  full_name?: string;
  email?: string;
  role?: string;
  status?: string;
  organizations?: {
    name?: string;
    type?: string;
  };
};

export default function TechnicianProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    api.get("/orgs/me").then(setProfile).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-white">
              <UserCircle size={34} />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-500">
                Technician Profile
              </p>
              <h1 className="mt-1 text-3xl font-black text-zinc-950 dark:text-white">
                {profile?.full_name || "Technician"}
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                {profile?.organizations?.name || "LMG-Fleet"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-500/20"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card
          icon={<Mail size={18} />}
          label="Email"
          value={profile?.email || "No email captured"}
        />
        <Card
          icon={<ShieldCheck size={18} />}
          label="Role"
          value={profile?.role || "technician"}
        />
        <Card
          icon={<Wrench size={18} />}
          label="Status"
          value={profile?.status || "active"}
        />
        <Card
          icon={<UserCircle size={18} />}
          label="Workspace"
          value="Technician"
        />
      </section>
    </div>
  );
}

function Card({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
      <div className="mb-3 flex items-center gap-2 text-emerald-500">
        {icon}
        <p className="text-xs font-black uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-lg font-bold text-zinc-950 dark:text-white">{value}</p>
    </div>
  );
}
