// app/api/auth/payload/route.ts
import { NextResponse } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { accessToken } = getTokenFromCookies({ cookies });
  if (!accessToken) {
    return NextResponse.json({ error: "No access token" }, { status: 401 });
  }

  const payload = verifyToken(accessToken);
  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  return NextResponse.json({ payload });
}
