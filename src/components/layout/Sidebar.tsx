// --- ./src/components/layout/Sidebar.tsx ---
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Car,
  ShieldCheck,
  Calculator,
  BookOpen,
  Stethoscope,
  Clock,
  PieChart,
  Wrench,
  Building2,
  ChevronDown,
  AlertTriangle,
  Users,
  ClipboardList,
  Search,
  FileText,
  Truck,
  PackageSearch,
  Eye,
  ClipboardCheck,
  Database,
} from "lucide-react";
import clsx from "clsx";
import { api } from "@/lib/api";
import { hasPermission, ROLE_LABELS } from "@/lib/roles";

type UserRole =
  | "super_admin"
  | "org_admin"
  | "fleet_manager"
  | "assessor"
  | "technician"
  | "supplier"
  | "viewer"
  | "driver";

type NavItem = {
  name: string;
  href: string;
  icon: any;
  permission?: string;
};

type Profile = {
  role?: string;
  permissions?: string[];
  full_name?: string;
  organization?: any;
};

function normalizeRole(role?: string): UserRole {
  if (role === "admin") return "org_admin";
  if (role === "manager") return "fleet_manager";

  const validRoles: UserRole[] = [
    "super_admin",
    "org_admin",
    "fleet_manager",
    "assessor",
    "technician",
    "supplier",
    "viewer",
    "driver",
  ];

  if (role && validRoles.includes(role as UserRole)) {
    return role as UserRole;
  }

  return "viewer";
}

function SidebarSkeleton() {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-sidebar-dark hidden md:flex flex-col z-20">
      <div className="flex h-16 items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
        <span className="text-xl font-bold tracking-tight flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
          <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white">
            <Car size={20} />
          </div>
          LMG-Fleet
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-4">
        <div className="h-4 w-36 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <div className="h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <div className="h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <div className="h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />

        <div className="h-4 w-28 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse mt-8" />
        <div className="h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <div className="h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      </div>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="h-12 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      </div>
    </aside>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [estimationsOpen, setEstimationsOpen] = useState(true);
  const [financeOpen, setFinanceOpen] = useState(true);

  useEffect(() => {
    let mounted = true;

    api
      .get("/orgs/me")
      .then((data) => {
        if (mounted) {
          setProfile(data);
          setProfileLoaded(true);
        }
      })
      .catch(() => {
        if (mounted) {
          setProfile(null);
          setProfileLoaded(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  // if (!profileLoaded) {
  //   return <SidebarSkeleton />;
  // }

  const role = normalizeRole(profile?.role);

  const isSuperAdmin = role === "super_admin";
  const isOrgAdmin = role === "org_admin";
  const isFleetManager = role === "fleet_manager";
  const isAssessor = role === "assessor";
  const isTechnician = role === "technician";
  const isSupplier = role === "supplier";
  const isViewer = role === "viewer";
  const isDriver = role === "driver";

  const can = (permission: string) => {
    if (!profile) return false;
    return hasPermission(profile, permission as any);
  };

  const sectionTitle = useMemo(() => {
    if (isTechnician) return "Technician Operations";
    if (isAssessor) return "Assessment Desk";
    if (isSupplier) return "Supplier Desk";
    if (isDriver) return "Driver Operations";
    if (isViewer) return "Read Only Access";
    if (isSuperAdmin) return "Platform Management";
    if (isOrgAdmin) return "Organization Management";
    if (isFleetManager) return "Fleet Management";
    return "Fleet Management";
  }, [role]);

  const primaryNav = useMemo<NavItem[]>(() => {
    if (isTechnician) {
      return [
        {
          name: "Technician Dashboard",
          href: "/technician",
          icon: LayoutDashboard,
        },
        {
          name: "Assigned Jobs",
          href: "/technician/jobs",
          icon: ClipboardList,
        },
        {
          name: "Maintenance Updates",
          href: "/technician/maintenance",
          icon: Wrench,
        },
        {
          name: "Repair Issues",
          href: "/dashboard/issues",
          icon: AlertTriangle,
          permission: "maintenance:read",
        },
      ].filter((item) => !item.permission || can(item.permission));
    }

    if (isAssessor) {
      return [
        {
          name: "Assessor Dashboard",
          href: "/dashboard/estimations",
          icon: Calculator,
          permission: "assessments:write",
        },
        {
          name: "Vehicle Register",
          href: "/dashboard/fleet",
          icon: Car,
          permission: "vehicles:read",
        },
        {
          name: "Draft Assessments",
          href: "/dashboard/estimations/drafts",
          icon: FileText,
          permission: "assessments:read",
        },
        {
          name: "Repair Issues",
          href: "/dashboard/issues",
          icon: AlertTriangle,
          permission: "maintenance:read",
        },
      ].filter((item) => !item.permission || can(item.permission));
    }

    if (isSupplier) {
      return [
        {
          name: "Supplier Dashboard",
          href: "/dashboard/estimations/drafts",
          icon: PackageSearch,
          permission: "assessments:read",
        },
        {
          name: "Quote Requests",
          href: "/dashboard/estimations/drafts",
          icon: Calculator,
          permission: "assessments:read",
        },
      ].filter((item) => !item.permission || can(item.permission));
    }

    if (isDriver) {
      return [
        {
          name: "Driver Portal",
          href: "/dashboard",
          icon: Truck,
        },
        {
          name: "My Vehicle",
          href: "/dashboard/fleet",
          icon: Car,
          permission: "vehicles:read",
        },
        {
          name: "Report Issue",
          href: "/dashboard/issues",
          icon: AlertTriangle,
          permission: "maintenance:write",
        },
        {
          name: "Maintenance History",
          href: "/dashboard/maintenance",
          icon: ClipboardList,
          permission: "maintenance:read",
        },
      ].filter((item) => !item.permission || can(item.permission));
    }

    if (isViewer) {
      return [
        {
          name: "Read Only Overview",
          href: "/dashboard",
          icon: Eye,
        },
        {
          name: "Vehicle Register",
          href: "/dashboard/fleet",
          icon: Car,
          permission: "vehicles:read",
        },
        {
          name: "Maintenance Logs",
          href: "/dashboard/maintenance",
          icon: ClipboardList,
          permission: "maintenance:read",
        },
        {
          name: "Compliance & Risk",
          href: "/dashboard/compliance",
          icon: ShieldCheck,
          permission: "compliance:read",
        },
      ].filter((item) => !item.permission || can(item.permission));
    }

    return [
      {
        name: "Fleet Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "Vehicle Register",
        href: "/dashboard/fleet",
        icon: Car,
        permission: "vehicles:read",
      },
      {
        name: "Active Issues",
        href: "/dashboard/issues",
        icon: AlertTriangle,
        permission: "maintenance:read",
      },
      {
        name: "Maintenance Logs",
        href: "/dashboard/maintenance",
        icon: Wrench,
        permission: "maintenance:read",
      },
      {
        name: "Compliance & Risk",
        href: "/dashboard/compliance",
        icon: ShieldCheck,
        permission: "compliance:read",
      },
    ].filter((item) => !item.permission || can(item.permission));
  }, [profile, role]);

  const technicianTools = useMemo<NavItem[]>(() => {
    if (!isTechnician) return [];

    return [
      {
        name: "Quick VIN Lookup",
        href: "/technician/vin",
        icon: Search,
      },
      {
        name: "OEM Benchmark",
        href: "/technician/oem-estimates",
        icon: Calculator,
      },
      {
        name: "Repair Guidance",
        href: "/technician/guidance",
        icon: BookOpen,
      },
      {
        name: "Diagnostics Assist",
        href: "/dashboard/diagnostics",
        icon: Stethoscope,
        permission: "oem:read",
      },
      {
        name: "Service Schedules",
        href: "/dashboard/service",
        icon: Clock,
        permission: "oem:read",
      },
    ].filter((item) => !item.permission || can(item.permission));
  }, [profile, role]);

  const generalTechTools = useMemo<NavItem[]>(() => {
    if (isTechnician) return [];

    return [
      {
        name: "Technical Database",
        href: "/dashboard/technical",
        icon: BookOpen,
        permission: "oem:read",
      },
      {
        name: "Diagnostics Assist",
        href: "/dashboard/diagnostics",
        icon: Stethoscope,
        permission: "oem:read",
      },
      {
        name: "Service Schedules",
        href: "/dashboard/service",
        icon: Clock,
        permission: "oem:read",
      },
    ].filter((item) => !item.permission || can(item.permission));
  }, [profile, role]);

  const showFinance =
    !isTechnician &&
    !isSupplier &&
    !isDriver &&
    can("finance:read");

  const showEstimations =
    !isTechnician &&
    !isDriver &&
    can("assessments:read");

  const showAdmin = can("users:manage");

  if (!profileLoaded) {
  return <SidebarSkeleton />;
}

  const renderLinks = (items: NavItem[]) =>
    items.map((item) => {
      const isActive =
        item.href === "/dashboard"
          ? pathname === "/dashboard"
          : pathname === item.href || pathname.startsWith(`${item.href}/`);

      return (
        <Link
          key={`${item.name}-${item.href}`}
          href={item.href}
          className={clsx(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium",
            isActive
              ? "bg-brand-primary/10 text-brand-primary"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          )}
        >
          <item.icon
            size={18}
            className={isActive ? "text-brand-primary" : "opacity-70"}
          />
          {item.name}
        </Link>
      );
    });

  const roleLabel = ROLE_LABELS[role] || role;

  return (
    <aside className="fixed inset-y-0 left-0 w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-sidebar-dark hidden md:flex flex-col z-20">
      <div className="flex h-16 items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
        <span className="text-xl font-bold tracking-tight flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
          <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white">
            <Car size={20} />
          </div>
          LMG-Fleet
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-6">
        <div>
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">
            {sectionTitle}
          </div>
          <div className="flex flex-col gap-1">{renderLinks(primaryNav)}</div>
        </div>

        {technicianTools.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">
              Repair Tools
            </div>
            <div className="flex flex-col gap-1">{renderLinks(technicianTools)}</div>
          </div>
        )}

        {showFinance && (
          <div>
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">
              Financial Study
            </div>

            <div className="flex flex-col gap-1">
              <button
                onClick={() => setFinanceOpen(!financeOpen)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium w-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <PieChart size={18} className="opacity-70" />
                  Cost Analytics
                </div>
                <ChevronDown
                  size={16}
                  className={clsx(
                    "transition-transform",
                    financeOpen && "rotate-180"
                  )}
                />
              </button>

              {financeOpen && (
                <div className="ml-9 mt-1 flex flex-col gap-1 border-l-2 border-zinc-100 dark:border-zinc-800 pl-2">
                  <Link
                    href="/dashboard/finance"
                    className="px-3 py-2 text-sm text-zinc-500 hover:text-brand-primary"
                  >
                    Overview & Savings
                  </Link>
                  <Link
                    href="/dashboard/finance/study"
                    className="px-3 py-2 text-sm text-zinc-500 hover:text-brand-primary"
                  >
                    Vehicle Cost Study
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {showEstimations && (
          <div>
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">
              LMG Estimations
            </div>

            <div className="flex flex-col gap-1">
              <button
                onClick={() => setEstimationsOpen(!estimationsOpen)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium w-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <Calculator size={18} className="opacity-70" />
                  Core Engine
                </div>
                <ChevronDown
                  size={16}
                  className={clsx(
                    "transition-transform",
                    estimationsOpen && "rotate-180"
                  )}
                />
              </button>

              {estimationsOpen && (
                <div className="ml-9 mt-1 flex flex-col gap-1 border-l-2 border-zinc-100 dark:border-zinc-800 pl-2">
                  {can("assessments:write") && (
                    <Link
                      href="/dashboard/estimations"
                      className="px-3 py-2 text-sm text-zinc-500 hover:text-brand-primary"
                    >
                      + New Assessment
                    </Link>
                  )}

                  <Link
                    href="/dashboard/estimations/drafts"
                    className="px-3 py-2 text-sm text-zinc-500 hover:text-brand-primary"
                  >
                    Drafts / Pending
                  </Link>

                  {can("assessments:approve") && (
                    <Link
                      href="/dashboard/estimations/approvals"
                      className="px-3 py-2 text-sm text-zinc-500 hover:text-brand-primary"
                    >
                      Finance Approvals
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {generalTechTools.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">
              Tech Tools
            </div>
            <div className="flex flex-col gap-1">{renderLinks(generalTechTools)}</div>
          </div>
        )}

        {showAdmin && (
          <div>
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">
              Administration
            </div>
            <div className="flex flex-col gap-1">
              {renderLinks([
                {
                  name: "Admin Control",
                  href: "/dashboard/admin",
                  icon: LayoutDashboard,
                },
                {
                  name: "All Jobs",
                  href: "/dashboard/admin/jobs",
                  icon: ClipboardList,
                },
                {
                  name: "Approval Queue",
                  href: "/dashboard/admin/approvals",
                  icon: ShieldCheck,
                },
                {
                  name: "Users & Roles",
                  href: "/dashboard/admin/users",
                  icon: Users,
                },
                {
                  name: "Pricing Matrix",
                  href: "/dashboard/admin/pricing",
                  icon: Database,
                },
                {
                  name: "Parts Inventory",
                  href: "/dashboard/admin/parts",
                  icon: PackageSearch,
                },
                {
                  name: "Role Permissions",
                  href: "/dashboard/users/roles",
                  icon: ClipboardCheck,
                },
              ])}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500">
            <Building2 size={16} />
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-xs text-zinc-500 font-medium">Logged in as</span>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
              {roleLabel}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}