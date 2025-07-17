"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Bug,
  CheckCircle,
  AlertTriangle,
  User,
  X,
  Sparkles,
  Target,
  LucideIcon,
} from "lucide-react";

interface Notification {
  id: string;
  type: "bug_assigned" | "bug_resolved" | "mention" | "critical";
  title: string;
  message: string;
  time: string;
  read: boolean;
  bugId?: string;
  age: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationsDropdownProps {
  className?: string;
}

// Helper function to get icon based on notification type
const getNotificationIcon = (type: Notification["type"]): LucideIcon => {
  switch (type) {
    case "bug_assigned":
      return Bug;
    case "bug_resolved":
      return CheckCircle;
    case "mention":
      return User;
    case "critical":
      return AlertTriangle;
    default:
      return Bell;
  }
};

// Helper function to calculate age if not provided or invalid
const calculateAge = (time: string): string => {
  try {
    const timeDate = new Date(time);
    if (isNaN(timeDate.getTime())) {
      return "Recently";
    }

    const now = new Date();
    const diffMs = now.getTime() - timeDate.getTime();
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

// Helper function to safely process notification data
const processNotification = (notification: any): Notification => {
  return {
    id: notification.id || notification._id || Math.random().toString(),
    type: notification.type || "mention",
    title: notification.title || "Notification",
    message: notification.message || "",
    time:
      notification.time || notification.createdAt || new Date().toISOString(),
    read: Boolean(notification.read),
    bugId: notification.bugId || undefined,
    age:
      notification.age ||
      calculateAge(notification.time || notification.createdAt),
    createdAt: notification.createdAt || new Date().toISOString(),
    updatedAt: notification.updatedAt || new Date().toISOString(),
  };
};

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  className,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/user/notifications", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const { success, data, error: apiError } = await response.json();

        if (!success) {
          throw new Error(apiError || "Failed to fetch notifications");
        }

        // Safely process notifications
        const rawNotifications = data?.notifications || [];
        const processedNotifications = rawNotifications.map(
          (notification: any) => {
            try {
              return processNotification(notification);
            } catch (err) {
              console.error(
                "Error processing notification:",
                err,
                notification
              );
              // Return a safe fallback notification
              return {
                id:
                  notification.id ||
                  notification._id ||
                  Math.random().toString(),
                type: "mention" as const,
                title: "Notification",
                message: "Error loading notification",
                time: new Date().toISOString(),
                read: true,
                age: "Recently",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
            }
          }
        );

        setNotifications(processedNotifications);
        setUnreadCount(
          processedNotifications.filter((n: Notification) => !n.read).length
        );
      } catch (err: any) {
        console.error("Error fetching notifications:", err);
        setError(err.message || "Failed to load notifications");

        // Handle authentication errors
        if (
          err.message.includes("Unauthorized") ||
          err.message.includes("401")
        ) {
          router.push("/auth/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [router]);

  const markAsRead = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/user/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Failed to mark notification as read"
        );
      }

      // Update local state
      setNotifications((prevNotifications) =>
        prevNotifications.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
    } catch (err: any) {
      console.error("Error marking notification as read:", err);
      setError(err.message || "Failed to mark as read");
    }
  };

  const markAllAsRead = async (): Promise<void> => {
    try {
      const response = await fetch("/api/user/notifications/read", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Failed to mark all notifications as read"
        );
      }

      // Update local state
      setNotifications((prevNotifications) =>
        prevNotifications.map((n) => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (err: any) {
      console.error("Error marking all notifications as read:", err);
      setError(err.message || "Failed to mark all as read");
    }
  };

  const removeNotification = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/user/notifications/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete notification");
      }

      // Update local state
      const notificationToRemove = notifications.find((n) => n.id === id);
      setNotifications((prevNotifications) =>
        prevNotifications.filter((n) => n.id !== id)
      );

      // Update unread count if the removed notification was unread
      if (notificationToRemove && !notificationToRemove.read) {
        setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
      }
    } catch (err: any) {
      console.error("Error deleting notification:", err);
      setError(err.message || "Failed to delete notification");
    }
  };

  const getNotificationColor = (type: Notification["type"]): string => {
    switch (type) {
      case "bug_assigned":
        return "text-blue-600";
      case "bug_resolved":
        return "text-green-600";
      case "mention":
        return "text-purple-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-slate-600";
    }
  };

  const handleNotificationClick = (notification: Notification): void => {
    try {
      // Mark as read first
      if (!notification.read) {
        markAsRead(notification.id);
      }

      // Navigate to bug if bugId exists and is valid
      if (notification.bugId && notification.bugId.trim() !== "") {
        router.push(`/bugs/${notification.bugId}`);
      }
    } catch (err) {
      console.error("Error handling notification click:", err);
    }
  };

  const handleRemoveClick = (e: React.MouseEvent, id: string): void => {
    e.stopPropagation();
    removeNotification(id);
  };

  const hasNotifications = notifications.length > 0;

  const EmptyNotificationsState = () => (
    <div className="p-6 text-center bg-white dark:bg-slate-900">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-white" />
      </div>
      <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
        Stay in the Loop
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 max-w-48">
        Get notified about bug assignments, resolutions, and team activities
        once you start using the platform
      </p>
      <div className="space-y-2 text-xs text-slate-500">
        <div className="flex items-center gap-2 justify-center">
          <Bug className="w-3 h-3 text-blue-500" />
          <span>Bug assignments & updates</span>
        </div>
        <div className="flex items-center gap-2 justify-center">
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span>Resolution notifications</span>
        </div>
        <div className="flex items-center gap-2 justify-center">
          <User className="w-3 h-3 text-purple-500" />
          <span>Team mentions & comments</span>
        </div>
        <div className="flex items-center gap-2 justify-center">
          <Target className="w-3 h-3 text-orange-500" />
          <span>Project milestones</span>
        </div>
      </div>
    </div>
  );

  const ErrorState = ({ message }: { message: string }) => (
    <div className="p-4 text-center bg-white dark:bg-slate-900">
      <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
      <p className="text-sm text-red-600 dark:text-red-400 mb-2">{message}</p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.location.reload()}
        className="text-xs"
      >
        Retry
      </Button>
    </div>
  );

  if (loading) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`relative ${className || ""}`}
          >
            <Bell className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg z-50"
          sideOffset={5}
        >
          <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              Notifications
            </h3>
          </div>
          <div className="p-4 text-center text-sm text-slate-500 bg-white dark:bg-slate-900">
            Loading...
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`relative ${className || ""}`}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1 min-w-[16px] h-4 text-xs bg-red-500 hover:bg-red-500 text-white">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-h-96 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl z-50"
        sideOffset={5}
      >
        {error ? (
          <ErrorState message={error} />
        ) : !hasNotifications ? (
          <EmptyNotificationsState />
        ) : (
          <>
            <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs h-auto p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    Mark all read
                  </Button>
                )}
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto bg-white dark:bg-slate-900">
              {notifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                const displayAge =
                  notification.age || calculateAge(notification.time);

                return (
                  <div
                    key={notification.id}
                    className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-b-0 transition-colors ${
                      !notification.read
                        ? "bg-blue-50 dark:bg-blue-950/50"
                        : "bg-white dark:bg-slate-900"
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <IconComponent
                        className={`w-4 h-4 mt-1 ${getNotificationColor(
                          notification.type
                        )}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {notification.title}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) =>
                              handleRemoveClick(e, notification.id)
                            }
                            className="h-auto p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          {displayAge}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
            <div className="p-2 bg-white dark:bg-slate-900">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => router.push("/notifications")}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
