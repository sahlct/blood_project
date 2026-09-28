import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { donorRegistrationSchema } from "@/lib/validations";
import { hashPassword } from "@/lib/auth/password";
import { detectDuplicateDonor } from "@/lib/services/donor";
import { calculateDonorEligibility } from "@/lib/services/eligibility";
import { notificationService } from "@/lib/services/notification";
import { recordAuditLog } from "@/lib/services/audit";
import { apiSuccess, apiError } from "@/lib/api/response";
import { AvailabilityStatus, VerificationStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = donorRegistrationSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed", 422, parsed.error.flatten().fieldErrors);
    }

    const data = parsed.data;
    const cleanEmail = data.email.toLowerCase().trim();
    const cleanPhone = data.phone.trim();

    // 1. Duplicate Donor Detection
    const duplicateCheck = await detectDuplicateDonor({
      email: cleanEmail,
      phone: cleanPhone,
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
    });

    if (duplicateCheck.hasDuplicate) {
      return apiError(
        duplicateCheck.duplicateReasons[0] || "A donor or member account with these details already exists.",
        409
      );
    }

    // 2. Hash Password
    const passwordHash = await hashPassword(data.password);

    // 3. Calculate initial eligibility based on previous donation date
    const eligibility = await calculateDonorEligibility({
      lastDonationDate: data.lastDonationDate ? new Date(data.lastDonationDate) : null,
      availabilityStatus: AvailabilityStatus.AVAILABLE,
      verificationStatus: VerificationStatus.PENDING,
    });

    // 4. Create User, MemberProfile, DonorProfile, and Consent Records in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create User
      const user = await tx.user.create({
        data: {
          name: data.fullName,
          email: cleanEmail,
          phone: cleanPhone,
          passwordHash,
          status: "ACTIVE",
          emailVerified: new Date(),
        },
      });

      // Create MemberProfile
      await tx.memberProfile.create({
        data: {
          userId: user.id,
          fullName: data.fullName,
          gender: data.gender || "OTHER",
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          phone: cleanPhone,
          address: data.address || null,
        },
      });

      // Create DonorProfile with PENDING verification status
      const donor = await tx.donorProfile.create({
        data: {
          userId: user.id,
          bloodGroupId: data.bloodGroupId,
          districtId: data.districtId,
          cityId: data.cityId || null,
          locality: data.locality,
          address: data.address || null,
          availabilityStatus: AvailabilityStatus.AVAILABLE,
          verificationStatus: VerificationStatus.PENDING, // Strictly pending admin review
          publicProfileEnabled: data.publicProfileEnabled,
          showPhonePublicly: data.showPhonePublicly,
          lastDonationDate: data.lastDonationDate ? new Date(data.lastDonationDate) : null,
          nextEligibleDonationDate: eligibility.nextEligibleDate,
          isEligible: eligibility.eligible,
          consentGiven: true,
        },
      });

      // Record Legal Consents
      await tx.consentRecord.createMany({
        data: [
          {
            donorProfileId: donor.id,
            consentType: "TERMS_OF_SERVICE",
            agreed: true,
            ipAddress: req.headers.get("x-forwarded-for") || undefined,
          },
          {
            donorProfileId: donor.id,
            consentType: "PRIVACY_POLICY",
            agreed: true,
            ipAddress: req.headers.get("x-forwarded-for") || undefined,
          },
          {
            donorProfileId: donor.id,
            consentType: "PUBLIC_DIRECTORY_LISTING",
            agreed: data.publicProfileEnabled,
            ipAddress: req.headers.get("x-forwarded-for") || undefined,
          },
        ],
      });

      return { user, donor };
    });

    // 5. Notify Admins about new donor pending verification
    await notificationService.notifyAdmins(
      "📋 New Donor Registration Pending Review",
      `${data.fullName} registered as a blood donor in locality ${data.locality}. Awaiting moderator verification.`
    );

    // 6. Record Audit Trail
    await recordAuditLog({
      userId: result.user.id,
      actorName: data.fullName,
      actorEmail: cleanEmail,
      action: "DONOR_REGISTERED_PUBLIC",
      entity: "DonorProfile",
      entityId: result.donor.id,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return apiSuccess(
      {
        donorId: result.donor.id,
        verificationStatus: result.donor.verificationStatus,
      },
      "Your registration has been submitted successfully! Our moderators will verify your profile shortly before publishing to the directory.",
      201
    );
  } catch (error) {
    console.error("Become a donor API error:", error);
    return apiError("An unexpected error occurred while processing your registration", 500);
  }
}
