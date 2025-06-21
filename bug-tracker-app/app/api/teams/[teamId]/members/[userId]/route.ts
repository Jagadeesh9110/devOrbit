import { NextRequest, NextResponse } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db/Connect";
import { Team } from "@/models/teamModel";
import User from "@/models/userModel";
import mongoose from "mongoose";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { teamId: string; userId: string } }
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

    if (
      !mongoose.Types.ObjectId.isValid(params.teamId) ||
      !mongoose.Types.ObjectId.isValid(params.userId)
    ) {
      return NextResponse.json(
        { error: "Invalid team or user ID" },
        { status: 400 }
      );
    }

    const team = await Team.findById(params.teamId);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const user = await User.findById(params.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is a member
    const memberIndex = team.members.findIndex(
      (member: any) => member.userId.toString() === params.userId
    );
    if (memberIndex === -1) {
      return NextResponse.json(
        { error: "User is not a member of this team" },
        { status: 404 }
      );
    }

    // Remove member from team
    team.members.splice(memberIndex, 1);

    // Remove team from user's teamIds
    user.teamIds = user.teamIds.filter(
      (teamId: any) => teamId.toString() !== params.teamId
    );

    await Promise.all([team.save(), user.save()]);

    return NextResponse.json({
      success: true,
      message: "Team member removed successfully",
    });
  } catch (error: any) {
    console.error("Team members DELETE error:", error.message, error.stack);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to remove team member",
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
