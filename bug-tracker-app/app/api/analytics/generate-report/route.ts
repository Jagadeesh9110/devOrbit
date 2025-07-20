// app/api/analytics/generate-report/route.ts

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/Connect";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import { aiService } from "@/lib/services/AiService";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { accessToken } = getTokenFromCookies(request);
    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = verifyToken(accessToken);
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { analyticsData, timeRange } = await request.json();

    if (!analyticsData || !timeRange) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required parameters for report generation",
        },
        { status: 400 }
      );
    }

    const report = await aiService.generateIntelligentReport(
      analyticsData,
      timeRange,
      payload.userId
    );

    return new Response(report, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown",
      },
    });
  } catch (error: any) {
    console.error(
      "Error generating analytics report:",
      error.message,
      error.stack
    );
    return NextResponse.json(
      { success: false, message: "Failed to generate analytics report" },
      { status: 500 }
    );
  }
}
