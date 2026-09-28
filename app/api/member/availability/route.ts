import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { updateAvailabilitySchema } from "@/lib/validations";
import { calculateDonorEligibility } from "@/lib/services/eligibility";
import { recordAuditLog } from "@/lib/services/audit";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return apiError("Unauthenticated", 401);
    }

    const body = await req.json();
    const parsed = updateAvailabilitySchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed", 422, parsed.error.flatten().fieldErrors);
    }

    const donor = await prisma.donorProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!donor) {
      return apiError("Donor profile not found for this account", 404);
    }

    const { availabilityStatus, publicProfileEnabled, showPhonePublicly } = parsed.data;

    // Recalculate eligibility with the updated availability status
    const eligibility = await calculateDonorEligibility({
      lastDonationDate: donor.lastDonationDate,
      availabilityStatus,
      verificationStatus: donor.verificationStatus,
    });

    const updated = await prisma.donorProfile.update({
      where: { id: donor.id },
      data: {
        availabilityStatus,
        isEligible: eligibility.eligible,
        nextEligibleDonationDate: eligibility.nextEligibleDate,
        ...(publicProfileEnabled !== undefined && { publicProfileEnabled }),
        ...(showPhonePublicly !== undefined && { showPhonePublicly }),
      },
    });

    // Record audit event
    await recordAuditLog({
      userId: session.userId,
      actorName: session.name,
      actorEmail: session.email,
      action: "DONOR_AVAILABILITY_UPDATED",
      entity: "DonorProfile",
      entityId: donor.id,
      details: {
        previousAvailability: donor.availabilityStatus,
        newAvailability: availabilityStatus,
      },
    });

    return apiSuccess({ donor: updated }, "Availability status updated successfully");
  } catch (error) {
    console.error("Update availability error:", error);
    return apiError("Failed to update availability status", 500);
  }
}
