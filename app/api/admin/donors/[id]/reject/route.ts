import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";
import { rejectDonor } from "@/lib/services/donor";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session || !hasPermission(session, "donors.update")) {
      return apiError("Unauthorized to reject donors", 403);
    }

    const { id } = await params;
    const body = await req.json();
    const reason = body.reason || "Did not meet verification criteria";

    const updated = await rejectDonor({
      donorProfileId: id,
      adminUserId: session.userId,
      adminName: session.name,
      adminEmail: session.email,
      reason,
    });

    return apiSuccess({ donor: updated }, "Donor profile rejected");
  } catch (error: any) {
    console.error("Reject donor API error:", error);
    return apiError(error.message || "Failed to reject donor", 500);
  }
}
