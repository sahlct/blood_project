import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !hasPermission(session, "audit_logs.view")) {
      return apiError("Unauthorized to view audit logs", 403);
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "20", 10));
    const action = searchParams.get("action");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (action && action !== "ALL") {
      where.action = action;
    }

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return apiSuccess({
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("Admin audit logs GET error:", error);
    return apiError("Failed to fetch audit logs", 500);
  }
}
