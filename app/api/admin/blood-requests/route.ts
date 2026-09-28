import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";
import { recordAuditLog } from "@/lib/services/audit";
import { apiSuccess, apiError } from "@/lib/api/response";
import { BloodRequestStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !hasPermission(session, "blood_requests.manage")) {
      return apiError("Unauthorized to manage blood requests", 403);
    }

    const requests = await prisma.bloodRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        bloodGroup: { select: { group: true } },
        district: { select: { name: true } },
      },
    });

    const formatted = requests.map((r) => ({
      id: r.id,
      referenceNumber: r.referenceNumber,
      patientName: r.patientName,
      bloodGroup: r.bloodGroup.group,
      unitsRequired: r.unitsRequired,
      urgency: r.urgency,
      requiredDate: r.requiredDate,
      hospitalName: r.hospitalName,
      contactPerson: r.contactPerson,
      contactPhone: r.contactPhone,
      status: r.status,
      publicVisible: r.publicVisible,
      createdAt: r.createdAt,
    }));

    return apiSuccess({ requests: formatted });
  } catch (error) {
    console.error("Admin blood requests GET error:", error);
    return apiError("Failed to fetch blood requests", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !hasPermission(session, "blood_requests.manage")) {
      return apiError("Unauthorized to update blood requests", 403);
    }

    const body = await req.json();
    const { id, status, publicVisible } = body;

    if (!id || !status) {
      return apiError("ID and status are required", 422);
    }

    const updated = await prisma.bloodRequest.update({
      where: { id },
      data: {
        status: status as BloodRequestStatus,
        ...(publicVisible !== undefined && { publicVisible }),
      },
    });

    await recordAuditLog({
      userId: session.userId,
      actorName: session.name,
      actorEmail: session.email,
      action: "BLOOD_REQUEST_MODERATED",
      entity: "BloodRequest",
      entityId: id,
      details: { newStatus: status, publicVisible },
    });

    return apiSuccess({ request: updated }, "Blood request updated successfully");
  } catch (error) {
    console.error("Admin blood requests PATCH error:", error);
    return apiError("Failed to update blood request", 500);
  }
}
