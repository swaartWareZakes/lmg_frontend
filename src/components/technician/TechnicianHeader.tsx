"use client";

import { Bell, LogOut, Search, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function TechnicianHeader() {
  const router = useRouter();

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="h-16 border-b border-zinc-800 bg-[#0f1115] flex items-center justify-between px-6">
      <div className="relative w-full max-w-xl">
        <Search size={16} className="absolute left-3 top-2.5 text-zinc-500" />
        <input
          placeholder="Search jobs, VINs, vehicles..."
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 pl-9 pr-3 text-sm text-zinc-100 outline-none focus:border-emerald-500"
        />
      </div>

      <div className="flex items-center gap-3">
        <button className="rounded-lg border border-zinc-800 p-2 text-zinc-400 hover:text-white">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-emerald-300">
          <Wrench size={16} />
          <span className="text-sm font-medium">Technician</span>
        </div>
        <button onClick={logout} className="rounded-lg border border-zinc-800 p-2 text-zinc-400 hover:text-red-400">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
