import connectDB from "@/lib/db/Connect";
import User from "@/models/userModel";
import { Team } from "@/models/teamModel";
import { verifyToken, TokenPayload } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { uploadImage } from "@/lib/cloudinary";
import { z } from "zod";

// Validation schemas
const profileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  role: z.enum(["Admin", "Project Manager", "Developer", "Tester"]).optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  bio: z.string().max(500).optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  department: z.string().optional(),
  jobTitle: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

const notificationsSchema = z.object({
  email: z.boolean().optional(),
  push: z.boolean().optional(),
  slack: z.boolean().optional(),
  bugAssigned: z.boolean().optional(),
  bugResolved: z.boolean().optional(),
  weeklyReport: z.boolean().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

interface ControllerResponse {
  success: boolean;
  data?: any;
  error?: string;
  status: number;
}

// Helper to get user from token
async function getUserFromToken(
  accessToken: string
): Promise<{ user: any; payload: TokenPayload } | null> {
  const payload = verifyToken(accessToken);
  if (!payload) {
    return null;
  }
  await connectDB();
  const user = await User.findById(payload.userId);
  if (!user) {
    return null;
  }
  return { user, payload };
}

export const settingsController = {
  async getProfile(accessToken: string): Promise<ControllerResponse> {
    try {
      const result = await getUserFromToken(accessToken);
      if (!result) {
        return { success: false, error: "Unauthorized", status: 401 };
      }
      const { user } = result;

      return {
        success: true,
        data: {
          name: user.name,
          email: user.email,
          role: user.role,
          timezone: user.timezone || "America/Los_Angeles",
          language: user.language || "English",
          bio: user.bio || "",
          phone: user.phone || "",
          location: user.location || "",
          department: user.department || "",
          jobTitle: user.jobTitle || "",
          skills: user.skills || [],
        },
        status: 200,
      };
    } catch (error: any) {
      console.error("getProfile error:", error.message);
      return { success: false, error: "Internal server error", status: 500 };
    }
  },

  async updateProfile(
    accessToken: string,
    body: any
  ): Promise<ControllerResponse> {
    try {
      const result = await getUserFromToken(accessToken);
      if (!result) {
        return { success: false, error: "Unauthorized", status: 401 };
      }
      const { user } = result;

      const validatedData = profileSchema.parse(body);
      Object.assign(user, validatedData);
      await user.save();

      return {
        success: true,
        data: {
          name: user.name,
          email: user.email,
          role: user.role,
          timezone: user.timezone,
          language: user.language,
          bio: user.bio,
          phone: user.phone,
          location: user.location,
          department: user.department,
          jobTitle: user.jobTitle,
          skills: user.skills,
        },
        status: 200,
      };
    } catch (error: any) {
      console.error("updateProfile error:", error.message);
      return {
        success: false,
        error: error.message || "Internal server error",
        status: 500,
      };
    }
  },

  async getNotifications(accessToken: string): Promise<ControllerResponse> {
    try {
      const result = await getUserFromToken(accessToken);
      if (!result) {
        return { success: false, error: "Unauthorized", status: 401 };
      }
      const { user } = result;

      return {
        success: true,
        data: {
          email: user.notificationsEnabled,
          push: true, // Mock
          slack: false, // Mock
          bugAssigned: true, // Mock
          bugResolved: true, // Mock
          weeklyReport: false, // Mock
        },
        status: 200,
      };
    } catch (error: any) {
      console.error("getNotifications error:", error.message);
      return { success: false, error: "Internal server error", status: 500 };
    }
  },

  async updateNotifications(
    accessToken: string,
    body: any
  ): Promise<ControllerResponse> {
    try {
      const result = await getUserFromToken(accessToken);
      if (!result) {
        return { success: false, error: "Unauthorized", status: 401 };
      }
      const { user } = result;

      const validatedData = notificationsSchema.parse(body);
      user.notificationsEnabled =
        validatedData.email ?? user.notificationsEnabled;
      await user.save();

      return {
        success: true,
        data: {
          email: user.notificationsEnabled,
          push: validatedData.push ?? true,
          slack: validatedData.slack ?? false,
          bugAssigned: validatedData.bugAssigned ?? true,
          bugResolved: validatedData.bugResolved ?? true,
          weeklyReport: validatedData.weeklyReport ?? false,
        },
        status: 200,
      };
    } catch (error: any) {
      console.error("updateNotifications error:", error.message);
      return {
        success: false,
        error: error.message || "Internal server error",
        status: 500,
      };
    }
  },

  async getTeam(accessToken: string): Promise<ControllerResponse> {
    try {
      const result = await getUserFromToken(accessToken);
      if (!result) {
        return { success: false, error: "Unauthorized", status: 401 };
      }
      const { user } = result;

      const teams = await Team.find({ _id: { $in: user.teamIds } }).populate({
        path: "members.userId",
        select: "name email role status",
      });

      const teamMembers = teams.flatMap((team: any) =>
        team.members.map((member: any) => ({
          id: member.userId._id.toString(),
          name: member.userId.name,
          email: member.userId.email,
          role: member.role,
          status: member.userId.status || "Active",
          joinDate: member.joinedAt.toISOString(),
        }))
      );

      return {
        success: true,
        data: { members: teamMembers },
        status: 200,
      };
    } catch (error: any) {
      console.error("getTeam error:", error.message);
      return { success: false, error: "Internal server error", status: 500 };
    }
  },

  async getBilling(accessToken: string): Promise<ControllerResponse> {
    try {
      const result = await getUserFromToken(accessToken);
      if (!result) {
        return { success: false, error: "Unauthorized", status: 401 };
      }

      // Mock billing data (replace with Stripe or similar)
      return {
        success: true,
        data: {
          plan: {
            name: "Pro",
            price: "$49",
            features: {
              bugReports: "Unlimited",
              teamMembers: 10,
              integrations: 5,
            },
            nextBillingDate: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
          billingHistory: [
            {
              id: "inv_001",
              date: new Date().toISOString(),
              amount: "$49",
              plan: "Pro",
              status: "Paid",
              invoice: "INV-001",
            },
          ],
          paymentMethod: {
            id: "pm_001",
            type: "Visa",
            lastFour: "4242",
            expiry: "12/26",
          },
        },
        status: 200,
      };
    } catch (error: any) {
      console.error("getBilling error:", error.message);
      return { success: false, error: "Internal server error", status: 500 };
    }
  },

  async updatePassword(
    accessToken: string,
    body: any
  ): Promise<ControllerResponse> {
    try {
      const result = await getUserFromToken(accessToken);
      if (!result) {
        return { success: false, error: "Unauthorized", status: 401 };
      }
      const { user } = result;

      const validatedData = passwordSchema.parse(body);
      const isMatch = await user.comparePassword(validatedData.currentPassword);
      if (!isMatch) {
        return {
          success: false,
          error: "Current password is incorrect",
          status: 400,
        };
      }

      user.password = validatedData.newPassword;
      await user.save();

      return {
        success: true,
        data: { message: "Password updated successfully" },
        status: 200,
      };
    } catch (error: any) {
      console.error("updatePassword error:", error.message);
      return {
        success: false,
        error: error.message || "Internal server error",
        status: 500,
      };
    }
  },

  async generateApiKey(accessToken: string): Promise<ControllerResponse> {
    try {
      const result = await getUserFromToken(accessToken);
      if (!result) {
        return { success: false, error: "Unauthorized", status: 401 };
      }

      const apiKey = crypto.randomBytes(32).toString("hex");
      // Store API key securely (e.g., hashed in a dedicated collection)
      return { success: true, data: { apiKey }, status: 200 };
    } catch (error: any) {
      console.error("generateApiKey error:", error.message);
      return { success: false, error: "Internal server error", status: 500 };
    }
  },

  async uploadProfileImage(
    accessToken: string,
    file: Buffer
  ): Promise<ControllerResponse> {
    try {
      const result = await getUserFromToken(accessToken);
      if (!result) {
        return { success: false, error: "Unauthorized", status: 401 };
      }
      const { user } = result;

      const uploadResult = await uploadImage(file, user._id.toString());
      user.image = (uploadResult as any).secure_url;
      await user.save();

      return {
        success: true,
        data: { imageUrl: user.image },
        status: 200,
      };
    } catch (error: any) {
      console.error("uploadProfileImage error:", error.message);
      return { success: false, error: "Internal server error", status: 500 };
    }
  },
};
