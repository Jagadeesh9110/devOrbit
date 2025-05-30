"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Textarea } from "@/components/ui/TextArea";
import { Skeleton } from "@/components/ui/Skeleton";
import { AvatarUpload } from "@/components/ui/avatar-upload";

interface Team {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  members: Array<{
    user: {
      _id: string;
      name: string;
      email: string;
      image?: string;
      role: string;
    };
    role: string;
    joinedAt: string;
  }>;
  projects: Array<{
    _id: string;
    name: string;
    status: string;
  }>;
  createdAt: string;
}

export default function TeamPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: "",
    description: "",
    image: "",
  });
  const [isUploading, setIsUploading] = useState(false);

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/teams", {
        credentials: "include",
      });

      if (response.status === 401) {
        const refreshResponse = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (refreshResponse.ok) {
          return fetchTeams();
        }
        router.push("/login");
        return;
      }

      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();
      setTeams(data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load teams");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleCreateTeam = async () => {
    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newTeam),
      });

      if (!response.ok) throw new Error(await response.text());

      const createdTeam = await response.json();
      setTeams([...teams, createdTeam]);
      setIsDialogOpen(false);
      setNewTeam({ name: "", description: "", image: "" });
      toast.success("Team created successfully");
    } catch (error) {
      console.error("Create team error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create team"
      );
    }
  };

  const handleAvatarUpload = async (url: string) => {
    setIsUploading(true);
    setNewTeam({ ...newTeam, image: url });
    setIsUploading(false);
  };

  const handleDeleteTeam = async () => {
    if (!selectedTeam) return;

    try {
      const response = await fetch(`/api/teams/${selectedTeam._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error(await response.text());

      setTeams(teams.filter((team) => team._id !== selectedTeam._id));
      setIsDeleteDialogOpen(false);
      setSelectedTeam(null);
      toast.success("Team deleted successfully");
    } catch (error) {
      console.error("Delete team error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete team"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Skeleton className="h-4 w-20" />
                  <div className="flex -space-x-2 mt-2">
                    {[...Array(3)].map((_, j) => (
                      <Skeleton key={j} className="h-8 w-8 rounded-full" />
                    ))}
                  </div>
                </div>
                <div>
                  <Skeleton className="h-4 w-20" />
                  <div className="mt-2 space-y-1">
                    {[...Array(2)].map((_, j) => (
                      <div key={j} className="flex items-center space-x-2">
                        <Skeleton className="h-2 w-2 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground">
            Manage your teams and collaborate with members
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>Create Team</Button>
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto max-w-md space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8 text-gray-500"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">No teams yet</h3>
              <p className="text-sm text-muted-foreground">
                Get started by creating a new team to organize your projects and
                members.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>Create Team</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Card
              key={team._id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/dashboard/team/${team._id}`)}
            >
              <CardHeader>
                <div className="flex items-center space-x-4">
                  {team.image ? (
                    <Avatar src={team.image} size="lg" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="font-medium text-gray-600">
                        {team.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-xl">{team.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {team.description || "No description"}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Members</Label>
                    <div className="flex -space-x-2 mt-2">
                      {team.members.slice(0, 5).map((member) => (
                        <Avatar
                          key={member.user._id}
                          src={member.user.image}
                          alt={member.user.name}
                          size="sm"
                        />
                      ))}
                      {team.members.length > 5 && (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                          +{team.members.length - 5}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Projects</Label>
                    <div className="mt-2 space-y-1">
                      {team.projects.length > 0 ? (
                        team.projects.slice(0, 3).map((project) => (
                          <div
                            key={project._id}
                            className="flex items-center space-x-2"
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${
                                project.status === "Active"
                                  ? "bg-green-500"
                                  : "bg-gray-500"
                              }`}
                            ></span>
                            <span className="text-sm">{project.name}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No projects
                        </p>
                      )}
                      {team.projects.length > 3 && (
                        <p className="text-sm text-muted-foreground">
                          +{team.projects.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm text-muted-foreground">
                      Created: {new Date(team.createdAt).toLocaleDateString()}
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedTeam(team);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Team Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>
              Add a new team to organize your projects and members.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col items-center">
              <AvatarUpload
                value={newTeam.image}
                onChange={handleAvatarUpload}
                disabled={isUploading}
              />
            </div>
            <div>
              <Label htmlFor="name">Team Name *</Label>
              <Input
                id="name"
                value={newTeam.name}
                onChange={(e) =>
                  setNewTeam({ ...newTeam, name: e.target.value })
                }
                placeholder="Enter team name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTeam.description}
                onChange={(e) =>
                  setNewTeam({ ...newTeam, description: e.target.value })
                }
                placeholder="Enter team description (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTeam}
              disabled={!newTeam.name.trim() || isUploading}
            >
              {isUploading ? "Creating..." : "Create Team"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Team Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this team? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {selectedTeam && (
            <div className="space-y-2">
              <p className="font-medium">{selectedTeam.name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedTeam.members.length} members ·{" "}
                {selectedTeam.projects.length} projects
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTeam}>
              Delete Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
