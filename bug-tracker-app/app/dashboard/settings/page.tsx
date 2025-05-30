"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Separator } from "@/components/ui/Separator";
import { toast } from "sonner";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { Switch } from "@/components/ui/Switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { SourceTextModule } from "vm";

interface UserSettings {
  _id: string;
  name: string;
  email: string;
  image: string;
  role: string;
  authProvider?: "GOOGLE" | "GITHUB";
  isVerified: boolean;
  notificationsEnabled: boolean;
  themePreference: "light" | "dark" | "system";
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/profile", {
        credentials: "include",
      });

      if (response.status === 401) {
        const refreshResponse = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (refreshResponse.ok) {
          return fetchSettings();
        }
        router.push("/login");
        return;
      }

      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setIsUpdating(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: settings.name,
          email: settings.email,
          notificationsEnabled: settings.notificationsEnabled,
          themePreference: settings.themePreference,
        }),
      });

      if (!response.ok) throw new Error(await response.text());

      toast.success("Settings updated successfully");
      fetchSettings(); // Refresh data
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update settings");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarUpload = async (url: string) => {
    if (!settings) return;

    try {
      const response = await fetch("/api/profile/avatar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ image: url }),
      });

      if (!response.ok) throw new Error(await response.text());

      toast.success("Avatar updated successfully");
      fetchSettings(); // Refresh data
    } catch (error) {
      console.error("Avatar error:", error);
      toast.error("Failed to update avatar");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Failed to load settings. Please try again.</p>
            <Button onClick={fetchSettings} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/delete-account", {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete account");
      }

      toast.success("Account deleted successfully");
      router.push("/");
    } catch (error) {
      console.error("Delete account error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete account"
      );
    }
  };

  const handlePasswordChange = async () => {
    if (!settings) return;
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    setIsChangingPassword(true);
    setPasswordError("");
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to change password");
      }

      toast.success("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setPasswordError(
        error instanceof Error ? error.message : "Failed to change Password"
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold">Account Settings</h1>
      <Separator />

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div>
              <Label>Profile Picture</Label>
              <AvatarUpload
                value={settings.image}
                onChange={handleAvatarUpload}
              />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={settings.name}
                  onChange={(e) =>
                    setSettings({ ...settings, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  disabled={!!settings.authProvider}
                  onChange={(e) =>
                    setSettings({ ...settings, email: e.target.value })
                  }
                />
                {settings.authProvider && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Email managed by {settings.authProvider}
                  </p>
                )}
              </div>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save Profile"}
          </Button>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b">
          <CardTitle className="text-xl">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive important updates via email
              </p>
            </div>
            <Switch
              checked={settings.notificationsEnabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, notificationsEnabled: checked })
              }
            />
          </div>

          <div>
            <Label>Theme Preference</Label>
            <Select
              value={settings.themePreference}
              onValueChange={(value) =>
                setSettings({ ...settings, themePreference: value as any })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b">
          <CardTitle className="text-xl">Security</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {!settings.authProvider && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Change Password</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Update your account password for enhanced security
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Enter current password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              {passwordError && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {passwordError}
                </p>
              )}
              <div className="flex justify-end">
                <Button
                  onClick={handlePasswordChange}
                  disabled={isChangingPassword}
                  className="w-full sm:w-auto"
                >
                  {isChangingPassword ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </div>
              <Separator />
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Active Sessions</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your logged-in devices
              </p>
            </div>
            <div className="border rounded-lg divide-y">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">Current Device</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date().toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    Active
                  </span>
                  <Button variant="outline" size="sm">
                    Logout
                  </Button>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full sm:w-auto">
              View All Sessions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="overflow-hidden border-red-200 dark:border-red-800/50">
        <CardHeader className="bg-red-50 dark:bg-red-900/20 px-6 py-4 border-b border-red-200 dark:border-red-800/50">
          <CardTitle className="text-xl text-red-600 dark:text-red-400">
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Delete Account</h3>
            <p className="text-sm text-muted-foreground">
              Permanently remove your account and all associated data
            </p>
          </div>
          <div className="rounded-lg border border-red-200 dark:border-red-800/50 p-4 bg-red-50 dark:bg-red-900/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-medium text-red-600 dark:text-red-400">
                  This action cannot be undone
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  All your data will be permanently deleted from our servers.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                className="w-full sm:w-auto"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
