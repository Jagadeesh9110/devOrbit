import { NextRequest, NextResponse } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db/Connect";
import { getBugById, updateBug, deleteBug } from "@/controllers/bugController";

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

    return await getBugById(params.id, payload.userId);
  } catch (error: any) {
    console.error("Bug GET error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch bug" },
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

export async function PUT(
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

    return await updateBug(request, params.id, payload.userId);
  } catch (error: any) {
    console.error("Bug PUT error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update bug" },
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

export async function DELETE(
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

    return await deleteBug(params.id);
  } catch (error: any) {
    console.error("Bug DELETE error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete bug" },
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
