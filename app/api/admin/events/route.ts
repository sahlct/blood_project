import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";
import { donationEventSchema } from "@/lib/validations";
import { recordAuditLog } from "@/lib/services/audit";
import { apiSuccess, apiError } from "@/lib/api/response";
import { EventStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !hasPermission(session, "events.manage")) {
      return apiError("Unauthorized to manage donation events", 403);
    }

    const events = await prisma.donationEvent.findMany({
      orderBy: { startDate: "desc" },
      include: {
        district: { select: { name: true } },
        _count: { select: { registrations: true, donationRecords: true } },
      },
    });

    const formatted = events.map((e) => ({
      id: e.id,
      title: e.title,
      slug: e.slug,
      venue: e.venue,
      district: e.district.name,
      address: e.address,
      startDate: e.startDate,
      endDate: e.endDate,
      targetUnits: e.targetUnits,
      registeredCount: e.registeredCount,
      organizerName: e.organizerName,
      status: e.status,
    }));

    return apiSuccess({ events: formatted });
  } catch (error) {
    console.error("Admin events GET error:", error);
    return apiError("Failed to fetch donation events", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !hasPermission(session, "events.manage")) {
      return apiError("Unauthorized to create events", 403);
    }

    const body = await req.json();
    const parsed = donationEventSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed", 422, parsed.error.flatten().fieldErrors);
    }

    const data = parsed.data;
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") + `-${Date.now().toString().slice(-4)}`;

    const event = await prisma.donationEvent.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        venue: data.venue,
        districtId: data.districtId,
        cityId: data.cityId || null,
        address: data.address,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        targetUnits: data.targetUnits,
        organizerName: data.organizerName,
        organizerPhone: data.organizerPhone,
        organizerEmail: data.organizerEmail || null,
        status: EventStatus.UPCOMING,
      },
    });

    await recordAuditLog({
      userId: session.userId,
      actorName: session.name,
      actorEmail: session.email,
      action: "EVENT_CREATED",
      entity: "DonationEvent",
      entityId: event.id,
      details: { title: event.title, date: event.startDate },
    });

    return apiSuccess({ event }, "Donation camp created successfully", 201);
  } catch (error) {
    console.error("Admin events POST error:", error);
    return apiError("Failed to create event", 500);
  }
}
