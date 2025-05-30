"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { toast } from "sonner";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { Badge } from "@/components/ui/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

interface Team {
  _id: string;
  name: string;
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  image: string;
  role: "Admin" | "Project Manager" | "Developer" | "Tester";
  badges: {
    name: string;
    description: string;
    earnedAt: Date;
  }[];
  teams: Team[];
  isVerified: boolean;
  authProvider?: "GOOGLE" | "GITHUB";
}

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editedProfile, setEditedProfile] =
    useState<Partial<UserProfile> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchProfile = async () => {
    try {
      const url = userId ? `/api/profile?userId=${userId}` : "/api/profile";
      const response = await fetch(url, {
        credentials: "include",
      });

      if (response.status === 401) {
        const refreshResponse = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (refreshResponse.ok) {
          return fetchProfile();
        }
        router.push("/login");
        return;
      }

      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();
      setProfile(data);
      setEditedProfile(data);

      // Check if current user is admin
      if (!userId) {
        const meResponse = await fetch("/api/profile", {
          credentials: "include",
        });
        if (meResponse.ok) {
          const meData = await meResponse.json();
          setIsAdmin(meData.role === "Admin");
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editedProfile || !profile) return;

    try {
      const url = userId ? `/api/profile?userId=${userId}` : "/api/profile/";
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: editedProfile.name,
          email: editedProfile.email,
          role: editedProfile.role,
        }),
      });

      if (!response.ok) throw new Error(await response.text());

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setEditedProfile(updatedProfile);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleAvatarUpload = async (url: string) => {
    if (!profile) return;
    setIsUploading(true);

    try {
      const response = await fetch("/api/profile/me/avatar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ image: url }),
      });

      if (!response.ok) throw new Error(await response.text());

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setEditedProfile(updatedProfile);
      toast.success("Avatar updated successfully");
    } catch (error) {
      console.error("Avatar error:", error);
      toast.error("Failed to update avatar");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Failed to load profile. Please try again.</p>
            <Button onClick={fetchProfile} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Profile Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Profile Information
          </CardTitle>
          {!userId && (
            <Button
              onClick={isEditing ? handleCancel : handleEdit}
              variant="outline"
              className="mt-2"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-full sm:w-auto">
                <AvatarUpload
                  value={profile.image}
                  onChange={handleAvatarUpload}
                  disabled={isUploading || !isEditing || !!userId}
                />
              </div>
              <div className="w-full space-y-2">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={editedProfile?.name || ""}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        name: e.target.value,
                      })
                    }
                    disabled={!isEditing || !!userId}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={editedProfile?.email || ""}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        email: e.target.value,
                      })
                    }
                    disabled={!isEditing || !!profile.authProvider || !!userId}
                  />
                </div>

                {(isAdmin || !userId) && (
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={editedProfile?.role || "Developer"}
                      onValueChange={(value) =>
                        setEditedProfile({
                          ...editedProfile,
                          role: value as UserProfile["role"],
                        })
                      }
                      disabled={!isEditing || !!userId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
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
                  </div>
                )}
              </div>
            </div>

            {!userId && isEditing && (
              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Badges Section */}
      {profile.badges?.length > 0 && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {profile.badges.map((badge, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-4 border rounded-lg"
                >
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-yellow-600 text-xl">🏆</span>
                  </div>
                  <h3 className="font-medium">{badge.name}</h3>
                  <p className="text-sm text-gray-500">{badge.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Info */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Account Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Account Status</Label>
            <div className="mt-1">
              {profile.isVerified ? (
                <Badge variant="success">Verified</Badge>
              ) : (
                <Badge variant="warning">Not Verified</Badge>
              )}
              {profile.authProvider && (
                <span className="ml-2 text-sm text-gray-500">
                  (Connected via {profile.authProvider})
                </span>
              )}
            </div>
          </div>

          <div>
            <Label>Teams</Label>
            <div className="mt-2">
              {profile.teams?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.teams.map((team) => (
                    <Badge key={team._id} variant="outline">
                      {team.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Not part of any teams
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
