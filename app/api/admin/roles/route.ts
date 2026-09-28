import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !hasPermission(session, "roles.view")) {
      return apiError("Unauthorized to view roles and permissions", 403);
    }

    const [roles, permissions] = await Promise.all([
      prisma.role.findMany({
        include: {
          rolePermissions: {
            include: { permission: true },
          },
          _count: { select: { userRoles: true } },
        },
      }),
      prisma.permission.findMany({
        orderBy: [{ category: "asc" }, { name: "asc" }],
      }),
    ]);

    const formattedRoles = roles.map((r) => ({
      id: r.id,
      name: r.name,
      displayName: r.displayName,
      description: r.description,
      isSystem: r.isSystem,
      userCount: r._count.userRoles,
      permissions: r.rolePermissions.map((rp) => rp.permission.name),
    }));

    return apiSuccess({ roles: formattedRoles, permissions });
  } catch (error) {
    console.error("Admin roles GET error:", error);
    return apiError("Failed to fetch roles and permissions", 500);
  }
}
