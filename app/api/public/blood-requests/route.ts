import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { bloodRequestSchema } from "@/lib/validations";
import { notificationService } from "@/lib/services/notification";
import { recordAuditLog } from "@/lib/services/audit";
import { apiSuccess, apiError } from "@/lib/api/response";
import { BloodRequestStatus, Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bloodGroupParam = searchParams.get("bloodGroup");
    const districtParam = searchParams.get("district");
    const urgencyParam = searchParams.get("urgency");

    const where: Prisma.BloodRequestWhereInput = {
      status: BloodRequestStatus.ACTIVE,
      publicVisible: true,
    };

    if (bloodGroupParam && bloodGroupParam !== "ALL") {
      where.bloodGroup = { group: bloodGroupParam };
    }

    if (districtParam && districtParam !== "ALL") {
      where.district = {
        OR: [{ id: districtParam }, { name: { equals: districtParam, mode: "insensitive" } }],
      };
    }

    if (urgencyParam && urgencyParam !== "ALL") {
      where.urgency = urgencyParam as any;
    }

    const requests = await prisma.bloodRequest.findMany({
      where,
      orderBy: [
        { urgency: "desc" }, // CRITICAL first
        { requiredDate: "asc" },
      ],
      include: {
        bloodGroup: { select: { group: true, rhFactor: true } },
        district: { select: { name: true } },
        city: { select: { name: true } },
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
      hospitalAddress: r.hospitalAddress,
      district: r.district.name,
      city: r.city?.name || null,
      contactPerson: r.contactPerson,
      contactPhone: r.contactPhone,
      notes: r.notes,
      createdAt: r.createdAt,
    }));

    return apiSuccess({ requests: formatted });
  } catch (error) {
    console.error("Blood requests GET error:", error);
    return apiError("Failed to fetch blood requests", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bloodRequestSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed", 422, parsed.error.flatten().fieldErrors);
    }

    const data = parsed.data;
    const refNum = `REQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRequest = await prisma.bloodRequest.create({
      data: {
        referenceNumber: refNum,
        patientName: data.patientName,
        bloodGroupId: data.bloodGroupId,
        unitsRequired: data.unitsRequired,
        urgency: data.urgency,
        requiredDate: new Date(data.requiredDate),
        hospitalName: data.hospitalName,
        hospitalAddress: data.hospitalAddress || null,
        districtId: data.districtId,
        cityId: data.cityId || null,
        contactPerson: data.contactPerson,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail || null,
        notes: data.notes || null,
        status: BloodRequestStatus.ACTIVE,
        publicVisible: true,
      },
      include: {
        bloodGroup: true,
        district: true,
      },
    });

    // Notify admins of new urgent requirement
    await notificationService.notifyAdmins(
      `🚨 New Blood Request: ${newRequest.bloodGroup.group} (${newRequest.urgency})`,
      `${newRequest.patientName} at ${newRequest.hospitalName}, ${newRequest.district.name} needs ${newRequest.unitsRequired} unit(s) of ${newRequest.bloodGroup.group} blood.`
    );

    // Audit log
    await recordAuditLog({
      actorName: data.contactPerson,
      actorEmail: data.contactEmail || "public-requester",
      action: "BLOOD_REQUEST_CREATED",
      entity: "BloodRequest",
      entityId: newRequest.id,
      details: { ref: refNum, urgency: data.urgency, bloodGroup: newRequest.bloodGroup.group },
    });

    return apiSuccess(
      {
        id: newRequest.id,
        referenceNumber: newRequest.referenceNumber,
      },
      "Your urgent blood request has been published across the network.",
      201
    );
  } catch (error) {
    console.error("Blood requests POST error:", error);
    return apiError("Failed to submit blood request", 500);
  }
}
