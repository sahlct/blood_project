import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api/response";
import { EventStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const districtParam = searchParams.get("district");

    const where: any = {
      status: { in: [EventStatus.UPCOMING, EventStatus.ONGOING] },
    };

    if (districtParam && districtParam !== "ALL") {
      where.district = {
        OR: [{ id: districtParam }, { name: { equals: districtParam, mode: "insensitive" } }],
      };
    }

    const events = await prisma.donationEvent.findMany({
      where,
      orderBy: { startDate: "asc" },
      include: {
        district: { select: { name: true } },
        city: { select: { name: true } },
      },
    });

    const formatted = events.map((e) => ({
      id: e.id,
      title: e.title,
      slug: e.slug,
      description: e.description,
      venue: e.venue,
      district: e.district.name,
      city: e.city?.name || null,
      address: e.address,
      startDate: e.startDate,
      endDate: e.endDate,
      targetUnits: e.targetUnits,
      registeredCount: e.registeredCount,
      organizerName: e.organizerName,
      organizerPhone: e.organizerPhone,
      status: e.status,
    }));

    return apiSuccess({ events: formatted });
  } catch (error) {
    console.error("Donation events GET error:", error);
    return apiError("Failed to fetch donation events", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId, fullName, phone, email, bloodGroupId } = body;

    if (!eventId || !fullName || !phone || !email || !bloodGroupId) {
      return apiError("All fields are required for camp registration", 422);
    }

    const event = await prisma.donationEvent.findUnique({
      where: { id: eventId },
    });

    if (!event || event.status !== EventStatus.UPCOMING) {
      return apiError("This donation camp is not open for registration", 400);
    }

    // Check existing registration by phone
    const existing = await prisma.eventRegistration.findFirst({
      where: { eventId, phone },
    });

    if (existing) {
      return apiError("You have already registered for this donation event", 409);
    }

    // Register user and increment count in transaction
    const reg = await prisma.$transaction(async (tx) => {
      const registration = await tx.eventRegistration.create({
        data: {
          eventId,
          fullName,
          phone,
          email,
          bloodGroupId,
        },
      });

      await tx.donationEvent.update({
        where: { id: eventId },
        data: { registeredCount: { increment: 1 } },
      });

      return registration;
    });

    return apiSuccess({ registration: reg }, "Successfully registered for the donation camp!", 201);
  } catch (error) {
    console.error("Event registration POST error:", error);
    return apiError("Failed to register for donation camp", 500);
  }
}
