// --- ./src/components/layout/Header.tsx ---
"use client";

import ThemeToggle from "./ThemeToggle";
import { Bell, Search, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const router = useRouter();
  const [initials, setInitials] = useState("...");

  // Fetch the user's name from Supabase Auth metadata to create their avatar initials
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const name = data.user?.user_metadata?.full_name || "Admin User";
      const parts = name.split(" ");
      if (parts.length > 1) {
        setInitials((parts[0][0] + parts[1][0]).toUpperCase());
      } else {
        setInitials(name.substring(0, 2).toUpperCase());
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-sidebar-dark/80 backdrop-blur-md sticky top-0 z-10 transition-colors duration-200">
      <div className="flex h-full items-center justify-between px-6">
        
        {/* Search Bar */}
        <div className="relative w-full max-w-md hidden sm:block">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-zinc-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-full border-0 py-2 pl-10 pr-4 text-sm bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:ring-2 focus:ring-brand-primary outline-none transition-all"
            placeholder="Search vehicles, VINs, or assessments..."
          />
        </div>

        <div className="flex flex-1 justify-end items-center gap-4">
          <button className="relative p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-sidebar-dark"></span>
          </button>
          
          <ThemeToggle />
          
          {/* Dynamic Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-primary to-blue-500 flex items-center justify-center text-white text-sm font-bold shadow-sm cursor-pointer ml-2">
            {initials}
          </div>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="p-2 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors ml-2"
            title="Sign Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}