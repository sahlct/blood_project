import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/permissions";
import { approveDonor } from "@/lib/services/donor";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session || !hasPermission(session, "donors.update")) {
      return apiError("Unauthorized to approve donors", 403);
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const updated = await approveDonor({
      donorProfileId: id,
      adminUserId: session.userId,
      adminName: session.name,
      adminEmail: session.email,
      notes: body.notes,
    });

    return apiSuccess({ donor: updated }, "Donor successfully approved and verified!");
  } catch (error: any) {
    console.error("Approve donor API error:", error);
    return apiError(error.message || "Failed to approve donor", 500);
  }
}
