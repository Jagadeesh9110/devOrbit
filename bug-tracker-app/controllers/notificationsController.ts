import mongoose from "mongoose";
import connectDB from "@/lib/db/Connect";
import Notification, { INotification } from "@/models/notificationModel";
import User from "@/models/userModel";
import { verifyToken, TokenPayload } from "@/lib/auth";
import {
  Bug,
  CheckCircle,
  User as UserIcon,
  AlertTriangle,
} from "lucide-react";

interface LeanNotification {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: "bug_assigned" | "bug_resolved" | "mention" | "critical";
  title: string;
  message: string;
  time: Date;
  read: boolean;
  bugId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

interface ControllerResponse {
  success: boolean;
  data?: any;
  error?: string;
  status: number;
}

const iconMap: { [key: string]: any } = {
  bug_assigned: Bug,
  bug_resolved: CheckCircle,
  mention: UserIcon,
  critical: AlertTriangle,
};

// Helper function to calculate age from date
const calculateAge = (date: Date): string => {
  try {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    if (diffHours > 0)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffMinutes > 0)
      return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    return "Just now";
  } catch (error) {
    console.error("Error calculating age:", error);
    return "Recently";
  }
};

export const notificationsController = {
  async getNotifications(accessToken: string): Promise<ControllerResponse> {
    try {
      const payload = verifyToken(accessToken) as TokenPayload | null;
      if (!payload) {
        return { success: false, error: "Unauthorized", status: 401 };
      }

      await connectDB();
      const user = await User.findById(payload.userId).select(
        "notificationsEnabled"
      );
      if (!user) {
        return { success: false, error: "User not found", status: 404 };
      }

      if (!user.notificationsEnabled) {
        return { success: true, data: { notifications: [] }, status: 200 };
      }

      // Use lean() query but don't expect virtual properties
      const notifications = (await Notification.find({ userId: payload.userId })
        .sort({ time: -1 })
        .lean()) as LeanNotification[];

      // Process notifications and add age calculation
      const processedNotifications = notifications.map((n) => {
        try {
          return {
            id: n._id.toString(),
            type: n.type,
            title: n.title || "Notification",
            message: n.message || "",
            time: n.time.toISOString(),
            read: Boolean(n.read),
            bugId: n.bugId?.toString() || undefined,
            age: calculateAge(n.time),
            createdAt: n.createdAt.toISOString(),
            updatedAt: n.updatedAt.toISOString(),
            icon: iconMap[n.type] || UserIcon,
          };
        } catch (error) {
          console.error("Error processing notification:", error, n);
          // Return a safe fallback notification
          return {
            id: n._id.toString(),
            type: n.type,
            title: "Notification",
            message: "Error loading notification",
            time: new Date().toISOString(),
            read: true,
            age: "Recently",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            icon: UserIcon,
          };
        }
      });

      return {
        success: true,
        data: {
          notifications: processedNotifications,
        },
        status: 200,
      };
    } catch (error: any) {
      console.error("getNotifications error:", error.message);
      return { success: false, error: "Internal server error", status: 500 };
    }
  },

  async markNotificationAsRead(
    accessToken: string,
    notificationId: string
  ): Promise<ControllerResponse> {
    try {
      const payload = verifyToken(accessToken) as TokenPayload | null;
      if (!payload) {
        return { success: false, error: "Unauthorized", status: 401 };
      }

      if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        return {
          success: false,
          error: "Invalid notification ID",
          status: 400,
        };
      }

      await connectDB();
      const notification = await Notification.findOne({
        _id: notificationId,
        userId: payload.userId,
      });

      if (!notification) {
        return { success: false, error: "Notification not found", status: 404 };
      }

      await notification.markAsRead();

      return {
        success: true,
        data: { message: "Notification marked as read" },
        status: 200,
      };
    } catch (error: any) {
      console.error("markNotificationAsRead error:", error.message);
      return { success: false, error: "Internal server error", status: 500 };
    }
  },

  async markAllNotificationsAsRead(
    accessToken: string
  ): Promise<ControllerResponse> {
    try {
      const payload = verifyToken(accessToken) as TokenPayload | null;
      if (!payload) {
        return { success: false, error: "Unauthorized", status: 401 };
      }

      await connectDB();

      const result = await Notification.updateMany(
        {
          userId: payload.userId,
          read: false,
        },
        {
          read: true,
        }
      );

      return {
        success: true,
        data: {
          message: "All notifications marked as read",
          modifiedCount: result.modifiedCount,
        },
        status: 200,
      };
    } catch (error: any) {
      console.error("markAllNotificationsAsRead error:", error.message);
      return { success: false, error: "Internal server error", status: 500 };
    }
  },

  async deleteNotification(
    accessToken: string,
    notificationId: string
  ): Promise<ControllerResponse> {
    try {
      const payload = verifyToken(accessToken) as TokenPayload | null;
      if (!payload) {
        return { success: false, error: "Unauthorized", status: 401 };
      }

      if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        return {
          success: false,
          error: "Invalid notification ID",
          status: 400,
        };
      }

      await connectDB();
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        userId: payload.userId,
      });

      if (!notification) {
        return { success: false, error: "Notification not found", status: 404 };
      }

      return {
        success: true,
        data: { message: "Notification deleted" },
        status: 200,
      };
    } catch (error: any) {
      console.error("deleteNotification error:", error.message);
      return { success: false, error: "Internal server error", status: 500 };
    }
  },

  async createNotification(
    userId: string,
    type: "bug_assigned" | "bug_resolved" | "mention" | "critical",
    title: string,
    message: string,
    bugId?: string
  ): Promise<ControllerResponse> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return { success: false, error: "Invalid user ID", status: 400 };
      }

      if (bugId && !mongoose.Types.ObjectId.isValid(bugId)) {
        return { success: false, error: "Invalid bug ID", status: 400 };
      }

      await connectDB();
      const user = await User.findById(userId).select("notificationsEnabled");
      if (!user) {
        return { success: false, error: "User not found", status: 404 };
      }

      if (!user.notificationsEnabled) {
        return {
          success: true,
          data: { message: "Notifications disabled" },
          status: 200,
        };
      }

      const notification = new Notification({
        userId,
        type,
        title,
        message,
        bugId: bugId ? new mongoose.Types.ObjectId(bugId) : undefined,
      });

      await notification.save();

      return {
        success: true,
        data: {
          id: notification._id.toString(),
          type: notification.type,
          title: notification.title,
          message: notification.message,
          time: notification.time.toISOString(),
          read: notification.read,
          bugId: notification.bugId?.toString(),
          age: calculateAge(notification.time),
          createdAt: notification.createdAt.toISOString(),
          updatedAt: notification.updatedAt.toISOString(),
          icon: iconMap[notification.type] || UserIcon,
        },
        status: 201,
      };
    } catch (error: any) {
      console.error("createNotification error:", error.message);
      return { success: false, error: "Internal server error", status: 500 };
    }
  },
};
