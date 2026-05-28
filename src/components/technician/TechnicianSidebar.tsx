"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Search,
  Calculator,
  BookOpen,
  Wrench,
  Stethoscope,
  Clock,
  Car,
} from "lucide-react";
import clsx from "clsx";

const primaryLinks = [
  { name: "Technician Home", href: "/technician", icon: LayoutDashboard },
  { name: "Assigned Jobs", href: "/technician/jobs", icon: ClipboardList },
  { name: "Maintenance Updates", href: "/technician/maintenance", icon: Wrench },
];

const toolLinks = [
  { name: "Quick VIN Lookup", href: "/technician/vin", icon: Search },
  { name: "AI Estimates", href: "/technician/ai-estimates", icon: Calculator },
  { name: "OEM Benchmark", href: "/technician/oem-estimates", icon: Calculator },
  { name: "Repair Guidance", href: "/technician/guidance", icon: BookOpen },
  { name: "Diagnostics Assist", href: "/technician/diagnostics", icon: Stethoscope },
  { name: "Service Schedules", href: "/technician/service", icon: Clock },
];

export default function TechnicianSidebar() {
  const pathname = usePathname();

  const renderLink = (item: any) => {
    const active =
      item.href === "/technician"
        ? pathname === "/technician"
        : pathname === item.href || pathname.startsWith(`${item.href}/`);

    return (
      <Link
        key={item.href}
        href={item.href}
        className={clsx(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
          active
            ? "bg-emerald-500/10 text-emerald-400"
            : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
        )}
      >
        <item.icon size={18} />
        {item.name}
      </Link>
    );
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#111318]">
      <div className="flex h-16 items-center gap-3 border-b border-zinc-800 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-white">
          <Car size={19} />
        </div>
        <div>
          <p className="text-base font-bold text-white">VRESS-Fleet</p>
          <p className="text-xs text-zinc-500">Technician Workspace</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div>
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Technician Operations
          </p>
          <div className="space-y-1">{primaryLinks.map(renderLink)}</div>
        </div>

        <div className="mt-8">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Repair Tools
          </p>
          <div className="space-y-1">{toolLinks.map(renderLink)}</div>
        </div>
      </div>

      <div className="border-t border-zinc-800 p-4">
        <div className="rounded-xl bg-zinc-900 p-3">
          <p className="text-xs text-zinc-500">Logged in as</p>
          <p className="text-sm font-bold text-zinc-100">Technician</p>
        </div>
      </div>
    </div>
  );
}
