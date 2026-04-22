// --- ./src/app/dashboard/layout.tsx ---
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      // Check if a user session exists in local storage
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // No session? Kick them to the login page immediately
        router.push("/login");
      } else {
        // Authenticated! Render the dashboard
        setIsLoading(false);
      }
    };

    checkAuth();

    // Set up a listener so if they log out in another tab, it kicks them out here too
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Show a loading spinner while checking auth status to prevent layout flashing
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-[#0f1115]">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary mb-4" />
        <p className="text-zinc-500 dark:text-zinc-400 font-medium animate-pulse">Securing session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-[#0f1115]">
      <Sidebar />
      
      {/* Main content wrapper offsets the 64w (256px) sidebar on md+ screens */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}