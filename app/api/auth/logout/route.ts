import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  await clearSessionCookie();
  // If request has header Accept text/html, redirect to login, else return JSON
  const accept = req.headers.get("accept") || "";
  if (accept.includes("text/html")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.json({ success: true, message: "Logged out successfully" });
}

export async function GET(req: NextRequest) {
  await clearSessionCookie();
  return NextResponse.redirect(new URL("/login", req.url));
}
