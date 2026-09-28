import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";
import { recordCompletedDonation } from "@/lib/services/donor";
import { recordDonationSchema } from "@/lib/validations";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !hasPermission(session, "donations.view")) {
      return apiError("Unauthorized to view donations", 403);
    }

    const { searchParams } = new URL(req.url);
    const donorId = searchParams.get("donorId");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "15", 10));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (donorId) where.donorProfileId = donorId;

    const total = await prisma.donationRecord.count({ where });
    const records = await prisma.donationRecord.findMany({
      where,
      skip,
      take: limit,
      orderBy: { donationDate: "desc" },
      include: {
        donorProfile: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
            bloodGroup: { select: { group: true } },
            district: { select: { name: true } },
          },
        },
        donationCenter: { select: { name: true } },
        donationEvent: { select: { title: true } },
      },
    });

    const formatted = records.map((r) => ({
      id: r.id,
      donorName: r.donorProfile.user.name,
      donorEmail: r.donorProfile.user.email,
      donorPhone: r.donorProfile.user.phone,
      bloodGroup: r.donorProfile.bloodGroup.group,
      district: r.donorProfile.district.name,
      donationDate: r.donationDate,
      donationType: r.donationType,
      unitsDonated: r.unitsDonated,
      status: r.status,
      center: r.donationCenter?.name || null,
      event: r.donationEvent?.title || null,
      notes: r.notes,
      createdAt: r.createdAt,
    }));

    return apiSuccess({
      donations: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("Admin donations GET error:", error);
    return apiError("Failed to fetch donation records", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !hasPermission(session, "donations.create")) {
      return apiError("Unauthorized to record donations", 403);
    }

    const body = await req.json();
    const parsed = recordDonationSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed", 422, parsed.error.flatten().fieldErrors);
    }

    const data = parsed.data;

    const record = await recordCompletedDonation({
      donorProfileId: data.donorProfileId,
      donationDate: new Date(data.donationDate),
      donationCenterId: data.donationCenterId || undefined,
      donationEventId: data.donationEventId || undefined,
      donationType: data.donationType,
      unitsDonated: data.unitsDonated,
      notes: data.notes,
      createdById: session.userId,
      actorName: session.name,
      actorEmail: session.email,
    });

    return apiSuccess({ record }, "Donation successfully recorded and donor eligibility recalculated", 201);
  } catch (error: any) {
    console.error("Admin donations POST error:", error);
    return apiError(error.message || "Failed to record donation", 500);
  }
}
