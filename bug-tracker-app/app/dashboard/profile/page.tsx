"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/TextArea";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Separator } from "@/components/ui/Separator";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Save,
  Bug,
  CheckCircle,
  Clock,
  Edit,
  Shield,
  Bell,
  Palette,
  Award,
  Users,
  Loader2,
  Trophy,
  Target,
  Zap,
  BarChart3,
  Sparkles,
  Code,
  Rocket,
} from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: "Admin" | "Project Manager" | "Developer" | "Tester";
  isVerified: boolean;
  teamIds: string[];
  badges: Badge[];
  notificationsEnabled: boolean;
  themePreference: "light" | "dark" | "system";
  authProvider?: "GOOGLE" | "GITHUB";
  createdAt: string;
  updatedAt: string;
  phone?: string;
  location?: string;
  timezone?: string;
  bio?: string;
  skills?: string[];
  department?: string;
  joinDate?: string;
}

interface Badge {
  name: string;
  description: string;
  earnedAt: Date;
}

interface BugStats {
  assignedBugs: number;
  resolvedBugs: number;
  avgResolutionTime: string;
  thisMonthResolved: number;
}

interface RecentActivity {
  id: string;
  type: "resolved" | "assigned" | "commented" | "created";
  bugId: string;
  bugTitle: string;
  timestamp: string;
}

const Profile = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<BugStats>({
    assignedBugs: 0,
    resolvedBugs: 0,
    avgResolutionTime: "0 days",
    thisMonthResolved: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          credentials: "include",
        });
        console.log("Auth response status:", response.status);
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
          setIsAuthenticated(true);
        } else {
          router.push("/auth/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/auth/login");
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);

        const profileResponse = await fetch("/api/user/profile", {
          credentials: "include",
        });
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setProfile(profileData.user || profileData);
        } else {
          throw new Error("Failed to fetch profile");
        }

        const statsResponse = await fetch("/api/user/stats", {
          credentials: "include",
        });
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.stats);
        } else {
          throw new Error("Failed to fetch stats");
        }

        const activityResponse = await fetch("/api/user/activity?limit=5", {
          credentials: "include",
        });
        if (activityResponse.ok) {
          const activityData = await activityResponse.json();
          setRecentActivity(activityData.activities);
        } else {
          throw new Error("Failed to fetch activity");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchProfileData();
    }
  }, [isAuthenticated, user]);

  const handleSave = async () => {
    if (!profile) return;

    try {
      setSaving(true);

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          location: profile.location,
          timezone: profile.timezone,
          bio: profile.bio,
          skills: profile.skills,
          department: profile.department,
          notificationsEnabled: profile.notificationsEnabled,
          themePreference: profile.themePreference,
        }),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile.user || updatedProfile);
        setIsEditing(false);
        toast.success("Profile updated successfully");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/user/profile/avatar-upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfile((prev) => (prev ? { ...prev, image: data.imageUrl } : null));
        toast.success("Profile picture updated successfully");
      } else {
        toast.error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "assigned":
        return <Bug className="w-4 h-4 text-blue-500" />;
      case "commented":
        return <Clock className="w-4 h-4 text-purple-500" />;
      case "created":
        return <Bug className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "Project Manager":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Developer":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Tester":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Check if profile is empty (new user)
  const hasProfileData =
    profile &&
    (profile.name ||
      profile.email ||
      profile.phone ||
      profile.location ||
      profile.bio ||
      (profile.skills && profile.skills.length > 0));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <p>Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Profile</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-6">
          {/* Profile Header */}
          {!hasProfileData && !isEditing ? (
            <Card className="border-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-950 dark:to-blue-950">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                  Complete Your Developer Profile
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                  Build your professional presence and let your team know who
                  you are. Your profile helps create better collaboration.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg backdrop-blur-sm">
                    <Code className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <div className="text-sm font-medium">Showcase Skills</div>
                    <div className="text-xs text-slate-500">
                      Add your tech stack
                    </div>
                  </div>
                  <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg backdrop-blur-sm">
                    <Users className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                    <div className="text-sm font-medium">Team Visibility</div>
                    <div className="text-xs text-slate-500">
                      Help colleagues find you
                    </div>
                  </div>
                  <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg backdrop-blur-sm">
                    <Rocket className="w-6 h-6 text-pink-500 mx-auto mb-2" />
                    <div className="text-sm font-medium">Track Progress</div>
                    <div className="text-xs text-slate-500">
                      Monitor your contributions
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Setup Your Profile
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      {profile.image ? (
                        <AvatarImage src={profile.image} alt={profile.name} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-2xl">
                          {profile.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <label htmlFor="avatar-upload">
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 cursor-pointer"
                        asChild
                      >
                        <span>
                          <Camera className="w-4 h-4" />
                        </span>
                      </Button>
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                            {profile.name}
                          </h1>
                          {profile.isVerified && (
                            <div className="relative group">
                              <Shield className="w-5 h-5 text-blue-500" />
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Verified Account
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getRoleBadgeColor(profile.role)}>
                            {profile.role}
                          </Badge>
                          {profile.authProvider && (
                            <Badge variant="outline">
                              {profile.authProvider}
                            </Badge>
                          )}
                          {profile.department && (
                            <Badge
                              variant="outline"
                              className="bg-gray-100 text-gray-800 border-gray-200"
                            >
                              {profile.department}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Member since{" "}
                          {new Date(
                            profile.createdAt || profile.joinDate || ""
                          ).toLocaleDateString()}
                        </p>
                      </div>

                      <Button
                        onClick={() =>
                          isEditing ? handleSave() : setIsEditing(true)
                        }
                        disabled={saving}
                        className="flex items-center gap-2"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : isEditing ? (
                          <>
                            <Save className="w-4 h-4" />
                            Save Changes
                          </>
                        ) : (
                          <>
                            <Edit className="w-4 h-4" />
                            Edit Profile
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              {(hasProfileData || isEditing) && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isEditing ? (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="name">Full Name</Label>
                              <Input
                                id="name"
                                value={profile.name}
                                onChange={(e) =>
                                  setProfile({
                                    ...profile,
                                    name: e.target.value,
                                  })
                                }
                                placeholder="Enter your full name"
                              />
                            </div>
                            <div>
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                type="email"
                                value={profile.email}
                                disabled
                                className="bg-slate-50 dark:bg-slate-800"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="phone">Phone</Label>
                              <Input
                                id="phone"
                                value={profile.phone || ""}
                                onChange={(e) =>
                                  setProfile({
                                    ...profile,
                                    phone: e.target.value,
                                  })
                                }
                                placeholder="+1 (555) 123-4567"
                              />
                            </div>
                            <div>
                              <Label htmlFor="location">Location</Label>
                              <Input
                                id="location"
                                value={profile.location || ""}
                                onChange={(e) =>
                                  setProfile({
                                    ...profile,
                                    location: e.target.value,
                                  })
                                }
                                placeholder="City, State"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="role">Role</Label>
                              <Input
                                id="role"
                                value={profile.role}
                                onChange={(e) =>
                                  setProfile({
                                    ...profile,
                                    role: e.target.value as
                                      | "Admin"
                                      | "Project Manager"
                                      | "Developer"
                                      | "Tester",
                                  })
                                }
                                placeholder="Senior Developer"
                              />
                            </div>
                            <div>
                              <Label htmlFor="department">Department</Label>
                              <Input
                                id="department"
                                value={profile.department || ""}
                                onChange={(e) =>
                                  setProfile({
                                    ...profile,
                                    department: e.target.value,
                                  })
                                }
                                placeholder="Engineering"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="timezone">Timezone</Label>
                            <Select
                              value={profile.timezone || "UTC"}
                              onValueChange={(value) =>
                                setProfile({ ...profile, timezone: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="America/Los_Angeles">
                                  Pacific Time (PST/PDT)
                                </SelectItem>
                                <SelectItem value="America/New_York">
                                  Eastern Time (EST/EDT)
                                </SelectItem>
                                <SelectItem value="Europe/London">
                                  Greenwich Mean Time (GMT)
                                </SelectItem>
                                <SelectItem value="Europe/Berlin">
                                  Central European Time (CET)
                                </SelectItem>
                                <SelectItem value="Asia/Tokyo">
                                  Japan Standard Time (JST)
                                </SelectItem>
                                <SelectItem value="Asia/Kolkata">
                                  India Standard Time (IST)
                                </SelectItem>
                                <SelectItem value="UTC">
                                  Coordinated Universal Time (UTC)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                              id="bio"
                              value={profile.bio || ""}
                              onChange={(e) =>
                                setProfile({ ...profile, bio: e.target.value })
                              }
                              placeholder="Tell us about yourself..."
                              className="min-h-[100px]"
                            />
                          </div>
                        </>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-slate-500" />
                            <span className="text-sm">{profile.email}</span>
                          </div>
                          {profile.phone && (
                            <div className="flex items-center gap-3">
                              <Phone className="w-4 h-4 text-slate-500" />
                              <span className="text-sm">{profile.phone}</span>
                            </div>
                          )}
                          {profile.location && (
                            <div className="flex items-center gap-3">
                              <MapPin className="w-4 h-4 text-slate-500" />
                              <span className="text-sm">
                                {profile.location}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <span className="text-sm">
                              Joined{" "}
                              {new Date(
                                profile.createdAt || profile.joinDate || ""
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          {profile.bio && (
                            <div>
                              <h4 className="font-medium mb-2">About</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {profile.bio}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Skills & Expertise</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {profile.skills && profile.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Code className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Add your technical skills to showcase your expertise
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {profile.badges && profile.badges.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="w-5 h-5" />
                          Achievements
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {profile.badges.map((badge, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                            >
                              <Award className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                                  {badge.name}
                                </h4>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                  {badge.description}
                                </p>
                                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                  Earned{" "}
                                  {new Date(
                                    badge.earnedAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Bell className="w-4 h-4 text-slate-500" />
                          <div>
                            <Label htmlFor="notifications">
                              Email Notifications
                            </Label>
                            <p className="text-sm text-slate-500">
                              Receive email updates about bugs and activities
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="notifications"
                          checked={profile.notificationsEnabled}
                          onCheckedChange={(checked) =>
                            setProfile({
                              ...profile,
                              notificationsEnabled: checked,
                            })
                          }
                          disabled={!isEditing}
                        />
                      </div>

                      <Separator />

                      <div>
                        <Label htmlFor="theme">Theme Preference</Label>
                        <Select
                          value={profile.themePreference}
                          onValueChange={(value: "light" | "dark" | "system") =>
                            setProfile({ ...profile, themePreference: value })
                          }
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
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
                </>
              )}
            </div>

            {/* Stats and Activity */}
            <div className="space-y-6">
              {!hasProfileData || stats.assignedBugs === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Your Impact Journey
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      Ready to Make an Impact?
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Your contribution metrics will appear here as you engage
                      with projects and resolve issues
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg border border-blue-200 dark:border-blue-800">
                        <Shield className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-blue-600">0</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Issues Resolved
                        </div>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg border border-green-200 dark:border-green-800">
                        <Zap className="w-5 h-5 text-green-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-green-600">
                          0
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Active Projects
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Active Bugs
                      </span>
                      <span className="font-semibold text-lg text-orange-600">
                        {stats.assignedBugs}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Total Resolved
                      </span>
                      <span className="font-semibold text-lg text-green-600">
                        {stats.resolvedBugs}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        This Month
                      </span>
                      <span className="font-semibold text-lg text-blue-600">
                        {stats.thisMonthResolved}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Avg Resolution
                      </span>
                      <span className="font-semibold text-lg">
                        {stats.avgResolutionTime}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {profile.teamIds && profile.teamIds.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Teams
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Member of {profile.teamIds.length} team
                      {profile.teamIds.length !== 1 ? "s" : ""}
                    </p>
                  </CardContent>
                </Card>
              )}

              {!hasProfileData || recentActivity.length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Activity Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      Your Story Starts Here
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Track your contributions, bug fixes, and project
                      milestones in one beautiful timeline
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Bug reports and fixes
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-green-50 dark:from-slate-800 dark:to-green-900 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Project contributions
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-800 dark:to-purple-900 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Team collaborations
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentActivity.length > 0 ? (
                        recentActivity.map((activity) => (
                          <div
                            key={activity.id}
                            className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                          >
                            {getActivityIcon(activity.type)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                {activity.type === "resolved"
                                  ? "Resolved"
                                  : activity.type === "assigned"
                                  ? "Assigned to"
                                  : activity.type === "created"
                                  ? "Created"
                                  : "Commented on"}{" "}
                                {activity.bugId}
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                                {activity.bugTitle}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-500">
                                {new Date(activity.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500 text-center py-4">
                          No recent activity
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
