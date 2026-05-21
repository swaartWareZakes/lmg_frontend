// --- ./src/components/layout/Sidebar.tsx ---
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, Car, ShieldCheck, Calculator, BookOpen, Stethoscope,
  Clock, PieChart, Wrench, Building2, ChevronDown, AlertTriangle, Users
} from "lucide-react";
import clsx from "clsx";
import { api } from "@/lib/api";
import { hasPermission, ROLE_LABELS } from "@/lib/roles";

type NavItem = {
  name: string;
  href: string;
  icon: any;
  permission?: string;
};

export default function Sidebar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);
  const [estimationsOpen, setEstimationsOpen] = useState(true);
  const [financeOpen, setFinanceOpen] = useState(true);

  useEffect(() => {
    api.get("/orgs/me").then(setProfile).catch(() => {});
  }, []);

  const isDriver = profile?.role === "driver";

  const can = (permission: string) => hasPermission(profile, permission as any);

  const fleetNav = useMemo<NavItem[]>(() => [
    { name: isDriver ? "Driver Portal" : "Fleet Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Vehicle Register", href: "/dashboard/fleet", icon: Car, permission: "vehicles:read" },
    { name: "Active Issues", href: "/dashboard/issues", icon: AlertTriangle, permission: "maintenance:read" },
    { name: "Maintenance Logs", href: "/dashboard/maintenance", icon: Wrench, permission: "maintenance:read" },
    { name: "Compliance & Risk", href: "/dashboard/compliance", icon: ShieldCheck, permission: "compliance:read" },
  ].filter(item => !item.permission || can(item.permission)), [profile, isDriver]);

  const techNav = [
    { name: "Technical Database", href: "/dashboard/technical", icon: BookOpen, permission: "oem:read" },
    { name: "Diagnostics Assist", href: "/dashboard/diagnostics", icon: Stethoscope, permission: "oem:read" },
    { name: "Service Schedules", href: "/dashboard/service", icon: Clock, permission: "oem:read" },
  ].filter(item => can(item.permission));

  const renderLinks = (items: NavItem[]) => (
    items.map((item) => {
      const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
      return (
        <Link
          key={item.name}
          href={item.href}
          className={clsx(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium",
            isActive
              ? "bg-brand-primary/10 text-brand-primary"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          )}
        >
          <item.icon size={18} className={isActive ? "text-brand-primary" : "opacity-70"} />
          {item.name}
        </Link>
      );
    })
  );

  return (
    <aside className="fixed inset-y-0 left-0 w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-sidebar-dark hidden md:flex flex-col z-20">
      <div className="flex h-16 items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
        <span className="text-xl font-bold tracking-tight flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
          <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white"><Car size={20} /></div>
          VRESS-Fleet
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-6">
        <div>
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">
            {isDriver ? "Operations" : "Fleet Management"}
          </div>
          <div className="flex flex-col gap-1">{renderLinks(fleetNav)}</div>
        </div>

        {can("finance:read") && (
          <div>
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">Financial Study</div>
            <div className="flex flex-col gap-1">
              <button onClick={() => setFinanceOpen(!financeOpen)} className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium w-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <div className="flex items-center gap-3"><PieChart size={18} className="opacity-70" /> Cost Analytics</div>
                <ChevronDown size={16} className={clsx("transition-transform", financeOpen && "rotate-180")} />
              </button>
              {financeOpen && (
                <div className="ml-9 mt-1 flex flex-col gap-1 border-l-2 border-zinc-100 dark:border-zinc-800 pl-2">
                  <Link href="/dashboard/finance" className="px-3 py-2 text-sm text-zinc-500 hover:text-brand-primary">Overview & Savings</Link>
                  <Link href="/dashboard/finance/study" className="px-3 py-2 text-sm text-zinc-500 hover:text-brand-primary">Vehicle Cost Study</Link>
                </div>
              )}
            </div>
          </div>
        )}

        {can("assessments:read") && (
          <div>
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">VRESS Estimations</div>
            <div className="flex flex-col gap-1">
              <button onClick={() => setEstimationsOpen(!estimationsOpen)} className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium w-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <div className="flex items-center gap-3"><Calculator size={18} className="opacity-70" /> Core Engine</div>
                <ChevronDown size={16} className={clsx("transition-transform", estimationsOpen && "rotate-180")} />
              </button>
              {estimationsOpen && (
                <div className="ml-9 mt-1 flex flex-col gap-1 border-l-2 border-zinc-100 dark:border-zinc-800 pl-2">
                  {can("assessments:write") && <Link href="/dashboard/estimations" className="px-3 py-2 text-sm text-zinc-500 hover:text-brand-primary">+ New Assessment</Link>}
                  <Link href="/dashboard/estimations/drafts" className="px-3 py-2 text-sm text-zinc-500 hover:text-brand-primary">Drafts / Pending</Link>
                  {can("assessments:approve") && <Link href="/dashboard/estimations/approvals" className="px-3 py-2 text-sm text-zinc-500 hover:text-brand-primary">Finance Approvals</Link>}
                </div>
              )}
            </div>
          </div>
        )}

        {techNav.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">Tech Tools</div>
            <div className="flex flex-col gap-1">{renderLinks(techNav)}</div>
          </div>
        )}

        {can("users:manage") && (
          <div>
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">Administration</div>
            <div className="flex flex-col gap-1">
              {renderLinks([{ name: "Users & Roles", href: "/dashboard/users", icon: Users }])}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500"><Building2 size={16} /></div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-zinc-500 font-medium">Logged in as</span>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
              {profile ? ROLE_LABELS[profile.role] || profile.role : "Loading..."}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
