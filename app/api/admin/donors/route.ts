import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";
import { apiSuccess, apiError } from "@/lib/api/response";
import { VerificationStatus, AvailabilityStatus, Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !hasPermission(session, "donors.view")) {
      return apiError("Unauthorized to view donors", 403);
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status"); // PENDING, APPROVED, etc.
    const bloodGroupParam = searchParams.get("bloodGroup");
    const districtParam = searchParams.get("district");
    const search = searchParams.get("search");

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "15", 10)));
    const skip = (page - 1) * limit;

    const where: Prisma.DonorProfileWhereInput = {
      deletedAt: null,
    };

    if (statusParam && statusParam !== "ALL") {
      where.verificationStatus = statusParam as VerificationStatus;
    }

    if (bloodGroupParam && bloodGroupParam !== "ALL") {
      where.bloodGroup = { group: bloodGroupParam };
    }

    if (districtParam && districtParam !== "ALL") {
      where.district = {
        OR: [{ id: districtParam }, { name: { equals: districtParam, mode: "insensitive" } }],
      };
    }

    if (search && search.trim() !== "") {
      const q = search.trim();
      where.OR = [
        { user: { name: { contains: q, mode: "insensitive" } } },
        { user: { email: { contains: q, mode: "insensitive" } } },
        { user: { phone: { contains: q, mode: "insensitive" } } },
        { locality: { contains: q, mode: "insensitive" } },
      ];
    }

    const total = await prisma.donorProfile.count({ where });

    const donors = await prisma.donorProfile.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        bloodGroup: { select: { id: true, group: true } },
        district: { select: { id: true, name: true } },
        city: { select: { id: true, name: true } },
      },
    });

    const formatted = donors.map((d) => ({
      id: d.id,
      userId: d.userId,
      name: d.user.name,
      email: d.user.email,
      phone: d.user.phone,
      bloodGroup: d.bloodGroup.group,
      district: d.district.name,
      city: d.city?.name || null,
      locality: d.locality,
      availabilityStatus: d.availabilityStatus,
      verificationStatus: d.verificationStatus,
      isEligible: d.isEligible,
      lastDonationDate: d.lastDonationDate,
      nextEligibleDonationDate: d.nextEligibleDonationDate,
      totalDonations: d.totalDonations,
      publicProfileEnabled: d.publicProfileEnabled,
      showPhonePublicly: d.showPhonePublicly,
      createdAt: d.createdAt,
      internalNotes: d.internalNotes,
    }));

    return apiSuccess({
      donors: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("Admin donors API error:", error);
    return apiError("Failed to fetch donors list", 500);
  }
}
