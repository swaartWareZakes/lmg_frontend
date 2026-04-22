// --- ./src/app/(auth)/layout.tsx ---
import ThemeToggle from "@/components/layout/ThemeToggle";
import { Car } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-[#0f1115]">
      {/* Left side - Dark branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-sidebar-dark text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-transparent opacity-50"></div>
        <div className="z-10">
          <div className="flex items-center gap-2 text-2xl font-bold mb-12">
             <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-white">
                <Car size={24} />
             </div>
             LMG-Fleet
          </div>
          <h1 className="text-4xl font-bold leading-tight mt-24 max-w-md">
            The complete online tool for government fleet technical data and repair estimations.
          </h1>
        </div>
        <div className="z-10 text-sm text-zinc-400">
          Powered by Advanced LMG Engine.
        </div>
      </div>

      {/* Right side - Forms */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 relative">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}