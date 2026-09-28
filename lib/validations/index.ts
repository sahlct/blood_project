import { z } from "zod";
import { AvailabilityStatus, RequestUrgency, DonationType } from "@prisma/client";

// ==========================================
// Authentication Schemas
// ==========================================

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().min(10, "Please enter a valid 10-digit phone number"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ==========================================
// Donor Public Registration Schema
// ==========================================

export const donorRegistrationSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().regex(/^[0-9+ -]{10,15}$/, "Please enter a valid phone number (10-15 digits)"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  bloodGroupId: z.string().min(1, "Please select your blood group"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  dateOfBirth: z.string().refine((val) => {
    const dob = new Date(val);
    const age = (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return age >= 18 && age <= 65;
  }, "Donor must be between 18 and 65 years old"),
  stateId: z.string().optional(),
  districtId: z.string().min(1, "Please select your district"),
  cityId: z.string().optional().nullable(),
  locality: z.string().min(2, "Please enter your locality/area"),
  address: z.string().optional(),
  lastDonationDate: z.string().optional().nullable(),
  publicProfileEnabled: z.boolean(),
  showPhonePublicly: z.boolean(),
  consentTerms: z.boolean().refine((val) => val === true, "You must agree to the terms and donation guidelines"),
  consentPrivacy: z.boolean().refine((val) => val === true, "You must consent to the privacy policy"),
});

export type DonorRegistrationData = z.infer<typeof donorRegistrationSchema>;

// ==========================================
// Donor Availability Schema
// ==========================================

export const updateAvailabilitySchema = z.object({
  availabilityStatus: z.nativeEnum(AvailabilityStatus),
  publicProfileEnabled: z.boolean().optional(),
  showPhonePublicly: z.boolean().optional(),
});

// ==========================================
// Blood Request Schema (Emergency)
// ==========================================

export const bloodRequestSchema = z.object({
  patientName: z.string().min(2, "Patient name is required"),
  bloodGroupId: z.string().min(1, "Please select required blood group"),
  unitsRequired: z.number().min(1, "At least 1 unit required").max(20, "Maximum 20 units per request"),
  urgency: z.nativeEnum(RequestUrgency),
  requiredDate: z.string().min(1, "Required date is required"),
  hospitalName: z.string().min(2, "Hospital name is required"),
  hospitalAddress: z.string().optional(),
  districtId: z.string().min(1, "Please select district"),
  cityId: z.string().optional().nullable(),
  contactPerson: z.string().min(2, "Contact person name is required"),
  contactPhone: z.string().regex(/^[0-9+ -]{10,15}$/, "Please enter a valid contact phone number"),
  contactEmail: z.string().email("Valid email required").optional().or(z.literal("")),
  notes: z.string().optional(),
});

export type BloodRequestData = z.infer<typeof bloodRequestSchema>;

// ==========================================
// Contact Donor Request Schema (Privacy-first)
// ==========================================

export const contactDonorSchema = z.object({
  donorProfileId: z.string().min(1, "Donor profile ID is required"),
  requesterName: z.string().min(2, "Your name is required"),
  requesterPhone: z.string().regex(/^[0-9+ -]{10,15}$/, "Valid contact phone is required"),
  requesterEmail: z.string().email("Valid contact email is required"),
  patientName: z.string().min(2, "Patient name is required"),
  hospitalName: z.string().min(2, "Hospital name is required"),
  bloodGroupId: z.string().min(1, "Blood group is required"),
  unitsRequired: z.coerce.number().min(1).default(1),
  requiredDate: z.string().min(1, "Date required"),
  message: z.string().max(500, "Message cannot exceed 500 characters").optional(),
});

// ==========================================
// Donation Record Schema (Admin/Staff)
// ==========================================

export const recordDonationSchema = z.object({
  donorProfileId: z.string().min(1, "Donor profile ID is required"),
  donationDate: z.string().min(1, "Donation date is required"),
  donationCenterId: z.string().optional().nullable(),
  donationEventId: z.string().optional().nullable(),
  donationType: z.nativeEnum(DonationType).default(DonationType.WHOLE_BLOOD),
  unitsDonated: z.coerce.number().min(0.5).max(3.0).default(1.0),
  notes: z.string().optional(),
});

// ==========================================
// Donation Event Schema
// ==========================================

export const donationEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  venue: z.string().min(2, "Venue name is required"),
  districtId: z.string().min(1, "District is required"),
  cityId: z.string().optional().nullable(),
  address: z.string().min(5, "Address is required"),
  startDate: z.string().min(1, "Start date/time is required"),
  endDate: z.string().min(1, "End date/time is required"),
  targetUnits: z.coerce.number().min(1).default(50),
  organizerName: z.string().min(2, "Organizer name is required"),
  organizerPhone: z.string().min(10, "Organizer phone is required"),
  organizerEmail: z.string().email().optional().or(z.literal("")),
});
