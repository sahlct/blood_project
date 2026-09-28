import { cookies } from "next/headers";
import { verifySessionToken, signSessionToken, TokenPayload } from "./jwt";
import { getUserRolesAndPermissions, hasPermission, PermissionKey } from "@/lib/rbac/permissions";
import prisma from "@/lib/prisma";

export const SESSION_COOKIE_NAME = "bloodlife_session_token";

/**
 * Get current authenticated user payload from cookies.
 */
export async function getSessionUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch (error) {
    console.error("Error reading session:", error);
    return null;
  }
}

/**
 * Checks if the user is authenticated; if not, returns null.
 * Also syncs fresh roles/permissions if needed.
 */
export async function getCurrentUser() {
  const session = await getSessionUser();
  if (!session) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        status: true,
        memberProfile: true,
        donorProfile: {
          include: {
            bloodGroup: true,
            district: true,
          },
        },
      },
    });

    if (!user || user.status !== "ACTIVE") return null;

    return {
      ...user,
      roles: session.roles,
      permissions: session.permissions,
    };
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

/**
 * Server-side guard to require a permission.
 * Throws or returns an error response if unauthorized.
 */
export async function requirePermission(permission: PermissionKey | string) {
  const session = await getSessionUser();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  const allowed = hasPermission(session, permission);
  if (!allowed) {
    throw new Error("FORBIDDEN");
  }

  return session;
}

/**
 * Sets session cookie after login / registration.
 */
export async function setSessionCookie(payload: TokenPayload) {
  const token = await signSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Clears session cookie on logout.
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
