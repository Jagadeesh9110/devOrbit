import { NextRequest, NextResponse } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db/Connect";
import { getAllProjects, createProject } from "@/controllers/projectController";
import User from "@/models/userModel";

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
    console.log("User ID from token:", payload.userId);

    const projects = await getAllProjects(payload.userId);
    return NextResponse.json({ success: true, data: projects });
  } catch (error: any) {
    console.error("Projects GET error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch projects" },
      { status: error.message.includes("Unauthorized") ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const user = await User.findById(payload.userId).select("role");
    if (!user || !["Admin", "Project Manager"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const newProject = await createProject(body, payload.userId);
    return NextResponse.json(
      { success: true, data: newProject },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Projects POST error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create project" },
      { status: error.message.includes("Forbidden") ? 403 : 400 }
    );
  }
}
