import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/Connect";
import User from "@/models/userModel";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { accessToken } = getTokenFromCookies(request);
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(accessToken);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(payload.userId)
      .select("name email image role")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    if (error.message === "Token has expired") {
      return NextResponse.json(
        { error: "Token expired", shouldRefresh: true },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { accessToken } = getTokenFromCookies(request);
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(accessToken);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if email is already taken by another user
    const existingUser = await User.findOne({
      email,
      _id: { $ne: payload.userId },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already taken" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      payload.userId,
      { name, email },
      { new: true }
    )
      .select("name email image role")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Error updating profile:", error);
    if (error.message === "Token has expired") {
      return NextResponse.json(
        { error: "Token expired", shouldRefresh: true },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getTokenFromCookies(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  return { accessToken, refreshToken };
}
