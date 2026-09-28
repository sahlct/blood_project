import prisma from "@/lib/prisma";

export const PERMISSIONS = {
  // Users
  USERS_VIEW: "users.view",
  USERS_CREATE: "users.create",
  USERS_UPDATE: "users.update",
  USERS_DELETE: "users.delete",
  USERS_MANAGE: "users.manage",

  // Donors
  DONORS_VIEW: "donors.view",
  DONORS_CREATE: "donors.create",
  DONORS_UPDATE: "donors.update",
  DONORS_DELETE: "donors.delete",

  // Donations
  DONATIONS_VIEW: "donations.view",
  DONATIONS_CREATE: "donations.create",
  DONATIONS_UPDATE: "donations.update",
  DONATIONS_DELETE: "donations.delete",

  // Roles & Permissions
  ROLES_VIEW: "roles.view",
  ROLES_CREATE: "roles.create",
  ROLES_UPDATE: "roles.update",
  ROLES_DELETE: "roles.delete",
  PERMISSIONS_VIEW: "permissions.view",

  // Blood Requests & Events
  BLOOD_REQUESTS_MANAGE: "blood_requests.manage",
  EVENTS_MANAGE: "events.manage",

  // Settings, Reports, Auditing, Content
  SETTINGS_VIEW: "settings.view",
  SETTINGS_UPDATE: "settings.update",
  REPORTS_VIEW: "reports.view",
  AUDIT_LOGS_VIEW: "audit_logs.view",
  CONTENT_MANAGE: "content.manage",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export interface AuthUserContext {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
}

/**
 * Checks if a user has a specific permission in memory.
 * Super Admin role automatically bypasses all permission checks.
 */
export function hasPermission(
  user: { roles: string[]; permissions: string[] } | null | undefined,
  requiredPermission: PermissionKey | string
): boolean {
  if (!user) return false;
  if (user.roles.includes("SUPER_ADMIN")) return true;
  return user.permissions.includes(requiredPermission) || user.permissions.includes("*");
}

/**
 * Checks if a user has any of the listed permissions.
 */
export function hasAnyPermission(
  user: { roles: string[]; permissions: string[] } | null | undefined,
  requiredPermissions: (PermissionKey | string)[]
): boolean {
  if (!user) return false;
  if (user.roles.includes("SUPER_ADMIN")) return true;
  return requiredPermissions.some((p) => hasPermission(user, p));
}

/**
 * Fetches all active roles and permissions for a user from the database.
 */
export async function getUserRolesAndPermissions(userId: string): Promise<{
  roles: string[];
  permissions: string[];
}> {
  try {
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    const roles: string[] = [];
    const permissionsSet = new Set<string>();

    for (const ur of userRoles) {
      roles.push(ur.role.name);
      for (const rp of ur.role.rolePermissions) {
        permissionsSet.add(rp.permission.name);
      }
    }

    return {
      roles,
      permissions: Array.from(permissionsSet),
    };
  } catch (error) {
    console.error("Error retrieving user roles/permissions:", error);
    return { roles: [], permissions: [] };
  }
}
