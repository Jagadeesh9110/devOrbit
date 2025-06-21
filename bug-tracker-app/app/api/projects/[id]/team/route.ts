import { NextRequest, NextResponse } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db/Connect";
import { getProjectTeam } from "@/controllers/projectController";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const team = await getProjectTeam(params.id, payload.userId);
    return NextResponse.json({ success: true, data: team });
  } catch (error: any) {
    console.error("Project team GET error:", error.message, error.stack);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch project team",
      },
      {
        status: error.message.includes("Forbidden")
          ? 403
          : error.message.includes("not found")
          ? 404
          : 500,
      }
    );
  }
}
