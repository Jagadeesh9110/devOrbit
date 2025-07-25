import { Team, ITeam } from "@/models/teamModel";
import User from "@/models/userModel";
import Invitation from "@/models/invitationModel";
import mongoose from "mongoose";
import { sendEmail } from "@/lib/sendEmail";
import crypto from "crypto";

type TeamMember = {
  userId: mongoose.Types.ObjectId;
  role: "Admin" | "Project Manager" | "Developer" | "Tester";
  joinedAt: Date;
  workload?: number;
  assignedBugs?: number;
  resolvedBugs?: number;
  avgResolutionTime?: string;
  specialties?: string[];
};

export const getUserTeams = async (userId: string) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    const teams = await Team.find({
      "members.userId": new mongoose.Types.ObjectId(userId),
    })
      .populate({
        path: "members.userId",
        select: "name email phone location status skills startDate",
      })
      .populate("projects", "name description status")
      .sort({ createdAt: -1 });

    return teams.map((team) => ({
      _id: team._id.toString(),
      name: team.name,
      description: team.description,
      members: team.members.map((member: any) => ({
        userId: member.userId,
        role: member.role,
        joinedAt: member.joinedAt,
        workload: member.workload || 0,
        assignedBugs: member.assignedBugs || 0,
        resolvedBugs: member.resolvedBugs || 0,
        avgResolutionTime: member.avgResolutionTime || "0 days",
        specialties: member.specialties || [],
      })),
      projects: team.projects,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      memberCount: team.members.length,
      // Add performance metrics using the model method
      performanceMetrics: team.getPerformanceMetrics(),
    }));
  } catch (error: any) {
    console.error("getUserTeams error:", error.message);
    throw error;
  }
};

export const getTeamMembers = async (teamId: string, userId: string) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      throw new Error("Invalid team ID");
    }

    const team = await Team.findById(teamId).populate({
      path: "members.userId",
      select: "name email role avatar status skills",
    });

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

    return team.members.map((member: any) => ({
      _id: member.userId._id.toString(),
      name: member.userId.name,
      email: member.userId.email,
      role: member.role, // Team role, not user role
      userRole: member.userId.role, // User's general role
      joinedAt: member.joinedAt,
      workload: member.workload || 0,
      assignedBugs: member.assignedBugs || 0,
      resolvedBugs: member.resolvedBugs || 0,
      avgResolutionTime: member.avgResolutionTime || "0 days",
      specialties: member.specialties || [],
      avatar: member.userId.avatar,
      status: member.userId.status,
      skills: member.userId.skills,
    }));
  } catch (error: any) {
    console.error("getTeamMembers error:", error.message);
    throw error;
  }
};

export const sendInvitation = async (
  teamId: string,
  data: {
    email: string;
    role?: "Admin" | "Project Manager" | "Developer" | "Tester";
  },
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

    const teamMembers = team.members as TeamMember[];
    const isManager = teamMembers.some(
      (member: TeamMember) =>
        member.userId.toString() === userId &&
        ["Project Manager", "Admin"].includes(member.role)
    );
    if (!isManager) {
      throw new Error(
        "Forbidden: Only admins and project managers can send invitations"
      );
    }

    const { email, role = "Developer" } = data;
    if (!email) {
      throw new Error("Email is required");
    }

    // Validate role
    const validRoles = ["Admin", "Project Manager", "Developer", "Tester"];
    if (!validRoles.includes(role)) {
      throw new Error("Invalid role specified");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    // Check if user is already a team member
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const isAlreadyMember = teamMembers.some(
        (member: TeamMember) =>
          member.userId.toString() === existingUser._id.toString()
      );
      if (isAlreadyMember) {
        throw new Error("User is already a team member");
      }
    }

    // Check for existing pending invitation
    const existingInvitation = await Invitation.findOne({
      teamId,
      email: email.toLowerCase(),
      status: "pending",
      expiresAt: { $gt: new Date() },
    });
    if (existingInvitation) {
      throw new Error("A pending invitation already exists for this email");
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create invitation
    const invitation = await Invitation.create({
      teamId,
      email: email.toLowerCase(),
      invitedBy: userId,
      role,
      token,
      expiresAt,
      status: "pending",
    });

    // Get inviter details
    const inviter = await User.findById(userId).select("name email");

    // ✅ FIXED: Changed NEXT_PUBLIC_BASE_URL to NEXT_PUBLIC_APP_URL
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite?token=${invitation.token}`;

    await sendEmail({
      to: email,
      subject: `Invitation to join ${team.name} team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; text-align: center;">
            <h1 style="color: #2563eb; margin-bottom: 10px;">Bug Tracker</h1>
            <h2 style="color: #1f2937; margin-bottom: 30px;">Team Invitation</h2>
          </div>
          
          <div style="padding: 30px 0;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Hello!</p>
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
              <strong>${
                inviter?.name || "Someone"
              }</strong> has invited you to join the 
              <strong style="color: #2563eb;">${team.name}</strong> team.
            </p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 25px 0;">
              <p style="margin: 0 0 10px 0; color: #374151;">
                <strong>Team:</strong> ${team.name}
              </p>
              <p style="margin: 0 0 10px 0; color: #374151;">
                <strong>Description:</strong> ${
                  team.description || "No description available"
                }
              </p>
              <p style="margin: 0; color: #374151;">
                <strong>Your Role:</strong> ${role}
              </p>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${inviteLink}" 
                 style="background-color: #16a34a; color: white; padding: 14px 28px; 
                        text-decoration: none; border-radius: 6px; display: inline-block;
                        font-weight: 600; font-size: 16px;">
                Accept Invitation
              </a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">
                ⏰ This invitation will expire in 7 days.
              </p>
              <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">
                If you don't want to join this team, you can simply ignore this email.
              </p>
              <p style="font-size: 14px; color: #6b7280;">
                Having trouble with the button? Copy and paste this link into your browser:<br>
                <a href="${inviteLink}" style="color: #2563eb; word-break: break-all;">${inviteLink}</a>
              </p>
            </div>
          </div>
        </div>
      `,
    });

    return {
      success: true,
      invitationId: invitation._id,
      token: invitation.token,
      expiresAt: invitation.expiresAt,
      message: "Invitation sent successfully",
    };
  } catch (error: any) {
    console.error("sendInvitation error:", error.message);
    throw error;
  }
};

// Get invitation details by token
export const getInvitationByToken = async (token: string) => {
  try {
    if (!token) {
      throw new Error("Invalid token");
    }

    const invitation = await Invitation.findOne({ token })
      .populate("teamId", "name description memberCount")
      .populate("invitedBy", "name email");

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    const isExpired = invitation.expiresAt < new Date();

    if (isExpired && invitation.status === "pending") {
      invitation.status = "expired";
      await invitation.save();
    }

    return {
      invitation,
      isExpired,
      isValid: invitation.status === "pending" && !isExpired,
    };
  } catch (error: any) {
    console.error("getInvitationByToken error:", error.message);
    throw error;
  }
};

// Accept invitation by token
export const acceptInvitationByToken = async (
  token: string,
  userId: string
) => {
  try {
    if (!token) {
      throw new Error("Invalid token");
    }

    const invitation = await Invitation.findOne({ token }).populate("teamId");
    if (!invitation) {
      throw new Error("Invitation not found");
    }

    if (invitation.status !== "pending") {
      throw new Error("Invitation is no longer valid");
    }

    // Check if invitation is expired
    if (invitation.expiresAt < new Date()) {
      invitation.status = "expired";
      await invitation.save();
      throw new Error("Invitation has expired");
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify email matches
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new Error("Email mismatch - please login with the invited email");
    }

    // Get team
    const team = await Team.findById(invitation.teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    // Check if user is already a member
    const isAlreadyMember = team.members.some(
      (member: any) => member.userId.toString() === userId
    );
    if (isAlreadyMember) {
      throw new Error("You are already a member of this team");
    }

    // Add user to team with proper member structure
    const newMember: TeamMember = {
      userId: new mongoose.Types.ObjectId(userId),
      role: invitation.role as
        | "Admin"
        | "Project Manager"
        | "Developer"
        | "Tester",
      joinedAt: new Date(),
      workload: 0,
      assignedBugs: 0,
      resolvedBugs: 0,
      avgResolutionTime: "0 days",
      specialties: [],
    };

    team.members.push(newMember);
    await team.save();

    // Update invitation status
    invitation.status = "accepted";
    invitation.userId = new mongoose.Types.ObjectId(userId);
    await invitation.save();

    return {
      success: true,
      teamId: team._id,
      teamName: team.name,
      role: invitation.role,
      message: "Successfully joined the team",
    };
  } catch (error: any) {
    console.error("acceptInvitationByToken error:", error.message);
    throw error;
  }
};

// Decline invitation by token
export const declineInvitationByToken = async (
  token: string,
  userId?: string
) => {
  try {
    if (!token) {
      throw new Error("Invalid token");
    }

    const invitation = await Invitation.findOne({ token });
    if (!invitation) {
      throw new Error("Invitation not found");
    }

    if (invitation.status !== "pending") {
      throw new Error("Invitation is no longer valid");
    }

    invitation.status = "declined";
    if (userId) {
      invitation.userId = new mongoose.Types.ObjectId(userId);
    }
    await invitation.save();

    return {
      success: true,
      message: "Invitation declined",
    };
  } catch (error: any) {
    console.error("declineInvitationByToken error:", error.message);
    throw error;
  }
};

// Get team by ID with full details
export const getTeamById = async (teamId: string, userId: string) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      throw new Error("Invalid team ID");
    }

    const team = await Team.findById(teamId)
      .populate({
        path: "members.userId",
        select: "name email avatar status skills",
      })
      .populate("projects", "name description status createdAt");

    if (!team) {
      throw new Error("Team not found");
    }

    // Check if user is a member
    const isMember = team.members.some(
      (member: any) => member.userId._id.toString() === userId
    );
    if (!isMember) {
      throw new Error("Forbidden: You are not a member of this team");
    }

    return {
      _id: team._id.toString(),
      name: team.name,
      description: team.description,
      members: team.members.map((member: any) => ({
        userId: member.userId._id.toString(),
        name: member.userId.name,
        email: member.userId.email,
        avatar: member.userId.avatar,
        role: member.role,
        joinedAt: member.joinedAt,
        workload: member.workload || 0,
        assignedBugs: member.assignedBugs || 0,
        resolvedBugs: member.resolvedBugs || 0,
        avgResolutionTime: member.avgResolutionTime || "0 days",
        specialties: member.specialties || [],
        status: member.userId.status,
        skills: member.userId.skills,
      })),
      projects: team.projects,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      memberCount: team.members.length,
      performanceMetrics: team.getPerformanceMetrics(),
    };
  } catch (error: any) {
    console.error("getTeamById error:", error.message);
    throw error;
  }
};

// Update team member role/details
export const updateTeamMember = async (
  teamId: string,
  memberId: string,
  updateData: {
    role?: "Admin" | "Project Manager" | "Developer" | "Tester";
    workload?: number;
    specialties?: string[];
  },
  userId: string
) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(teamId) ||
      !mongoose.Types.ObjectId.isValid(memberId)
    ) {
      throw new Error("Invalid team ID or member ID");
    }

    const team = await Team.findById(teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    // Check if user has permission to update (Admin or Project Manager)
    const userMember = team.members.find(
      (member: any) => member.userId.toString() === userId
    );
    if (
      !userMember ||
      !["Admin", "Project Manager"].includes(userMember.role)
    ) {
      throw new Error(
        "Forbidden: Only admins and project managers can update members"
      );
    }

    // Find the member to update
    const memberToUpdate = team.members.find(
      (member: any) => member.userId.toString() === memberId
    );
    if (!memberToUpdate) {
      throw new Error("Member not found in team");
    }

    // Update member data
    if (updateData.role) {
      const validRoles = ["Admin", "Project Manager", "Developer", "Tester"];
      if (!validRoles.includes(updateData.role)) {
        throw new Error("Invalid role specified");
      }
      memberToUpdate.role = updateData.role;
    }

    if (updateData.workload !== undefined) {
      if (updateData.workload < 0 || updateData.workload > 100) {
        throw new Error("Workload must be between 0 and 100");
      }
      memberToUpdate.workload = updateData.workload;
    }

    if (updateData.specialties) {
      memberToUpdate.specialties = updateData.specialties;
    }

    await team.save();

    return {
      success: true,
      message: "Member updated successfully",
      member: memberToUpdate,
    };
  } catch (error: any) {
    console.error("updateTeamMember error:", error.message);
    throw error;
  }
};

// Remove member from team
export const removeTeamMember = async (
  teamId: string,
  memberId: string,
  userId: string
) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(teamId) ||
      !mongoose.Types.ObjectId.isValid(memberId)
    ) {
      throw new Error("Invalid team ID or member ID");
    }

    const team = await Team.findById(teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    // Check if user has permission to remove (Admin or Project Manager)
    const userMember = team.members.find(
      (member: any) => member.userId.toString() === userId
    );
    if (
      !userMember ||
      !["Admin", "Project Manager"].includes(userMember.role)
    ) {
      throw new Error(
        "Forbidden: Only admins and project managers can remove members"
      );
    }

    // Don't allow removing the last admin
    const adminCount = team.members.filter(
      (member: any) => member.role === "Admin"
    ).length;
    const memberToRemove = team.members.find(
      (member: any) => member.userId.toString() === memberId
    );

    if (memberToRemove?.role === "Admin" && adminCount === 1) {
      throw new Error("Cannot remove the last admin from the team");
    }

    // Remove member
    team.members = team.members.filter(
      (member: any) => member.userId.toString() !== memberId
    );

    await team.save();

    return {
      success: true,
      message: "Member removed successfully",
      memberCount: team.members.length,
    };
  } catch (error: any) {
    console.error("removeTeamMember error:", error.message);
    throw error;
  }
};

export const cleanupExpiredInvitations = async () => {
  try {
    const result = await Invitation.updateMany(
      {
        status: "pending",
        expiresAt: { $lt: new Date() },
      },
      { status: "expired" }
    );

    return result.modifiedCount;
  } catch (error: any) {
    console.error("cleanupExpiredInvitations error:", error.message);
    throw error;
  }
};
