import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/Connect";
import User from "@/models/userModel";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const users = await User.find({}, "name").lean();

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
