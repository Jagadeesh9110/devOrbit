"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Separator } from "@/components/ui/Separator";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { Switch } from "@/components/ui/Switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  User,
  Bell,
  Shield,
  Palette,
  Users,
  Plug,
  Trash2,
  LogOut,
} from "lucide-react";

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
  phoneNumber?: string;
  timezone?: string;
  twoFactorEnabled?: boolean;
  sessions?: Array<{ id: string; device: string; lastActive: string }>;
  // For notification settings
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
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
  const [activeTab, setActiveTab] = useState("profile");

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!settings) return;
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: value });
  };

  const handleSelectChange = (name: keyof UserSettings, value: string) => {
    if (!settings) return;
    setSettings({ ...settings, [name]: value });
  };

  const handleSwitchChange = (name: keyof UserSettings, checked: boolean) => {
    if (!settings) return;
    setSettings({ ...settings, [name]: checked });
  };

  const handleSave = async (section?: string) => {
    if (!settings) return;
    setIsUpdating(true);

    let payload: Partial<UserSettings> = {};
    if (section === "profile") {
      payload = {
        name: settings.name,
        email: settings.email,
        phoneNumber: settings.phoneNumber,
        timezone: settings.timezone,
      };
    } else if (section === "notifications") {
      payload = {
        emailNotifications: settings.emailNotifications,
        smsNotifications: settings.smsNotifications,
        pushNotifications: settings.pushNotifications,
      };
    } else if (section === "appearance") {
      payload = { themePreference: settings.themePreference };
    } else {
      // General save or specific section not handled here
      payload = {
        name: settings.name,
        email: settings.email,
        notificationsEnabled: settings.notificationsEnabled,
        themePreference: settings.themePreference,
        phoneNumber: settings.phoneNumber,
        timezone: settings.timezone,
        emailNotifications: settings.emailNotifications,
        smsNotifications: settings.smsNotifications,
        pushNotifications: settings.pushNotifications,
      };
    }

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(await response.text());

      toast.success(
        `${
          section
            ? section.charAt(0).toUpperCase() + section.slice(1)
            : "Settings"
        } updated successfully`
      );
      fetchSettings(); // Refresh data
    } catch (error) {
      console.error("Update error:", error);
      toast.error(`Failed to update ${section || "settings"}`);
    } finally {
      setIsUpdating(false);
    }
  };
  const handleAvatarUpload = async (url: string, publicId: string) => {
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
    setPasswordError("");
    setIsChangingPassword(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(passwordData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to change password");
      }

      toast.success("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Password change error:", error);
      setPasswordError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      toast.error("Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

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

  const handleToggle2FA = async () => {
    if (!settings) return;
    setIsUpdating(true);
    try {
      const response = await fetch("/api/profile/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ enable: !settings.twoFactorEnabled }),
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setSettings((prev) =>
        prev ? { ...prev, twoFactorEnabled: data.twoFactorEnabled } : null
      );
      toast.success(
        `Two-factor authentication ${
          data.twoFactorEnabled ? "enabled" : "disabled"
        }`
      );
    } catch (error) {
      console.error("2FA toggle error:", error);
      toast.error("Failed to update 2FA status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!settings) return;
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/profile/sessions/${sessionId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error(await response.text());
      setSettings((prev) =>
        prev
          ? {
              ...prev,
              sessions: prev.sessions?.filter((s) => s.id !== sessionId),
            }
          : null
      );
      toast.success("Session revoked successfully");
    } catch (error) {
      console.error("Revoke session error:", error);
      toast.error("Failed to revoke session");
    } finally {
      setIsUpdating(false);
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
        <Card className="w-full max-w-3xl mx-auto shadow-lg">
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

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
        Settings
      </h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg shadow-sm">
          <TabsTrigger
            value="profile"
            className="flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md transition-all"
          >
            <User className="h-5 w-5" /> Profile
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md transition-all"
          >
            <Bell className="h-5 w-5" /> Notifications
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md transition-all"
          >
            <Shield className="h-5 w-5" /> Security
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md transition-all"
          >
            <Palette className="h-5 w-5" /> Appearance
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md transition-all"
          >
            <Users className="h-5 w-5" /> Team
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md transition-all"
          >
            <Plug className="h-5 w-5" /> Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
              <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                Profile Information
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Update your personal details.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col items-center space-y-4 md:flex-row md:space-y-0 md:space-x-6">
                <Avatar className="h-24 w-24 ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-900">
                  <AvatarImage
                    src={settings.image || undefined}
                    alt={settings.name}
                  />
                  <AvatarFallback>
                    {settings.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <AvatarUpload
                  value={settings.image}
                  onChange={handleAvatarUpload}
                />
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="font-medium text-gray-700 dark:text-gray-300"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={settings.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="font-medium text-gray-700 dark:text-gray-300"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={settings.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    disabled={!!settings.authProvider}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  {settings.authProvider && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Email managed by {settings.authProvider}.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="phoneNumber"
                    className="font-medium text-gray-700 dark:text-gray-300"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={settings.phoneNumber || ""}
                    onChange={handleInputChange}
                    placeholder="+1 234 567 8900"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="role"
                    className="font-medium text-gray-700 dark:text-gray-300"
                  >
                    Role
                  </Label>
                  <Input
                    id="role"
                    name="role"
                    value={settings.role}
                    disabled
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="timezone"
                    className="font-medium text-gray-700 dark:text-gray-300"
                  >
                    Timezone
                  </Label>
                  <Select
                    name="timezone"
                    value={settings.timezone || "UTC"}
                    onValueChange={(value) =>
                      handleSelectChange("timezone", value)
                    }
                  >
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="GMT">GMT</SelectItem>
                      <SelectItem value="EST">EST</SelectItem>
                      <SelectItem value="PST">PST</SelectItem>
                      {/* Add more timezones as needed */}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700 p-6 flex justify-end">
              <Button
                onClick={() => handleSave("profile")}
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
              <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                Notification Settings
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Manage how you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm border dark:border-gray-600">
                <div>
                  <Label
                    htmlFor="emailNotifications"
                    className="font-medium text-gray-700 dark:text-gray-300"
                  >
                    Email Notifications
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive notifications via email.
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications || false}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("emailNotifications", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm border dark:border-gray-600">
                <div>
                  <Label
                    htmlFor="smsNotifications"
                    className="font-medium text-gray-700 dark:text-gray-300"
                  >
                    SMS Notifications
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive notifications via SMS (if phone number is provided).
                  </p>
                </div>
                <Switch
                  id="smsNotifications"
                  checked={settings.smsNotifications || false}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("smsNotifications", checked)
                  }
                  disabled={!settings.phoneNumber}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm border dark:border-gray-600">
                <div>
                  <Label
                    htmlFor="pushNotifications"
                    className="font-medium text-gray-700 dark:text-gray-300"
                  >
                    Push Notifications
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive push notifications in-app or on your device.
                  </p>
                </div>
                <Switch
                  id="pushNotifications"
                  checked={settings.pushNotifications || false}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("pushNotifications", checked)
                  }
                />
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700 p-6 flex justify-end">
              <Button
                onClick={() => handleSave("notifications")}
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
              <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                Security Settings
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Manage your account security.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              {/* Change Password Section */}
              {!settings.authProvider && (
                <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-sm border dark:border-gray-600">
                  <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">
                    Change Password
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        className="dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        className="dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                      />
                    </div>
                    {passwordError && (
                      <p className="text-sm text-red-500">{passwordError}</p>
                    )}
                    <Button
                      onClick={handlePasswordChange}
                      disabled={isChangingPassword}
                      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isChangingPassword ? "Changing..." : "Change Password"}
                    </Button>
                  </div>
                </div>
              )}

              {/* 2FA Section */}
              <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-sm border dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div>
                    <Label
                      htmlFor="twoFactorEnabled"
                      className="font-medium text-gray-700 dark:text-gray-300"
                    >
                      Two-Factor Authentication (2FA)
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Add an extra layer of security to your account.
                    </p>
                  </div>
                  <Switch
                    id="twoFactorEnabled"
                    checked={settings.twoFactorEnabled || false}
                    onCheckedChange={handleToggle2FA}
                    disabled={isUpdating}
                  />
                </div>
              </div>

              {/* Active Sessions Section */}
              <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-sm border dark:border-gray-600">
                <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">
                  Active Sessions
                </h3>
                {settings.sessions && settings.sessions.length > 0 ? (
                  <ul className="space-y-3">
                    {settings.sessions.map((session) => (
                      <li
                        key={session.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-600 rounded-md"
                      >
                        <div>
                          <p className="font-medium text-gray-700 dark:text-gray-300">
                            {session.device}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Last active: {session.lastActive}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeSession(session.id)}
                          disabled={isUpdating}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                        >
                          <LogOut className="h-4 w-4 mr-1" /> Revoke
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No active sessions found.
                  </p>
                )}
              </div>
            </CardContent>
            {/* Security tab doesn't need a global save button, actions are per section */}
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
              <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                Appearance Settings
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Customize the look and feel of the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="themePreference"
                  className="font-medium text-gray-700 dark:text-gray-300"
                >
                  Theme
                </Label>
                <Select
                  value={settings.themePreference}
                  onValueChange={(value) =>
                    handleSelectChange(
                      "themePreference",
                      value as "light" | "dark" | "system"
                    )
                  }
                >
                  <SelectTrigger className="w-full md:w-1/2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Choose your preferred theme for the application.
                </p>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700 p-6 flex justify-end">
              <Button
                onClick={() => handleSave("appearance")}
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card className="shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
              <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                Team Management
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Manage your team members and settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600 dark:text-gray-300">
                Team management features are coming soon.
              </p>
              {/* Placeholder for team management UI */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card className="shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
              <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                Integrations
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Connect with other services.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600 dark:text-gray-300">
                Integration features are coming soon.
              </p>
              {/* Placeholder for integrations UI */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Account Section - Placed outside tabs for prominence */}
      <div className="mt-12">
        <Card className="border-red-500 dark:border-red-700 shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-700">
            <CardTitle className="text-xl font-semibold text-red-700 dark:text-red-400">
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Deleting your account is a permanent action and cannot be undone.
              All your data will be removed.
            </p>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete My Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
