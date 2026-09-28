import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return apiError("Unauthenticated", 401);
  }

  return apiSuccess({ user });
}
