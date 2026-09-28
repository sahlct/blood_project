import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.AUTH_SECRET || "default-blood-portal-secret-key-at-least-32-chars-long";
const key = new TextEncoder().encode(JWT_SECRET);

export interface TokenPayload {
  id: string;
  userId: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
}

/**
 * Sign a JWT token valid for 7 days
 */
export async function signSessionToken(payload: TokenPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

/**
 * Verify and decode a JWT token
 */
export async function verifySessionToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}
