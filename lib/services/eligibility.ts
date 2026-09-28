import { addDays, isAfter, isBefore, differenceInDays } from "date-fns";
import { getNumericSetting } from "./settings";
import { AvailabilityStatus, VerificationStatus } from "@prisma/client";

export interface EligibilityResult {
  eligible: boolean;
  nextEligibleDate: Date | null;
  reason: string;
  daysRemaining: number;
  disclaimer: string;
}

export const MEDICAL_DISCLAIMER =
  "Note: This is an automated calculation based on your last recorded donation date. Final donation eligibility is always subject to on-site medical and hemoglobin screening at the donation center.";

/**
 * Calculates blood donation eligibility for a donor.
 * Does not hardcode intervals; reads from database configuration with fallback.
 */
export async function calculateDonorEligibility(params: {
  lastDonationDate: Date | string | null | undefined;
  availabilityStatus?: AvailabilityStatus;
  verificationStatus?: VerificationStatus;
  customIntervalDays?: number;
}): Promise<EligibilityResult> {
  const { lastDonationDate, availabilityStatus, verificationStatus, customIntervalDays } = params;

  // 1. Check verification status
  if (verificationStatus === VerificationStatus.PENDING) {
    return {
      eligible: false,
      nextEligibleDate: null,
      reason: "Your donor profile is currently pending administrative verification.",
      daysRemaining: 0,
      disclaimer: MEDICAL_DISCLAIMER,
    };
  }

  if (verificationStatus === VerificationStatus.REJECTED) {
    return {
      eligible: false,
      nextEligibleDate: null,
      reason: "Your donor profile is currently not approved for donations.",
      daysRemaining: 0,
      disclaimer: MEDICAL_DISCLAIMER,
    };
  }

  // 2. Check availability status
  if (availabilityStatus === AvailabilityStatus.TEMPORARILY_UNAVAILABLE) {
    return {
      eligible: false,
      nextEligibleDate: null,
      reason: "You have marked yourself as temporarily unavailable for donations.",
      daysRemaining: 0,
      disclaimer: MEDICAL_DISCLAIMER,
    };
  }

  if (
    availabilityStatus === AvailabilityStatus.NOT_AVAILABLE ||
    availabilityStatus === AvailabilityStatus.INACTIVE
  ) {
    return {
      eligible: false,
      nextEligibleDate: null,
      reason: "Your donor availability is currently set to inactive or not available.",
      daysRemaining: 0,
      disclaimer: MEDICAL_DISCLAIMER,
    };
  }

  // 3. If no previous donation recorded, donor is eligible
  if (!lastDonationDate) {
    return {
      eligible: true,
      nextEligibleDate: null,
      reason: "No prior donations recorded. You may be eligible to donate now.",
      daysRemaining: 0,
      disclaimer: MEDICAL_DISCLAIMER,
    };
  }

  const lastDate = typeof lastDonationDate === "string" ? new Date(lastDonationDate) : lastDonationDate;
  const intervalDays = customIntervalDays ?? (await getNumericSetting("MIN_DONATION_INTERVAL_DAYS", 90));
  const nextEligibleDate = addDays(lastDate, intervalDays);
  const now = new Date();

  // If current date is on or after nextEligibleDate
  if (!isBefore(now, nextEligibleDate)) {
    return {
      eligible: true,
      nextEligibleDate,
      reason: "Based on your last recorded donation date, you may be eligible to donate again.",
      daysRemaining: 0,
      disclaimer: MEDICAL_DISCLAIMER,
    };
  }

  // Not yet eligible
  const remaining = differenceInDays(nextEligibleDate, now) + 1;
  return {
    eligible: false,
    nextEligibleDate,
    reason: `Not yet eligible based on last recorded donation. Estimated wait period: ${remaining} day${
      remaining === 1 ? "" : "s"
    }.`,
    daysRemaining: remaining,
    disclaimer: MEDICAL_DISCLAIMER,
  };
}

/**
 * Pure calculation helper when interval is already known (useful for batch rendering)
 */
export function calculateEligibilitySync(
  lastDonationDate: Date | string | null | undefined,
  intervalDays = 90,
  availabilityStatus?: AvailabilityStatus,
  verificationStatus?: VerificationStatus
): EligibilityResult {
  if (verificationStatus === VerificationStatus.PENDING) {
    return {
      eligible: false,
      nextEligibleDate: null,
      reason: "Pending verification.",
      daysRemaining: 0,
      disclaimer: MEDICAL_DISCLAIMER,
    };
  }

  if (availabilityStatus === AvailabilityStatus.TEMPORARILY_UNAVAILABLE) {
    return {
      eligible: false,
      nextEligibleDate: null,
      reason: "Temporarily unavailable.",
      daysRemaining: 0,
      disclaimer: MEDICAL_DISCLAIMER,
    };
  }

  if (!lastDonationDate) {
    return {
      eligible: true,
      nextEligibleDate: null,
      reason: "No prior donations recorded. May be eligible.",
      daysRemaining: 0,
      disclaimer: MEDICAL_DISCLAIMER,
    };
  }

  const lastDate = typeof lastDonationDate === "string" ? new Date(lastDonationDate) : lastDonationDate;
  const nextEligibleDate = addDays(lastDate, intervalDays);
  const now = new Date();

  if (!isBefore(now, nextEligibleDate)) {
    return {
      eligible: true,
      nextEligibleDate,
      reason: "May be eligible to donate based on last donation date.",
      daysRemaining: 0,
      disclaimer: MEDICAL_DISCLAIMER,
    };
  }

  const remaining = differenceInDays(nextEligibleDate, now) + 1;
  return {
    eligible: false,
    nextEligibleDate,
    reason: `Estimated wait: ${remaining} days.`,
    daysRemaining: remaining,
    disclaimer: MEDICAL_DISCLAIMER,
  };
}
