import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";
import { apiSuccess, apiError } from "@/lib/api/response";
import { AvailabilityStatus, VerificationStatus, BloodRequestStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !hasPermission(session, "reports.view")) {
      return apiError("Unauthorized to view administrative statistics", 403);
    }

    // 1. Core Donor Metrics
    const [
      totalMembers,
      totalDonors,
      activeDonors,
      availableDonors,
      temporarilyUnavailableDonors,
      eligibleDonors,
      pendingApprovals,
      totalCompletedDonations,
      activeBloodRequests,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.donorProfile.count({ where: { deletedAt: null } }),
      prisma.donorProfile.count({
        where: { verificationStatus: VerificationStatus.APPROVED, deletedAt: null },
      }),
      prisma.donorProfile.count({
        where: {
          verificationStatus: VerificationStatus.APPROVED,
          availabilityStatus: AvailabilityStatus.AVAILABLE,
          deletedAt: null,
        },
      }),
      prisma.donorProfile.count({
        where: {
          availabilityStatus: AvailabilityStatus.TEMPORARILY_UNAVAILABLE,
          deletedAt: null,
        },
      }),
      prisma.donorProfile.count({
        where: {
          verificationStatus: VerificationStatus.APPROVED,
          isEligible: true,
          deletedAt: null,
        },
      }),
      prisma.donorProfile.count({
        where: { verificationStatus: VerificationStatus.PENDING, deletedAt: null },
      }),
      prisma.donationRecord.count({ where: { status: "COMPLETED" } }),
      prisma.bloodRequest.count({ where: { status: BloodRequestStatus.ACTIVE } }),
    ]);

    // 2. Donors by Blood Group
    const bloodGroups = await prisma.bloodGroup.findMany({
      select: {
        group: true,
        _count: {
          select: {
            donorProfiles: {
              where: { verificationStatus: VerificationStatus.APPROVED, deletedAt: null },
            },
          },
        },
      },
    });

    const donorsByBloodGroup = bloodGroups.map((bg) => ({
      name: bg.group,
      count: bg._count.donorProfiles,
    }));

    // 3. Donors by District
    const districts = await prisma.district.findMany({
      where: { isActive: true },
      take: 14,
      select: {
        name: true,
        _count: {
          select: {
            donorProfiles: {
              where: { verificationStatus: VerificationStatus.APPROVED, deletedAt: null },
            },
          },
        },
      },
      orderBy: {
        donorProfiles: {
          _count: "desc",
        },
      },
    });

    const donorsByDistrict = districts.map((d) => ({
      name: d.name,
      count: d._count.donorProfiles,
    }));

    // 4. Recent Registrations
    const recentRegistrations = await prisma.donorProfile.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        verificationStatus: true,
        user: { select: { name: true, email: true } },
        bloodGroup: { select: { group: true } },
        district: { select: { name: true } },
      },
    });

    // 5. Recent Completed Donations
    const recentDonations = await prisma.donationRecord.findMany({
      take: 5,
      orderBy: { donationDate: "desc" },
      where: { status: "COMPLETED" },
      select: {
        id: true,
        donationDate: true,
        unitsDonated: true,
        donationType: true,
        donorProfile: {
          select: {
            user: { select: { name: true } },
            bloodGroup: { select: { group: true } },
          },
        },
      },
    });

    // 6. Monthly Donation Trend (Sample for chart visualization)
    const monthlyStats = [
      { month: "May", donations: 42, newDonors: 35 },
      { month: "Jun", donations: 58, newDonors: 48 },
      { month: "Jul", donations: 70, newDonors: 60 },
      { month: "Aug", donations: 85, newDonors: 72 },
      { month: "Sep", donations: 110, newDonors: 95 },
    ];

    return apiSuccess({
      metrics: {
        totalMembers,
        totalDonors,
        activeDonors,
        availableDonors,
        temporarilyUnavailableDonors,
        eligibleDonors,
        pendingApprovals,
        totalCompletedDonations,
        activeBloodRequests,
      },
      charts: {
        donorsByBloodGroup,
        donorsByDistrict,
        monthlyStats,
      },
      recentRegistrations,
      recentDonations,
    });
  } catch (error) {
    console.error("Admin stats API error:", error);
    return apiError("Failed to calculate admin statistics", 500);
  }
}
