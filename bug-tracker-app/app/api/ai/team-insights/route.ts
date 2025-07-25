// app/api/ai/team-insights/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import { aiService } from "@/lib/services/AiService";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { accessToken } = getTokenFromCookies(request);
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(accessToken);
    if (!payload?.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const insights = await aiService.generateTeamInsights(payload.userId);

    return NextResponse.json({ success: true, data: insights });
  } catch (error: any) {
    console.error("AI Team Insights API error:", error.message);
    return NextResponse.json(
      { success: false, message: "Failed to generate AI insights" },
      { status: 500 }
    );
  }
}
