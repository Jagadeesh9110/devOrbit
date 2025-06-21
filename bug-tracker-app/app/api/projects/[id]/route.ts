import { NextRequest, NextResponse } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db/Connect";
import {
  getProjectById,
  updateProject,
  deleteProject,
} from "@/controllers/projectController";
import User from "@/models/userModel";

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

    const project = await getProjectById(params.id, payload.userId);
    return NextResponse.json({ success: true, data: project });
  } catch (error: any) {
    console.error("Project GET error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch project" },
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

    const body = await request.json();
    const updatedProject = await updateProject(params.id, body, payload.userId);
    return NextResponse.json({ success: true, data: updatedProject });
  } catch (error: any) {
    console.error("Project PUT error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update project" },
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

    const result = await deleteProject(params.id, payload.userId);
    return NextResponse.json({ success: true, message: result.message });
  } catch (error: any) {
    console.error("Project DELETE error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete project" },
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
