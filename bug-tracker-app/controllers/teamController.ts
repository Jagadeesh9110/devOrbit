import { Team, ITeam } from "@/models/teamModel";
import User from "@/models/userModel";
import mongoose from "mongoose";

type TeamMember = {
  userId: mongoose.Types.ObjectId;
  role:
    | "Project Manager"
    | "Team Lead"
    | "Senior Developer"
    | "Developer"
    | "QA Engineer";
  joinedAt: Date;
};

export const getTeamMembers = async (teamId: string, userId: string) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      throw new Error("Invalid team ID");
    }

    const team = await Team.findById(teamId).select("members");
    if (!team) {
      throw new Error("Team not found");
    }

    const teamMembers = team.members as TeamMember[];

    const isMember = teamMembers.some(
      (member: TeamMember) => member.userId.toString() === userId
    );
    if (!isMember) {
      throw new Error("Forbidden");
    }

    const members = await User.find({
      _id: { $in: teamMembers.map((m: TeamMember) => m.userId) },
    }).select("name email role");

    return members.map((member) => ({
      _id: member._id.toString(),
      name: member.name,
      email: member.email,
      role: member.role,
    }));
  } catch (error: any) {
    console.error("getTeamMembers error:", error.message);
    throw error;
  }
};

export const sendInvitation = async (
  teamId: string,
  data: { email: string },
  userId: string
) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      throw new Error("Invalid team ID");
    }

    const team = await Team.findById(teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    // Type assertion for proper typing
    const teamMembers = team.members as TeamMember[];

    const isManager = teamMembers.some(
      (member: TeamMember) =>
        member.userId.toString() === userId &&
        ["Project Manager", "Team Lead", "Admin"].includes(member.role)
    );
    if (!isManager) {
      throw new Error("Forbidden");
    }

    const { email } = data;
    if (!email) {
      throw new Error("Email is required");
    }

    const invitation = {
      teamId,
      email,
      invitedBy: userId,
      createdAt: new Date(),
    };

    return invitation;
  } catch (error: any) {
    console.error("sendInvitation error:", error.message);
    throw error;
  }
};
