import prisma from "@/lib/prisma";
import { calculateDonorEligibility } from "./eligibility";
import { recordAuditLog } from "./audit";
import { notificationService } from "./notification";
import { AvailabilityStatus, VerificationStatus, DonationType, DonationStatus } from "@prisma/client";

export interface DuplicateCheckResult {
  hasDuplicate: boolean;
  duplicateReasons: string[];
  existingDonorId?: string;
  existingUserId?: string;
}

/**
 * Checks for potential duplicate donor registrations by phone, email, or member profile.
 */
export async function detectDuplicateDonor(params: {
  phone: string;
  email: string;
  fullName: string;
  dateOfBirth?: Date | null;
}): Promise<DuplicateCheckResult> {
  const reasons: string[] = [];
  let existingDonorId: string | undefined;
  let existingUserId: string | undefined;

  // 1. Check existing user by email
  const existingUser = await prisma.user.findUnique({
    where: { email: params.email.toLowerCase().trim() },
    include: { donorProfile: true },
  });

  if (existingUser) {
    reasons.push(`An account with the email "${params.email}" already exists.`);
    existingUserId = existingUser.id;
    if (existingUser.donorProfile) {
      existingDonorId = existingUser.donorProfile.id;
    }
  }

  // 2. Check existing donor/member with the same phone number
  const existingMemberWithPhone = await prisma.memberProfile.findFirst({
    where: { phone: params.phone.trim() },
    include: { user: { include: { donorProfile: true } } },
  });

  if (existingMemberWithPhone) {
    reasons.push(`A registered member with phone number "${params.phone}" already exists.`);
    if (!existingUserId) existingUserId = existingMemberWithPhone.userId;
    if (!existingDonorId && existingMemberWithPhone.user.donorProfile) {
      existingDonorId = existingMemberWithPhone.user.donorProfile.id;
    }
  }

  return {
    hasDuplicate: reasons.length > 0,
    duplicateReasons: reasons,
    existingDonorId,
    existingUserId,
  };
}

/**
 * Approves a pending donor profile (Admin action).
 */
export async function approveDonor(params: {
  donorProfileId: string;
  adminUserId: string;
  adminName: string;
  adminEmail: string;
  notes?: string;
}) {
  const donor = await prisma.donorProfile.findUnique({
    where: { id: params.donorProfileId },
    include: { user: true },
  });

  if (!donor) throw new Error("Donor not found");

  const eligibility = await calculateDonorEligibility({
    lastDonationDate: donor.lastDonationDate,
    availabilityStatus: donor.availabilityStatus,
    verificationStatus: VerificationStatus.APPROVED,
  });

  const updated = await prisma.donorProfile.update({
    where: { id: params.donorProfileId },
    data: {
      verificationStatus: VerificationStatus.APPROVED,
      verifiedAt: new Date(),
      verifiedById: params.adminUserId,
      isEligible: eligibility.eligible,
      nextEligibleDonationDate: eligibility.nextEligibleDate,
      internalNotes: params.notes || donor.internalNotes,
    },
  });

  // Record audit log
  await recordAuditLog({
    userId: params.adminUserId,
    actorName: params.adminName,
    actorEmail: params.adminEmail,
    action: "DONOR_APPROVED",
    entity: "DonorProfile",
    entityId: params.donorProfileId,
    details: { previousStatus: donor.verificationStatus, newStatus: VerificationStatus.APPROVED },
  });

  // Notify the donor
  await notificationService.notify({
    userId: donor.userId,
    title: "Donor Profile Approved",
    message: "Your blood donor registration has been verified and approved. Thank you for your commitment to saving lives!",
    type: "SUCCESS",
    link: "/dashboard",
    sendEmail: true,
    recipientEmail: donor.user.email,
  });

  return updated;
}

/**
 * Rejects a donor profile with reason (Admin action).
 */
export async function rejectDonor(params: {
  donorProfileId: string;
  adminUserId: string;
  adminName: string;
  adminEmail: string;
  reason: string;
}) {
  const donor = await prisma.donorProfile.findUnique({
    where: { id: params.donorProfileId },
    include: { user: true },
  });

  if (!donor) throw new Error("Donor not found");

  const updated = await prisma.donorProfile.update({
    where: { id: params.donorProfileId },
    data: {
      verificationStatus: VerificationStatus.REJECTED,
      rejectionReason: params.reason,
      isEligible: false,
    },
  });

  await recordAuditLog({
    userId: params.adminUserId,
    actorName: params.adminName,
    actorEmail: params.adminEmail,
    action: "DONOR_REJECTED",
    entity: "DonorProfile",
    entityId: params.donorProfileId,
    details: { reason: params.reason },
  });

  await notificationService.notify({
    userId: donor.userId,
    title: "Donor Profile Status Update",
    message: `Your donor registration could not be approved at this time. Reason: ${params.reason}`,
    type: "WARNING",
    link: "/dashboard",
  });

  return updated;
}

/**
 * Records a completed donation and automatically updates donor eligibility and logs audit trail.
 */
export async function recordCompletedDonation(params: {
  donorProfileId: string;
  donationDate: Date;
  donationCenterId?: string;
  donationEventId?: string;
  donationType?: DonationType;
  unitsDonated?: number;
  notes?: string;
  createdById: string;
  actorName: string;
  actorEmail: string;
}) {
  // 1. Create Donation Record
  const record = await prisma.donationRecord.create({
    data: {
      donorProfileId: params.donorProfileId,
      donationDate: params.donationDate,
      donationCenterId: params.donationCenterId || null,
      donationEventId: params.donationEventId || null,
      donationType: params.donationType || DonationType.WHOLE_BLOOD,
      unitsDonated: params.unitsDonated || 1.0,
      status: DonationStatus.COMPLETED,
      notes: params.notes,
      createdById: params.createdById,
    },
  });

  // 2. Fetch current donor info
  const donor = await prisma.donorProfile.findUnique({
    where: { id: params.donorProfileId },
    include: { user: true },
  });

  if (!donor) throw new Error("Donor profile not found");

  // 3. Recalculate next eligible donation date and status
  const eligibility = await calculateDonorEligibility({
    lastDonationDate: params.donationDate,
    availabilityStatus: donor.availabilityStatus,
    verificationStatus: donor.verificationStatus,
  });

  // 4. Update Donor Profile
  await prisma.donorProfile.update({
    where: { id: params.donorProfileId },
    data: {
      lastDonationDate: params.donationDate,
      nextEligibleDonationDate: eligibility.nextEligibleDate,
      isEligible: eligibility.eligible,
      totalDonations: { increment: 1 },
    },
  });

  // 5. Record Audit Trail
  await recordAuditLog({
    userId: params.createdById,
    actorName: params.actorName,
    actorEmail: params.actorEmail,
    action: "DONATION_RECORDED",
    entity: "DonationRecord",
    entityId: record.id,
    details: {
      donorProfileId: params.donorProfileId,
      donationDate: params.donationDate,
      nextEligibleDate: eligibility.nextEligibleDate,
      units: params.unitsDonated || 1.0,
    },
  });

  // 6. Notify the donor
  await notificationService.notify({
    userId: donor.userId,
    title: "Thank You for Your Blood Donation!",
    message: `Your donation on ${params.donationDate.toLocaleDateString()} has been recorded. Estimated next eligibility date: ${
      eligibility.nextEligibleDate ? eligibility.nextEligibleDate.toLocaleDateString() : "Pending calculation"
    }.`,
    type: "SUCCESS",
    link: "/dashboard/donations",
    sendEmail: true,
    recipientEmail: donor.user.email,
  });

  return record;
}
