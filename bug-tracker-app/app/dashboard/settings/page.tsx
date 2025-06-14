"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Palette,
  Globe,
  Trash2,
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
} from "lucide-react";

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
  role: string;
  timezone: string;
  language: string;
}

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Pending";
  joinDate: string;
}

interface BillingHistory {
  id: number;
  date: string;
  amount: string;
  plan: string;
  status: "Paid";
  invoice: string;
}

const Settings = () => {
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notifications>({
    email: true,
    push: false,
    slack: true,
    bugAssigned: true,
    bugResolved: true,
    weeklyReport: false,
  });

  const [profile, setProfile] = useState<Profile>({
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Senior Developer",
    timezone: "America/Los_Angeles",
    language: "English",
  });

  const [teamMembers] = useState<TeamMember[]>([
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@company.com",
      role: "Admin",
      status: "Active",
      joinDate: "2024-01-15",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@company.com",
      role: "Developer",
      status: "Active",
      joinDate: "2024-02-20",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike.johnson@company.com",
      role: "QA Tester",
      status: "Pending",
      joinDate: "2024-03-01",
    },
    {
      id: 4,
      name: "Sarah Wilson",
      email: "sarah.wilson@company.com",
      role: "Developer",
      status: "Active",
      joinDate: "2024-01-30",
    },
  ]);

  const [billingHistory] = useState<BillingHistory[]>([
    {
      id: 1,
      date: "2025-03-01",
      amount: "$29.99",
      plan: "Pro Plan",
      status: "Paid",
      invoice: "INV-001",
    },
    {
      id: 2,
      date: "2025-02-01",
      amount: "$29.99",
      plan: "Pro Plan",
      status: "Paid",
      invoice: "INV-002",
    },
    {
      id: 3,
      date: "2025-01-01",
      amount: "$29.99",
      plan: "Pro Plan",
      status: "Paid",
      invoice: "INV-003",
    },
  ]);

  const handleProfileSave = () => {
    // Simulate saving profile changes (e.g., API call)
    console.log("Saving profile:", profile);
  };

  const handleNotificationsSave = () => {
    // Simulate saving notification preferences (e.g., API call)
    console.log("Saving notifications:", notifications);
  };

  const handlePasswordUpdate = () => {
    // Simulate password update (e.g., API call)
    console.log("Updating password...");
  };

  const handleGenerateApiKey = () => {
    // Simulate generating a new API key
    console.log("Generating new API key...");
  };

  const handleInviteMember = () => {
    // Simulate inviting a new team member
    console.log("Inviting new team member...");
    router.push("/settings/invite"); // Example navigation
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
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
                      <Link href="/profile" className="flex items-center gap-2">
                        View Full Profile
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) =>
                          setProfile({ ...profile, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) =>
                          setProfile({ ...profile, email: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={profile.role}
                      onChange={(e) =>
                        setProfile({ ...profile, role: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={profile.timezone}
                        onValueChange={(value) =>
                          setProfile({ ...profile, timezone: value })
                        }
                      >
                        <SelectTrigger>
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
                    </div>
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={profile.language}
                        onValueChange={(value) =>
                          setProfile({ ...profile, language: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                          <SelectItem value="German">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <Button onClick={handleProfileSave}>Save Changes</Button>
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
                        {profile.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm">
                        Upload Photo
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
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
                <div className="space-y-4">
                  <h3 className="font-medium">Notification Methods</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        checked={notifications.email}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, email: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Browser push notifications
                        </p>
                      </div>
                      <Switch
                        checked={notifications.push}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, push: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Slack Integration</Label>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Send notifications to Slack
                        </p>
                      </div>
                      <Switch
                        checked={notifications.slack}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, slack: checked })
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
                        <Label>Bug Assigned to Me</Label>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          When a bug is assigned to you
                        </p>
                      </div>
                      <Switch
                        checked={notifications.bugAssigned}
                        onCheckedChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            bugAssigned: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Bug Resolved</Label>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          When bugs you reported are resolved
                        </p>
                      </div>
                      <Switch
                        checked={notifications.bugResolved}
                        onCheckedChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            bugResolved: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Weekly Report</Label>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Weekly summary of bug activity
                        </p>
                      </div>
                      <Switch
                        checked={notifications.weeklyReport}
                        onCheckedChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            weeklyReport: checked,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleNotificationsSave}>
                  Save Preferences
                </Button>
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
                  <div>
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div>
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">
                      Confirm New Password
                    </Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  <Button onClick={handlePasswordUpdate}>
                    Update Password
                  </Button>
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
                  <Button variant="outline" onClick={handleGenerateApiKey}>
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
                {[
                  {
                    name: "GitHub",
                    status: "connected",
                    description: "Link bugs to GitHub issues",
                  },
                  {
                    name: "Slack",
                    status: "connected",
                    description: "Send notifications to Slack channels",
                  },
                  {
                    name: "Jira",
                    status: "disconnected",
                    description: "Sync with Jira tickets",
                  },
                  {
                    name: "GitLab",
                    status: "disconnected",
                    description: "Connect with GitLab merge requests",
                  },
                ].map((integration) => (
                  <div
                    key={integration.name}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{integration.name}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
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
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Team Members
                    </CardTitle>
                    <Button
                      className="flex items-center gap-2"
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
                        {teamMembers.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-blue-500 text-white text-xs">
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
                                  <div className="text-sm text-slate-600 dark:text-slate-400">
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
                              >
                                {member.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-slate-600 dark:text-slate-400">
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
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Team members can send invitations
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require admin approval for new members</Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        New invitations need admin approval
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable team activity notifications</Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
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
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">Pro Plan</h3>
                          <Badge className="bg-blue-500 text-white">
                            Current
                          </Badge>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">
                          Advanced features for growing teams
                        </p>
                        <div className="text-2xl font-bold mt-2">
                          $29.99
                          <span className="text-base font-normal">/month</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Next billing date
                        </div>
                        <div className="font-semibold">July 1, 2025</div>
                        <Button variant="outline" className="mt-2">
                          Change Plan
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          500
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Bug reports / month
                        </div>
                        <div className="text-xs text-slate-500">127 used</div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          50
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Team members
                        </div>
                        <div className="text-xs text-slate-500">4 active</div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          ∞
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Integrations
                        </div>
                        <div className="text-xs text-slate-500">
                          2 connected
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                          VISA
                        </div>
                        <div>
                          <div className="font-medium">•••• •••• •••• 4242</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            Expires 12/2026
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
                    >
                      <Download className="w-4 h-4" />
                      Download All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
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
                      {billingHistory.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="text-sm">
                            {new Date(invoice.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{invoice.plan}</div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">
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
                </CardContent>
              </Card>

              <Alert>
                <Calendar className="h-4 w-4" />
                <AlertDescription>
                  Your subscription will automatically renew on July 1, 2025.
                  You can cancel anytime from this page.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Settings;
