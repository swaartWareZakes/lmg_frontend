"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OldTechnicianDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/technician");
  }, [router]);

  return null;
}
