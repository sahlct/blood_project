import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { registerSchema } from "@/lib/validations";
import { recordAuditLog } from "@/lib/services/audit";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed", 422, parsed.error.flatten().fieldErrors);
    }

    const { name, email, phone, password } = parsed.data;
    const cleanEmail = email.toLowerCase().trim();

    // Check existing email
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return apiError("An account with this email address already exists", 409);
    }

    const passwordHash = await hashPassword(password);

    // Create User & MemberProfile in transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email: cleanEmail,
          phone,
          passwordHash,
          emailVerified: new Date(),
        },
      });

      await tx.memberProfile.create({
        data: {
          userId: newUser.id,
          fullName: name,
          phone,
        },
      });

      return newUser;
    });

    // Session cookie
    await setSessionCookie({
      id: user.id,
      userId: user.id,
      email: user.email,
      name: user.name,
      roles: [],
      permissions: [],
    });

    await recordAuditLog({
      userId: user.id,
      actorName: user.name,
      actorEmail: user.email,
      action: "USER_REGISTER",
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
        roles: [],
        permissions: [],
      },
    }, "Registration successful! Welcome to BloodLife.", 201);
  } catch (error) {
    console.error("Register API error:", error);
    return apiError("Failed to register account", 500);
  }
}
