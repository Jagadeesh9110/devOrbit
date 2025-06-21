import { NextRequest, NextResponse } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db/Connect";
import { addComment } from "@/controllers/bugController";

export async function POST(
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

    return await addComment(request, params.id, payload.userId);
  } catch (error: any) {
    console.error("Bug comment POST error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to add comment" },
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
