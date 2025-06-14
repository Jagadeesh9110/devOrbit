"use client";

import React, { useState } from "react";
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
  LucideIcon,
} from "lucide-react";

interface Notification {
  id: number;
  type: "bug_assigned" | "bug_resolved" | "mention" | "critical";
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: LucideIcon;
}

interface NotificationsDropdownProps {
  className?: string;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  className,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "bug_assigned",
      title: "New bug assigned to you",
      message: "BUG-001: Login button not responsive on mobile",
      time: "5 minutes ago",
      read: false,
      icon: Bug,
    },
    {
      id: 2,
      type: "bug_resolved",
      title: "Bug you reported was resolved",
      message: "BUG-003: Memory leak in dashboard component",
      time: "1 hour ago",
      read: false,
      icon: CheckCircle,
    },
    {
      id: 3,
      type: "mention",
      title: "You were mentioned in a comment",
      message: "Sarah Johnson mentioned you in BUG-005",
      time: "2 hours ago",
      read: true,
      icon: User,
    },
    {
      id: 4,
      type: "critical",
      title: "Critical bug needs attention",
      message: "BUG-007: Database connection timeout affecting all users",
      time: "3 hours ago",
      read: true,
      icon: AlertTriangle,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: number): void => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = (): void => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: number): void => {
    setNotifications(notifications.filter((n) => n.id !== id));
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

  const handleNotificationClick = (id: number): void => {
    markAsRead(id);
    // Add navigation logic here if needed
    // router.push(`/notifications/${id}`);
  };

  const handleRemoveClick = (e: React.MouseEvent, id: number): void => {
    e.stopPropagation();
    removeNotification(id);
  };

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
            <Badge className="absolute -top-1 -right-1 px-1 min-w-[16px] h-4 text-xs bg-red-500 hover:bg-red-500">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-h-96 overflow-y-auto"
      >
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs h-auto p-1"
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => {
              const IconComponent = notification.icon;
              return (
                <div
                  key={notification.id}
                  className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-b last:border-b-0 ${
                    !notification.read ? "bg-blue-50 dark:bg-blue-950" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification.id)}
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
                          onClick={(e) => handleRemoveClick(e, notification.id)}
                          className="h-auto p-0.5 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-500">
                        {notification.time}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button variant="ghost" size="sm" className="w-full text-sm">
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default { NotificationsDropdown };
