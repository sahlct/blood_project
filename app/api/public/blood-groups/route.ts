import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  try {
    const bloodGroups = await prisma.bloodGroup.findMany({
      where: { isActive: true },
      orderBy: { group: "asc" },
      include: {
        _count: {
          select: {
            donorProfiles: {
              where: {
                verificationStatus: "APPROVED",
                publicProfileEnabled: true,
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    const formatted = bloodGroups.map((bg) => ({
      id: bg.id,
      group: bg.group,
      rhFactor: bg.rhFactor,
      antigen: bg.antigen,
      canDonateTo: JSON.parse(bg.canDonateTo || "[]"),
      canReceiveFrom: JSON.parse(bg.canReceiveFrom || "[]"),
      description: bg.description,
      donorCount: bg._count.donorProfiles,
    }));

    return apiSuccess({ bloodGroups: formatted });
  } catch (error) {
    console.error("Blood groups API error:", error);
    return apiError("Failed to fetch blood groups", 500);
  }
}
