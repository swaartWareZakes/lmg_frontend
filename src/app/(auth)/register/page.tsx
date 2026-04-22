// --- ./src/app/(auth)/register/page.tsx ---
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Car, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";

const DEPARTMENTS = [
  "SAPS",
  "Department of Health",
  "Department of Public Works",
  "Department of Transport",
  "LMG-Fleet Management Entity"
];

const ROLES = [
  { label: "Fleet Administrator (Full Access)", value: "admin" },
  { label: "LMG Assessor / Estimator", value: "assessor" },
  { label: "Workshop Technician", value: "technician" },
  { label: "Fleet Driver / Operator", value: "driver" } // NEW DRIVER ROLE
];

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState(DEPARTMENTS[0]);
  const [role, setRole] = useState(ROLES[0].value);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });

      if (authError) throw authError;

      if (authData.session) {
        await api.post("/orgs/", {
          name: orgName,
          type: "g_fleet",
          full_name: fullName,
          role: role
        });
        router.push("/dashboard");
      } else {
        setError("Registration successful! Please check your email.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center gap-2 text-xl font-bold mb-8 lg:hidden text-zinc-900 dark:text-zinc-50">
         <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white"><Car size={18} /></div>
         LMG-Fleet
      </div>
      <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Create an account</h2>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8">Register your government department profile to get started.</p>

      {error && <div className="mb-4 p-3 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-lg">{error}</div>}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Full Name</label>
          <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark px-4 py-3 text-sm focus:ring-2 focus:ring-brand-primary" placeholder="e.g. Sipho Mokoena" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Department</label>
            <select value={orgName} onChange={(e) => setOrgName(e.target.value)} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark px-4 py-3 text-sm focus:ring-2 focus:ring-brand-primary">
              {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">System Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark px-4 py-3 text-sm focus:ring-2 focus:ring-brand-primary">
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Work Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark px-4 py-3 text-sm focus:ring-2 focus:ring-brand-primary" placeholder="sipho@saps.gov.za" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card-dark px-4 py-3 text-sm focus:ring-2 focus:ring-brand-primary" placeholder="••••••••" />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-brand-primary text-white font-medium py-3 rounded-xl mt-4 flex justify-center items-center gap-2">
          {loading ? <Loader2 size={18} className="animate-spin" /> : "Register"}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-zinc-600">Already have an account? <Link href="/login" className="text-brand-primary font-medium hover:underline">Sign in instead</Link></p>
    </div>
  );
}