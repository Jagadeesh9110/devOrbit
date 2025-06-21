import { NextRequest, NextResponse } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db/Connect";
import { getProjectBugs } from "@/controllers/projectController";

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

    const bugs = await getProjectBugs(params.id, payload.userId);
    return NextResponse.json({ success: true, data: bugs });
  } catch (error: any) {
    console.error("Project bugs GET error:", error.message, error.stack);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch project bugs",
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
