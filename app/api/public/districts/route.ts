import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  try {
    const districts = await prisma.district.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        cities: {
          where: { isActive: true },
          orderBy: { name: "asc" },
          select: { id: true, name: true, postalCode: true },
        },
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

    const formatted = districts.map((d) => ({
      id: d.id,
      name: d.name,
      code: d.code,
      cities: d.cities,
      donorCount: d._count.donorProfiles,
    }));

    return apiSuccess({ districts: formatted });
  } catch (error) {
    console.error("Districts API error:", error);
    return apiError("Failed to fetch districts", 500);
  }
}
