"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function TechnicianEstimatesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/technician/ai-estimates");
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center text-zinc-400">
      <Loader2 className="mr-2 animate-spin text-emerald-400" size={20} />
      Opening AI Estimates...
    </div>
  );
}
