"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function DashboardRootPage() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const routeUser = async () => {
      try {
        const profile = await api.get("/orgs/me");

        if (!mounted) return;

        const role = String(profile?.role || "").toLowerCase();

        if (role === "technician") {
          router.replace("/technician");
          return;
        }

        if (
          role === "admin" ||
          role === "organization_admin" ||
          role === "org_admin" ||
          role === "super_admin"
        ) {
          router.replace("/dashboard/admin");
          return;
        }

        router.replace("/dashboard/fleet");
      } catch {
        router.replace("/login");
      }
    };

    routeUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <div className="flex h-[70vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-zinc-500">
        <Loader2 className="h-10 w-10 animate-spin text-brand-primary" />
        <p className="text-sm font-medium">Opening your dashboard...</p>
      </div>
    </div>
  );
}
