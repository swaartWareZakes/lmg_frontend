// --- ./src/app/(auth)/login/page.tsx ---
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Car, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center gap-2 text-xl font-bold mb-8 lg:hidden text-zinc-900 dark:text-zinc-50">
         <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white">
            <Car size={18} />
         </div>
         LMG-Fleet
      </div>

      <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Welcome back</h2>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8">Enter your credentials to access the LMG-Fleet database.</p>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Email Address</label>
          <input 
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
            placeholder="assessor@gfleet.gov.za"
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
            <a href="#" className="text-xs text-brand-primary hover:underline font-medium">Forgot password?</a>
          </div>
          <input 
            type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit" disabled={loading}
          className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-brand-primary dark:hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition-colors mt-4 flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Don't have an account? <Link href="/register" className="text-brand-primary font-medium hover:underline">Register your department</Link>
      </p>
    </div>
  );
}