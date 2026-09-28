import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";
import { recordAuditLog } from "@/lib/services/audit";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !hasPermission(session, "users.view")) {
      return apiError("Unauthorized to view users", 403);
    }

    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
        donorProfile: {
          select: {
            bloodGroup: { select: { group: true } },
            verificationStatus: true,
          },
        },
      },
    });

    const formatted = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      status: u.status,
      roles: u.userRoles.map((ur) => ur.role.displayName),
      roleNames: u.userRoles.map((ur) => ur.role.name),
      isDonor: !!u.donorProfile,
      bloodGroup: u.donorProfile?.bloodGroup.group || null,
      verificationStatus: u.donorProfile?.verificationStatus || null,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
    }));

    return apiSuccess({ users: formatted });
  } catch (error) {
    console.error("Admin users GET error:", error);
    return apiError("Failed to fetch users", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !hasPermission(session, "users.manage")) {
      return apiError("Unauthorized to manage user roles", 403);
    }

    const body = await req.json();
    const { userId, roleIds } = body;

    if (!userId || !Array.isArray(roleIds)) {
      return apiError("Valid userId and roleIds array required", 422);
    }

    // Delete existing roles and assign new roles in transaction
    await prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({
        where: { userId },
      });

      for (const roleId of roleIds) {
        await tx.userRole.create({
          data: {
            userId,
            roleId,
            assignedBy: session.userId,
          },
        });
      }
    });

    await recordAuditLog({
      userId: session.userId,
      actorName: session.name,
      actorEmail: session.email,
      action: "USER_ROLES_UPDATED",
      entity: "UserRole",
      entityId: userId,
      details: { roleIds },
    });

    return apiSuccess({}, "User roles updated successfully");
  } catch (error) {
    console.error("Admin users POST error:", error);
    return apiError("Failed to update user roles", 500);
  }
}
