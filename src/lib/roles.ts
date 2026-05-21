// --- ./src/lib/roles.ts ---
export type UserRole =
  | "super_admin"
  | "org_admin"
  | "fleet_manager"
  | "assessor"
  | "technician"
  | "supplier"
  | "viewer"
  | "driver"
  | "admin"; // backwards compatibility

export type Permission =
  | "*"
  | "org:read"
  | "org:update"
  | "users:manage"
  | "vehicles:read"
  | "vehicles:write"
  | "vehicles:delete"
  | "assessments:read"
  | "assessments:write"
  | "assessments:approve"
  | "maintenance:read"
  | "maintenance:write"
  | "maintenance:delete"
  | "compliance:read"
  | "compliance:write"
  | "finance:read"
  | "oem:read"
  | "reports:read"
  | "parts:read"
  | "parts:quote";

export const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  org_admin: "Organization Admin",
  admin: "Organization Admin",
  fleet_manager: "Fleet Manager",
  assessor: "Assessor / Estimator",
  technician: "Technician",
  supplier: "Supplier / Parts Provider",
  viewer: "Viewer / Auditor",
  driver: "Driver / Operator",
};

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  super_admin: ["*"],
  org_admin: [
    "org:read", "org:update", "users:manage",
    "vehicles:read", "vehicles:write", "vehicles:delete",
    "assessments:read", "assessments:write", "assessments:approve",
    "maintenance:read", "maintenance:write", "maintenance:delete",
    "compliance:read", "compliance:write",
    "finance:read", "oem:read", "reports:read",
  ],
  admin: [
    "org:read", "org:update", "users:manage",
    "vehicles:read", "vehicles:write", "vehicles:delete",
    "assessments:read", "assessments:write", "assessments:approve",
    "maintenance:read", "maintenance:write", "maintenance:delete",
    "compliance:read", "compliance:write",
    "finance:read", "oem:read", "reports:read",
  ],
  fleet_manager: [
    "org:read", "vehicles:read", "vehicles:write",
    "assessments:read", "assessments:approve",
    "maintenance:read", "maintenance:write",
    "compliance:read", "compliance:write",
    "finance:read", "oem:read", "reports:read",
  ],
  assessor: [
    "org:read", "vehicles:read",
    "assessments:read", "assessments:write",
    "maintenance:read", "maintenance:write",
    "oem:read", "reports:read",
  ],
  technician: ["org:read", "vehicles:read", "maintenance:read", "maintenance:write", "oem:read"],
  supplier: ["org:read", "assessments:read", "parts:read", "parts:quote"],
  viewer: ["org:read", "vehicles:read", "assessments:read", "maintenance:read", "compliance:read", "finance:read", "oem:read", "reports:read"],
  driver: ["org:read", "vehicles:read", "maintenance:read", "maintenance:write"],
};

export function hasPermission(profile: any, permission: Permission): boolean {
  const apiPermissions = profile?.permissions as Permission[] | undefined;
  if (apiPermissions?.includes("*") || apiPermissions?.includes(permission)) return true;

  const role = profile?.role || "viewer";
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  return rolePermissions.includes("*") || rolePermissions.includes(permission);
}
