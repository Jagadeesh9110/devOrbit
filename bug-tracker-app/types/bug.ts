import mongoose from "mongoose";
import { IBug } from "@/models/bugModel";

// Badge interface matching your User model
interface Badge {
  name: string;
  description: string;
  earnedAt: Date;
}

// User interface matching your IUser from userModel.ts
export interface PopulatedUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
  password?: string;
  image?: string;
  isVerified: boolean;
  verificationToken: string | null;
  verificationTokenExpiry: Date | null;
  resetToken: string | null;
  resetTokenExpiry: Date | null;
  role: "Admin" | "Project Manager" | "Developer" | "Tester";
  teamIds: mongoose.Types.ObjectId[];
  badges: Badge[];
  authProvider?: "GOOGLE" | "GITHUB";
  authProviderId?: string;
  notificationsEnabled: boolean;
  themePreference: "light" | "dark" | "system";
  phone?: string;
  location?: string;
  bio?: string;
  department?: string;
  jobTitle?: string;
  startDate?: Date;
  salary?: string;
  skills?: string[];
  status?: "online" | "away" | "offline";
  createdAt: Date;
  updatedAt: Date;
}

// Populated comment interface with your User model
export interface PopulatedComment {
  _id: mongoose.Types.ObjectId;
  text: string;
  author: PopulatedUser;
  mentions: mongoose.Types.ObjectId[];
  attachments: Array<{
    url: string;
    type: "image" | "file";
    name: string;
    size: number;
  }>;
  reactions: Array<{
    emoji: string;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
  }>;
  timeSpent?: number;
  createdAt: Date;
  updatedAt: Date;
}

// PopulatedBug interface with proper populated fields
export interface PopulatedBug {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  createdBy: PopulatedUser;
  projectId: mongoose.Types.ObjectId;
  assigneeId?: PopulatedUser;
  priority: "Low" | "Medium" | "High" | "Critical";
  severity: "Minor" | "Major" | "Critical";
  environment: "Development" | "Staging" | "Production";
  labels: string[];
  linkedPRs: { url: string; platform: "GitHub" | "GitLab" }[];
  comments: PopulatedComment[];
  attachments: Array<{
    url: string;
    type: "image" | "log" | "other";
    uploadedAt: Date;
  }>;
  viewers: Array<{
    userId: mongoose.Types.ObjectId;
    lastViewed: Date;
    viewCount: number;
  }>;
  resolvedBy?: mongoose.Types.ObjectId;
  closedBy?: mongoose.Types.ObjectId;
  dueDate?: Date;
  expectedFixDate?: Date;
  reopenedCount?: number;
  reopenedBy?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BugFilters {
  status: string;
  priority: string;
  assignee: string;
}
