import { NextRequest, NextResponse } from "next/server";
import { getResolutionTimes } from "@/controllers/analyticsController";
import connectDB from "@/lib/db/Connect";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { accessToken } = getTokenFromCookies(request);
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(accessToken);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return await getResolutionTimes(request);
  } catch (error: any) {
    console.error("Analytics GET error:", error.message, error.stack);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch resolution times",
      },
      { status: error.message.includes("Unauthorized") ? 401 : 500 }
    );
  }
}
