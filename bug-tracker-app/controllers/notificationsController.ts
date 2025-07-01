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
  age: string;
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

      const notifications = (await Notification.find({ userId: payload.userId })
        .sort({ time: -1 })
        .lean()) as LeanNotification[];

      return {
        success: true,
        data: {
          notifications: notifications.map((n) => ({
            id: n._id.toString(),
            type: n.type,
            title: n.title,
            message: n.message,
            time: n.time.toISOString(),
            read: n.read,
            bugId: n.bugId?.toString(),
            age: n.age,
            icon: iconMap[n.type] || UserIcon,
          })),
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
      const notifications = await Notification.find({
        userId: payload.userId,
        read: false,
      });
      await Promise.all(notifications.map((n) => n.markAsRead()));

      return {
        success: true,
        data: { message: "All notifications marked as read" },
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
          age: notification.age,
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
