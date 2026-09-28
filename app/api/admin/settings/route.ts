import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";
import { recordAuditLog } from "@/lib/services/audit";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !hasPermission(session, "settings.view")) {
      return apiError("Unauthorized to view settings", 403);
    }

    const settings = await prisma.applicationSetting.findMany({
      orderBy: [{ group: "asc" }, { key: "asc" }],
    });

    return apiSuccess({ settings });
  } catch (error) {
    console.error("Admin settings GET error:", error);
    return apiError("Failed to fetch application settings", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !hasPermission(session, "settings.update")) {
      return apiError("Unauthorized to update settings", 403);
    }

    const body = await req.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return apiError("Key and value are required", 422);
    }

    const setting = await prisma.applicationSetting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value), group: "GENERAL" },
    });

    await recordAuditLog({
      userId: session.userId,
      actorName: session.name,
      actorEmail: session.email,
      action: "SETTING_UPDATED",
      entity: "ApplicationSetting",
      entityId: key,
      details: { key, value },
    });

    return apiSuccess({ setting }, "Application setting saved successfully");
  } catch (error) {
    console.error("Admin settings PUT error:", error);
    return apiError("Failed to update application setting", 500);
  }
}
