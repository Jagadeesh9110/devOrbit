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
  icon: LucideIcon;
}

interface NotificationsDropdownProps {
  className?: string;
}

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
        const response = await fetch("/api/user/notifications", {
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch notifications");
        }

        const { success, data, error } = await response.json();
        if (!success) {
          throw new Error(error || "Failed to fetch notifications");
        }

        setNotifications(data.notifications || []);
        setUnreadCount(
          data.notifications.filter((n: Notification) => !n.read).length
        );
        setError(null);
      } catch (err: any) {
        console.error("Error fetching notifications:", err.message);
        setError(err.message);
        if (err.message.includes("Unauthorized")) {
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
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to mark notification as read"
        );
      }

      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(
        notifications.filter((n) => n.id !== id && !n.read).length
      );
    } catch (err: any) {
      console.error("Error marking notification as read:", err.message);
      setError(err.message);
    }
  };

  const markAllAsRead = async (): Promise<void> => {
    try {
      const response = await fetch("/api/user/notifications/read", {
        method: "PUT",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to mark all notifications as read"
        );
      }

      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err: any) {
      console.error("Error marking all notifications as read:", err.message);
      setError(err.message);
    }
  };

  const removeNotification = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/user/notifications/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete notification");
      }

      setNotifications(notifications.filter((n) => n.id !== id));
      setUnreadCount(
        notifications.filter((n) => n.id !== id && !n.read).length
      );
    } catch (err: any) {
      console.error("Error deleting notification:", err.message);
      setError(err.message);
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
    markAsRead(notification.id);
    if (notification.bugId) {
      router.push(`/bugs/${notification.bugId}`);
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
          <div className="p-4 text-center text-sm text-red-600 bg-white dark:bg-slate-900">
            {error}
          </div>
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
                const IconComponent = notification.icon;
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
                          {notification.age}
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
