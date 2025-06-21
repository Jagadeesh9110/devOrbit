import { NextRequest, NextResponse } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db/Connect";
import User from "@/models/userModel";
import bcrypt from "bcryptjs";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
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

    const currentUser = await User.findById(payload.userId).select("role");
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only Admin, Project Manager, or the user themselves can access
    if (
      !["Admin", "Project Manager"].includes(currentUser.role) &&
      payload.userId !== params.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await User.findById(params.userId).select(
      "-password -verificationToken -resetToken -resetTokenExpiry -verificationTokenExpiry"
    );
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    console.error("Users GET error:", error.message, error.stack);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch user",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
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

    const currentUser = await User.findById(payload.userId).select("role");
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only Admin, Project Manager, or the user themselves can update
    if (
      !["Admin", "Project Manager"].includes(currentUser.role) &&
      payload.userId !== params.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      email,
      phone,
      location,
      bio,
      department,
      jobTitle,
      startDate,
      salary,
      skills,
      role,
      password,
    } = body;

    const updateData: any = {
      name,
      email,
      phone,
      location,
      bio,
      department,
      jobTitle,
      startDate: startDate ? new Date(startDate) : undefined,
      salary,
      skills,
    };

    // Only Admins can update role
    if (role && currentUser.role === "Admin") {
      updateData.role = role;
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(
      params.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select(
      "-password -verificationToken -resetToken -resetTokenExpiry -verificationTokenExpiry"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    console.error("Users PUT error:", error.message, error.stack);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update user",
      },
      { status: 500 }
    );
  }
}
