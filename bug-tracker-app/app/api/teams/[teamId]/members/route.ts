import { NextRequest, NextResponse } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db/Connect";
import { Team } from "@/models/teamModel";
import User from "@/models/userModel";
import mongoose from "mongoose";

export async function POST(
  request: NextRequest,
  { params }: { params: { teamId: string } }
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
    if (
      !currentUser ||
      !["Admin", "Project Manager"].includes(currentUser.role)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!mongoose.Types.ObjectId.isValid(params.teamId)) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
    }

    const body = await request.json();
    const { userId, role = "Developer", specialties = [] } = body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const team = await Team.findById(params.teamId);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is already a member
    if (
      team.members.some((member: any) => member.userId.toString() === userId)
    ) {
      return NextResponse.json(
        { error: "User is already a member of this team" },
        { status: 409 }
      );
    }

    // Add member to team
    team.members.push({
      userId: new mongoose.Types.ObjectId(userId),
      role,
      joinedAt: new Date(),
      specialties,
    });

    // Update user's teamIds
    user.teamIds.push(new mongoose.Types.ObjectId(params.teamId));
    await Promise.all([team.save(), user.save()]);

    return NextResponse.json({ success: true, data: team }, { status: 201 });
  } catch (error: any) {
    console.error("Team members POST error:", error.message, error.stack);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to add team member",
      },
      {
        status: error.message.includes("not found")
          ? 404
          : error.message.includes("Invalid")
          ? 400
          : 500,
      }
    );
  }
}
