import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api/response";
import { AvailabilityStatus, VerificationStatus, Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const bloodGroupParam = searchParams.get("bloodGroup");
    const districtParam = searchParams.get("district");
    const cityParam = searchParams.get("city");
    const availabilityParam = searchParams.get("availability");
    const eligibleParam = searchParams.get("eligible");
    const searchQuery = searchParams.get("search");

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)));
    const skip = (page - 1) * limit;

    // Strict privacy & safety conditions:
    // Only approved donors with publicProfileEnabled = true and not deleted
    const where: Prisma.DonorProfileWhereInput = {
      verificationStatus: VerificationStatus.APPROVED,
      publicProfileEnabled: true,
      deletedAt: null,
    };

    // Filter by Blood Group
    if (bloodGroupParam && bloodGroupParam !== "ALL") {
      where.bloodGroup = {
        group: bloodGroupParam,
      };
    }

    // Filter by District (by name or id)
    if (districtParam && districtParam !== "ALL") {
      where.district = {
        OR: [{ id: districtParam }, { name: { equals: districtParam, mode: "insensitive" } }],
      };
    }

    // Filter by City
    if (cityParam && cityParam !== "ALL") {
      where.OR = [
        { city: { name: { contains: cityParam, mode: "insensitive" } } },
        { locality: { contains: cityParam, mode: "insensitive" } },
      ];
    }

    // Filter by Availability
    if (availabilityParam && availabilityParam !== "ALL") {
      if (Object.values(AvailabilityStatus).includes(availabilityParam as AvailabilityStatus)) {
        where.availabilityStatus = availabilityParam as AvailabilityStatus;
      }
    }

    // Filter by Eligibility
    if (eligibleParam === "true") {
      where.isEligible = true;
    } else if (eligibleParam === "false") {
      where.isEligible = false;
    }

    // General text search (donor name or locality)
    if (searchQuery && searchQuery.trim() !== "") {
      const q = searchQuery.trim();
      where.OR = [
        { user: { name: { contains: q, mode: "insensitive" } } },
        { locality: { contains: q, mode: "insensitive" } },
        { district: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    // Count total matching donors
    const totalDonors = await prisma.donorProfile.count({ where });

    // Fetch paginated results with strictly whitelisted public fields
    const donors = await prisma.donorProfile.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { availabilityStatus: "asc" }, // AVAILABLE first
        { updatedAt: "desc" },
      ],
      select: {
        id: true,
        availabilityStatus: true,
        verificationStatus: true,
        isEligible: true,
        nextEligibleDonationDate: true,
        lastDonationDate: true,
        totalDonations: true,
        locality: true,
        showPhonePublicly: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
            avatar: true,
            phone: true, // Only exposed if showPhonePublicly is true
          },
        },
        bloodGroup: {
          select: {
            group: true,
            rhFactor: true,
            canDonateTo: true,
          },
        },
        district: {
          select: {
            name: true,
            code: true,
          },
        },
        city: {
          select: {
            name: true,
          },
        },
      },
    });

    // Privacy-safe serialization
    const sanitized = donors.map((d) => ({
      id: d.id,
      name: d.user.name,
      avatar: d.user.avatar,
      bloodGroup: d.bloodGroup.group,
      rhFactor: d.bloodGroup.rhFactor,
      canDonateTo: d.bloodGroup.canDonateTo,
      district: d.district.name,
      city: d.city?.name || null,
      locality: d.locality || null,
      availabilityStatus: d.availabilityStatus,
      verificationStatus: d.verificationStatus,
      isEligible: d.isEligible,
      nextEligibleDonationDate: d.nextEligibleDonationDate,
      lastDonationDate: d.lastDonationDate,
      totalDonations: d.totalDonations,
      updatedAt: d.updatedAt,
      // Only include phone if donor explicitly enabled public phone display
      phone: d.showPhonePublicly ? d.user.phone : null,
      canContactSecurely: true,
    }));

    return apiSuccess({
      donors: sanitized,
      pagination: {
        total: totalDonors,
        page,
        limit,
        totalPages: Math.ceil(totalDonors / limit) || 1,
      },
    });
  } catch (error) {
    console.error("Public donor search API error:", error);
    return apiError("Failed to fetch donors", 500);
  }
}
