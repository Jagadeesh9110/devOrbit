import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/Connect";
import User from "@/models/userModel";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    console.log("Metrics: Connecting to database...");
    await connectDB();
    console.log("Metrics: Database connected");

    const { accessToken } = getTokenFromCookies(request);
    console.log(
      "Metrics: Access Token:",
      accessToken ? accessToken.substring(0, 20) + "..." : "None"
    );

    if (!accessToken) {
      console.log("Metrics: No access token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(accessToken);
    if (!payload || !payload.userId) {
      console.log("Metrics: Invalid token or missing userId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(payload.userId).select(
      "name role isVerified"
    );
    console.log(
      "Metrics: User found:",
      user ? { id: user._id, isVerified: user.isVerified } : "null"
    );
    if (!user) {
      console.log("Metrics: User not found in database");
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }
    if (!user.isVerified) {
      console.log("Metrics: User not verified");
      return NextResponse.json({ error: "User not verified" }, { status: 401 });
    }

    // Simulate fetching metrics data
    const metricsData = { example: "data" };
    return NextResponse.json({ success: true, data: metricsData });
  } catch (error: any) {
    console.error("Metrics error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
