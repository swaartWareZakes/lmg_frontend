"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import TechnicianSidebar from "@/components/technician/TechnicianSidebar";
import TechnicianHeader from "@/components/technician/TechnicianHeader";

export default function TechnicianLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      try {
        const profile = await api.get("/orgs/me");

        if (profile?.role !== "technician" && profile?.role !== "super_admin" && profile?.role !== "org_admin") {
          router.replace("/dashboard");
          return;
        }

        setLoading(false);
      } catch {
        router.replace("/login");
      }
    };

    checkAccess();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f1115] text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-9 w-9 animate-spin text-emerald-500" />
          <p className="text-sm">Opening technician workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-zinc-100">
      <TechnicianSidebar />
      <div className="md:ml-64 min-h-screen flex flex-col">
        <TechnicianHeader />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
