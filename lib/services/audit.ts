import prisma from "@/lib/prisma";

export interface CreateAuditLogParams {
  userId?: string | null;
  actorName: string;
  actorEmail: string;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: Record<string, unknown> | string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Records an administrative or security audit event in the database.
 * Omits passwords and sensitive credentials automatically.
 */
export async function recordAuditLog(params: CreateAuditLogParams): Promise<void> {
  try {
    let detailsString: string | null = null;
    if (params.details) {
      if (typeof params.details === "string") {
        detailsString = params.details;
      } else {
        // Redact any sensitive keys
        const sanitized = { ...params.details };
        const sensitiveKeys = ["password", "passwordHash", "token", "secret", "secretKey"];
        for (const key of Object.keys(sanitized)) {
          if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
            sanitized[key] = "[REDACTED]";
          }
        }
        detailsString = JSON.stringify(sanitized);
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        actorName: params.actorName,
        actorEmail: params.actorEmail,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        details: detailsString,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent ? params.userAgent.substring(0, 500) : null,
      },
    });
  } catch (error) {
    console.error("Failed to record audit log:", error);
  }
}
