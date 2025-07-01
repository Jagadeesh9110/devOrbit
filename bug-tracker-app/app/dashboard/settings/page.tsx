"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast, { Toaster } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Textarea } from "@/components/ui/TextArea";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import {
  Bell,
  Mail,
  Shield,
  Globe,
  Key,
  Users,
  ExternalLink,
  UserPlus,
  Crown,
  MoreHorizontal,
  CreditCard,
  Download,
  Calendar,
  Check,
  ArrowRight,
} from "lucide-react";
import { fetchWithAuth } from "@/lib/auth";

// Form schemas
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  role: z.enum(["Admin", "Project Manager", "Developer", "Tester"]),
  timezone: z.string().min(1, "Timezone is required"),
  language: z.string().min(1, "Language is required"),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
});

const notificationsSchema = z.object({
  email: z.boolean(),
  push: z.boolean(),
  slack: z.boolean(),
  bugAssigned: z.boolean(),
  bugResolved: z.boolean(),
  weeklyReport: z.boolean(),
});

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, "Current password must be at least 8 characters"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

interface Notifications {
  email: boolean;
  push: boolean;
  slack: boolean;
  bugAssigned: boolean;
  bugResolved: boolean;
  weeklyReport: boolean;
}

interface Profile {
  name: string;
  email: string;
  role: "Admin" | "Project Manager" | "Developer" | "Tester";
  timezone: string;
  language: string;
  bio?: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Pending";
  joinDate: string;
}

interface BillingHistory {
  id: string;
  date: string;
  amount: string;
  plan: string;
  status: "Paid" | "Pending" | "Failed";
  invoice: string;
}

interface Plan {
  name: string;
  price: string;
  features: {
    bugReports: number | string;
    teamMembers: number | string;
    integrations: number | string;
  };
  nextBillingDate: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  lastFour: string;
  expiry: string;
}

interface Integration {
  name: string;
  status: "connected" | "disconnected";
  description: string;
}

interface SettingsData {
  profile: Profile | null;
  notifications: Notifications | null;
  teamMembers: TeamMember[];
  plan: Plan | null;
  billingHistory: BillingHistory[];
  paymentMethod: PaymentMethod | null;
  integrations: Integration[];
}

const Settings = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [settingsData, setSettingsData] = useState<SettingsData>({
    profile: null,
    notifications: null,
    teamMembers: [],
    plan: null,
    billingHistory: [],
    paymentMethod: null,
    integrations: [],
  });
  const [imageUploading, setImageUploading] = useState<boolean>(false);

  // Forms
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "Developer",
      timezone: "America/Los_Angeles",
      language: "English",
      bio: "",
    },
  });

  const notificationsForm = useForm<z.infer<typeof notificationsSchema>>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: {
      email: false,
      push: false,
      slack: false,
      bugAssigned: false,
      bugResolved: false,
      weeklyReport: false,
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const fetchSettingsData = async () => {
      setLoading(true);
      try {
        const [
          profileRes,
          notificationsRes,
          teamRes,
          billingRes,
          integrationsRes,
        ] = await Promise.all([
          fetchWithAuth("/api/settings/profile"),
          fetchWithAuth("/api/settings/notifications"),
          fetchWithAuth("/api/settings/team"),
          fetchWithAuth("/api/settings/billing"),
          fetchWithAuth("/api/settings/integrations"),
        ]);

        if (
          !profileRes.success ||
          !notificationsRes.success ||
          !teamRes.success ||
          !billingRes.success ||
          !integrationsRes.success
        ) {
          throw new Error("Failed to fetch settings data");
        }

        const data: SettingsData = {
          profile: profileRes.data,
          notifications: notificationsRes.data,
          teamMembers: teamRes.data.members,
          plan: billingRes.data.plan,
          billingHistory: billingRes.data.billingHistory,
          paymentMethod: billingRes.data.paymentMethod,
          integrations: integrationsRes.data,
        };

        setSettingsData(data);
        if (data.profile) profileForm.reset(data.profile);
        if (data.notifications) notificationsForm.reset(data.notifications);
      } catch (err: any) {
        setError(err.message || "Failed to fetch settings data");
        toast.error(err.message || "Failed to fetch settings data");
      } finally {
        setLoading(false);
      }
    };

    fetchSettingsData();
  }, [profileForm, notificationsForm]);

  const handleProfileSave = async (data: z.infer<typeof profileSchema>) => {
    try {
      const res = await fetchWithAuth("/api/settings/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (!res.success) throw new Error(res.error || "Failed to save profile");
      setSettingsData({ ...settingsData, profile: res.data });
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    }
  };

  const handleNotificationsSave = async (
    data: z.infer<typeof notificationsSchema>
  ) => {
    try {
      const res = await fetchWithAuth("/api/settings/notifications", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (!res.success)
        throw new Error(res.error || "Failed to save notifications");
      setSettingsData({ ...settingsData, notifications: res.data });
      toast.success("Notifications updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to save notifications");
    }
  };

  const handlePasswordUpdate = async (data: z.infer<typeof passwordSchema>) => {
    try {
      const res = await fetchWithAuth("/api/settings/password", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (!res.success)
        throw new Error(res.error || "Failed to update password");
      toast.success("Password updated successfully");
      passwordForm.reset();
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    }
  };

  const handleGenerateApiKey = async () => {
    try {
      const res = await fetchWithAuth("/api/settings/api-key", {
        method: "POST",
      });
      if (!res.success)
        throw new Error(res.error || "Failed to generate API key");
      toast.success(`New API key: ${res.data.apiKey}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate API key");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setImageUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload/profile-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Image upload failed");
      toast.success("Profile picture updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setImageUploading(false);
    }
  };

  const handleInviteMember = () => {
    router.push("/dashboard/settings/invite");
  };

  const EmptyStateCard = ({
    icon: Icon,
    title,
    description,
    actionText,
    onAction,
  }: {
    icon: any;
    title: string;
    description: string;
    actionText: string;
    onAction: () => void;
  }) => (
    <Card className="bg-gradient-to-br from-blue-500 to-purple-500 border-0 text-white text-center">
      <CardContent className="p-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
          <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-white/80 text-sm mb-4">{description}</p>
        <Button
          onClick={onAction}
          variant="secondary"
          size="sm"
          className="bg-white/20 hover:bg-white/30 text-white border-white/30"
        >
          {actionText}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  if (!settingsData.profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <Toaster position="top-right" />
        <main className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Welcome to Your Settings
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Get started by setting up your profile and inviting your team.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EmptyStateCard
              icon={Users}
              title="Complete Your Profile"
              description="Set up your name, role, and preferences to personalize your experience."
              actionText="Set Up Profile"
              onAction={() =>
                profileForm.reset({ ...settingsData.profile, name: "New User" })
              }
            />
            <EmptyStateCard
              icon={UserPlus}
              title="Invite Your Team"
              description="Collaborate by adding team members to your project."
              actionText="Invite Members"
              onAction={handleInviteMember}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <Toaster position="top-right" />
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your account and application preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Profile Information
                    </CardTitle>
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-2"
                      >
                        View Full Profile
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form
                    onSubmit={profileForm.handleSubmit(handleProfileSave)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          {...profileForm.register("name")}
                          className={
                            profileForm.formState.errors.name
                              ? "border-red-500"
                              : ""
                          }
                        />
                        {profileForm.formState.errors.name && (
                          <p className="text-red-500 text-sm">
                            {profileForm.formState.errors.name.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          {...profileForm.register("email")}
                          className={
                            profileForm.formState.errors.email
                              ? "border-red-500"
                              : ""
                          }
                        />
                        {profileForm.formState.errors.email && (
                          <p className="text-red-500 text-sm">
                            {profileForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={profileForm.watch("role")}
                        onValueChange={(value) =>
                          profileForm.setValue(
                            "role",
                            value as
                              | "Admin"
                              | "Project Manager"
                              | "Developer"
                              | "Tester"
                          )
                        }
                      >
                        <SelectTrigger
                          className={
                            profileForm.formState.errors.role
                              ? "border-red-500"
                              : ""
                          }
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Project Manager">
                            Project Manager
                          </SelectItem>
                          <SelectItem value="Developer">Developer</SelectItem>
                          <SelectItem value="Tester">Tester</SelectItem>
                        </SelectContent>
                      </Select>
                      {profileForm.formState.errors.role && (
                        <p className="text-red-500 text-sm">
                          {profileForm.formState.errors.role.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select
                          value={profileForm.watch("timezone")}
                          onValueChange={(value) =>
                            profileForm.setValue("timezone", value)
                          }
                        >
                          <SelectTrigger
                            className={
                              profileForm.formState.errors.timezone
                                ? "border-red-500"
                                : ""
                            }
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/Los_Angeles">
                              Pacific Time
                            </SelectItem>
                            <SelectItem value="America/New_York">
                              Eastern Time
                            </SelectItem>
                            <SelectItem value="Europe/London">GMT</SelectItem>
                            <SelectItem value="Asia/Tokyo">JST</SelectItem>
                          </SelectContent>
                        </Select>
                        {profileForm.formState.errors.timezone && (
                          <p className="text-red-500 text-sm">
                            {profileForm.formState.errors.timezone.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="language">Language</Label>
                        <Select
                          value={profileForm.watch("language")}
                          onValueChange={(value) =>
                            profileForm.setValue("language", value)
                          }
                        >
                          <SelectTrigger
                            className={
                              profileForm.formState.errors.language
                                ? "border-red-500"
                                : ""
                            }
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Spanish">Spanish</SelectItem>
                            <SelectItem value="French">French</SelectItem>
                            <SelectItem value="German">German</SelectItem>
                          </SelectContent>
                        </Select>
                        {profileForm.formState.errors.language && (
                          <p className="text-red-500 text-sm">
                            {profileForm.formState.errors.language.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        {...profileForm.register("bio")}
                        placeholder="Tell us about yourself..."
                        className={`min-h-[100px] ${
                          profileForm.formState.errors.bio
                            ? "border-red-500"
                            : ""
                        }`}
                      />
                      {profileForm.formState.errors.bio && (
                        <p className="text-red-500 text-sm">
                          {profileForm.formState.errors.bio.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={profileForm.formState.isSubmitting}
                    >
                      {profileForm.formState.isSubmitting
                        ? "Saving..."
                        : "Save Changes"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="w-24 h-24">
                      <AvatarFallback className="bg-blue-500 text-white text-xl">
                        {settingsData.profile?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={imageUploading}
                        asChild
                      >
                        <label>
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleImageUpload}
                          />
                          {imageUploading ? "Uploading..." : "Upload Photo"}
                        </label>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        disabled={imageUploading}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form
                  onSubmit={notificationsForm.handleSubmit(
                    handleNotificationsSave
                  )}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <h3 className="font-medium">Notification Methods</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email">Email Notifications</Label>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Receive notifications via email
                          </p>
                        </div>
                        <Switch
                          id="email"
                          checked={notificationsForm.watch("email")}
                          onCheckedChange={(checked) =>
                            notificationsForm.setValue("email", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="push">Push Notifications</Label>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Browser push notifications
                          </p>
                        </div>
                        <Switch
                          id="push"
                          checked={notificationsForm.watch("push")}
                          onCheckedChange={(checked) =>
                            notificationsForm.setValue("push", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="slack">Slack Integration</Label>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Send notifications to Slack
                          </p>
                        </div>
                        <Switch
                          id="slack"
                          checked={notificationsForm.watch("slack")}
                          onCheckedChange={(checked) =>
                            notificationsForm.setValue("slack", checked)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Event Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="bugAssigned">
                            Bug Assigned to Me
                          </Label>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            When a bug is assigned to you
                          </p>
                        </div>
                        <Switch
                          id="bugAssigned"
                          checked={notificationsForm.watch("bugAssigned")}
                          onCheckedChange={(checked) =>
                            notificationsForm.setValue("bugAssigned", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="bugResolved">Bug Resolved</Label>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            When bugs you reported are resolved
                          </p>
                        </div>
                        <Switch
                          id="bugResolved"
                          checked={notificationsForm.watch("bugResolved")}
                          onCheckedChange={(checked) =>
                            notificationsForm.setValue("bugResolved", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="weeklyReport">Weekly Report</Label>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Weekly summary of bug activity
                          </p>
                        </div>
                        <Switch
                          id="weeklyReport"
                          checked={notificationsForm.watch("weeklyReport")}
                          onCheckedChange={(checked) =>
                            notificationsForm.setValue("weeklyReport", checked)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={notificationsForm.formState.isSubmitting}
                  >
                    {notificationsForm.formState.isSubmitting
                      ? "Saving..."
                      : "Save Preferences"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Password & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form
                    onSubmit={passwordForm.handleSubmit(handlePasswordUpdate)}
                    className="space-y-4"
                  >
                    <div>
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        {...passwordForm.register("currentPassword")}
                        className={
                          passwordForm.formState.errors.currentPassword
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="text-red-500 text-sm">
                          {
                            passwordForm.formState.errors.currentPassword
                              .message
                          }
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        {...passwordForm.register("newPassword")}
                        className={
                          passwordForm.formState.errors.newPassword
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-red-500 text-sm">
                          {passwordForm.formState.errors.newPassword.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        {...passwordForm.register("confirmPassword")}
                        className={
                          passwordForm.formState.errors.confirmPassword
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-red-500 text-sm">
                          {
                            passwordForm.formState.errors.confirmPassword
                              .message
                          }
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={passwordForm.formState.isSubmitting}
                    >
                      {passwordForm.formState.isSubmitting
                        ? "Updating..."
                        : "Update Password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    API Keys
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <div className="font-medium">Production API Key</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          •••••••••••••••••••••••••••••••••••••••
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                        >
                          Revoke
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleGenerateApiKey}
                    disabled={imageUploading}
                  >
                    Generate New API Key
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Connected Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {settingsData.integrations.map((integration) => (
                  <div
                    key={integration.name}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{integration.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {integration.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          integration.status === "connected"
                            ? "default"
                            : "outline"
                        }
                        className={
                          integration.status === "connected"
                            ? "bg-green-500 text-white"
                            : ""
                        }
                      >
                        {integration.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        {integration.status === "connected"
                          ? "Configure"
                          : "Connect"}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Team Members
                    </CardTitle>
                    <Button
                      className="flex items-center gap-2 ml-auto"
                      onClick={handleInviteMember}
                    >
                      <UserPlus className="w-4 h-4" />
                      Invite Member
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <Input
                        placeholder="Search team members..."
                        className="flex-1"
                      />
                      <Select defaultValue="all">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="developer">Developer</SelectItem>
                          <SelectItem value="qa">QA Tester</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {settingsData.teamMembers.length === 0 ? (
                      <EmptyStateCard
                        icon={UserPlus}
                        title="No Team Members Yet"
                        description="Invite your team to collaborate on projects and bugs."
                        actionText="Invite Members"
                        onAction={handleInviteMember}
                      />
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Join Date</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {settingsData.teamMembers.map((member) => (
                            <TableRow key={member.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-8 h-8">
                                    <AvatarFallback className="bg-blue-500 text-white">
                                      {member.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium flex items-center gap-2">
                                      {member.name}
                                      {member.role === "Admin" && (
                                        <Crown className="w-3 h-3 text-yellow-500" />
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                      {member.email}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{member.role}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    member.status === "Active"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className={
                                    member.status === "Active"
                                      ? "bg-green-500 text-white"
                                      : ""
                                  }
                                >
                                  {member.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(member.joinDate).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Team Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow team members to invite others</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Team members can send invitations
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require admin approval for new members</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        New invitations need admin approval
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable team activity notifications</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Notify about team member activities
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="billing">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Current Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {settingsData.plan ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">
                              {settingsData.plan.name}
                            </h3>
                            <Badge className="bg-blue-500 text-white">
                              Current
                            </Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400">
                            Advanced features for growing teams
                          </p>
                          <div className="text-2xl font-bold mt-2">
                            {settingsData.plan.price}
                            <span className="text-base font-normal">
                              /month
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Next billing date
                          </div>
                          <div className="font-semibold">
                            {new Date(
                              settingsData.plan.nextBillingDate
                            ).toLocaleDateString()}
                          </div>
                          <Button variant="outline" className="mt-2">
                            Change Plan
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {settingsData.plan.features.bugReports}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Bug reports / month
                          </div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {settingsData.plan.features.teamMembers}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Team members
                          </div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {settingsData.plan.features.integrations}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Integrations
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <EmptyStateCard
                      icon={CreditCard}
                      title="No Plan Selected"
                      description="Choose a plan to unlock advanced features and collaboration tools."
                      actionText="Explore Plans"
                      onAction={() => router.push("/pricing")}
                    />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  {settingsData.paymentMethod ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                            {settingsData.paymentMethod.type.toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">
                              •••• •••• ••••{" "}
                              {settingsData.paymentMethod.lastFour}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Expires {settingsData.paymentMethod.expiry}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full">
                        Add Payment Method
                      </Button>
                    </div>
                  ) : (
                    <EmptyStateCard
                      icon={CreditCard}
                      title="No Payment Method"
                      description="Add a payment method to manage your subscription."
                      actionText="Add Method"
                      onAction={() => router.push("/settings/add-payment")}
                    />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Billing History</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      disabled={settingsData.billingHistory.length === 0}
                    >
                      <Download className="w-4 h-4" />
                      Download All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {settingsData.billingHistory.length === 0 ? (
                    <EmptyStateCard
                      icon={Calendar}
                      title="No Billing History"
                      description="Your billing history will appear here once you subscribe."
                      actionText="Explore Plans"
                      onAction={() => router.push("/pricing")}
                    />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {settingsData.billingHistory.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="text-sm">
                              {new Date(invoice.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {invoice.plan}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {invoice.invoice}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold">
                              {invoice.amount}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="default"
                                className="flex items-center gap-1 w-fit"
                              >
                                <Check className="w-3 h-3" />
                                {invoice.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-2"
                              >
                                <Download className="w-4 h-4" />
                                PDF
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {settingsData.plan && (
                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertDescription>
                    Your subscription will automatically renew on{" "}
                    {new Date(
                      settingsData.plan.nextBillingDate
                    ).toLocaleDateString()}
                    . You can cancel anytime from this page.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Settings;
