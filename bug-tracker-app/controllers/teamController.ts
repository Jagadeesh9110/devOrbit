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
  data: { email: string; role?: string },
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

    // Send email
    const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL}/invite?token=${invitation.token}`;

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
      .populate("teamId", "name description")
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

    // Add user to team
    team.members.push({
      userId: new mongoose.Types.ObjectId(userId),
      role: invitation.role,
      joinedAt: new Date(),
    });

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

    // Update invitation status
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

// Clean up expired invitations (utility function)
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
