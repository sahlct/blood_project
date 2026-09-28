import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { getUserRolesAndPermissions } from "@/lib/rbac/permissions";
import { recordAuditLog } from "@/lib/services/audit";
import { apiSuccess, apiError } from "@/lib/api/response";
import { loginSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed", 422, parsed.error.flatten().fieldErrors);
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return apiError("Invalid email or password", 401);
    }

    if (user.status !== "ACTIVE") {
      return apiError("Your account has been deactivated or suspended", 403);
    }

    const passwordMatches = await verifyPassword(password, user.passwordHash);
    if (!passwordMatches) {
      return apiError("Invalid email or password", 401);
    }

    // Get roles and permissions
    const { roles, permissions } = await getUserRolesAndPermissions(user.id);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Set secure session cookie
    await setSessionCookie({
      id: user.id,
      userId: user.id,
      email: user.email,
      name: user.name,
      roles,
      permissions,
    });

    // Record audit event
    await recordAuditLog({
      userId: user.id,
      actorName: user.name,
      actorEmail: user.email,
      action: "USER_LOGIN",
      entity: "User",
      entityId: user.id,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return apiSuccess({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles,
        permissions,
      },
    }, "Signed in successfully");
  } catch (error) {
    console.error("Login API error:", error);
    return apiError("Internal server error during login", 500);
  }
}
