import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { contactDonorSchema } from "@/lib/validations";
import { notificationService } from "@/lib/services/notification";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const parsed = contactDonorSchema.safeParse({ ...body, donorProfileId: id });
    if (!parsed.success) {
      return apiError("Validation failed", 422, parsed.error.flatten().fieldErrors);
    }

    const {
      donorProfileId,
      requesterName,
      requesterPhone,
      requesterEmail,
      patientName,
      hospitalName,
      bloodGroupId,
      unitsRequired,
      requiredDate,
      message,
    } = parsed.data;

    // Verify donor exists and is public
    const donor = await prisma.donorProfile.findUnique({
      where: { id: donorProfileId },
      include: { user: true, bloodGroup: true },
    });

    if (!donor || !donor.publicProfileEnabled || donor.deletedAt) {
      return apiError("Donor profile is not available for contact requests", 404);
    }

    // Create Contact Request
    const contactReq = await prisma.contactRequest.create({
      data: {
        donorProfileId,
        requesterName,
        requesterPhone,
        requesterEmail,
        patientName,
        hospitalName,
        bloodGroupId,
        unitsRequired,
        requiredDate: new Date(requiredDate),
        message,
      },
    });

    // Notify donor via In-App and Email
    await notificationService.notify({
      userId: donor.userId,
      title: `Blood Donation Request from ${requesterName}`,
      message: `A patient (${patientName}) at ${hospitalName} requires ${unitsRequired} unit(s) of ${donor.bloodGroup.group} blood on ${new Date(
        requiredDate
      ).toLocaleDateString()}. Requester Contact: ${requesterPhone}.`,
      type: "ALERT",
      link: "/dashboard/requests",
      sendEmail: true,
      recipientEmail: donor.user.email,
    });

    return apiSuccess(
      {
        requestId: contactReq.id,
        status: contactReq.status,
      },
      "Your blood donation contact request has been securely sent to the donor. They will contact you directly.",
      201
    );
  } catch (error) {
    console.error("Contact donor API error:", error);
    return apiError("Failed to submit contact request", 500);
  }
}
