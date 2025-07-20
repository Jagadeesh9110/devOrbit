export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    clientIdExists: !!process.env.GOOGLE_CLIENT_ID,
    publicClientIdExists: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    secretExists: !!process.env.GOOGLE_CLIENT_SECRET,
    clientIdMatch:
      process.env.GOOGLE_CLIENT_ID === process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  });
}
