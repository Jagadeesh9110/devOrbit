"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Textarea } from "@/components/ui/TextArea";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
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
    description?: string;
  }>;
  createdAt: string;
}

export default function TeamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTeam, setEditedTeam] = useState({
    name: "",
    description: "",
    image: "",
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchTeam = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/teams/${params.id}`, {
        credentials: "include",
      });

      if (response.status === 401) {
        const refreshResponse = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (refreshResponse.ok) {
          return fetchTeam();
        }
        router.push("/login");
        return;
      }

      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();
      setTeam(data);
      setEditedTeam({
        name: data.name,
        description: data.description || "",
        image: data.image || "",
      });
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load team");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchTeam();
    }
  }, [params.id]);

  const handleUpdateTeam = async () => {
    if (!team) return;

    try {
      const response = await fetch(`/api/teams/${team._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editedTeam),
      });

      if (!response.ok) throw new Error(await response.text());

      const updatedTeam = await response.json();
      setTeam(updatedTeam);
      setIsEditing(false);
      toast.success("Team updated successfully");
    } catch (error) {
      console.error("Update team error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update team"
      );
    }
  };

  const handleAvatarUpload = async (url: string) => {
    setIsUploading(true);
    setEditedTeam({ ...editedTeam, image: url });
    setIsUploading(false);
  };

  const handleMemberRoleChange = async (userId: string, newRole: string) => {
    if (!team) return;

    try {
      const updatedMembers = team.members.map((member) =>
        member.user._id === userId ? { ...member, role: newRole } : member
      );

      const response = await fetch(`/api/teams/${team._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          members: updatedMembers.map((m) => ({
            userId: m.user._id,
            role: m.role,
          })),
        }),
      });

      if (!response.ok) throw new Error(await response.text());

      const updatedTeam = await response.json();
      setTeam(updatedTeam);
      toast.success("Member role updated");
    } catch (error) {
      console.error("Update role error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update role"
      );
    }
  };

  const handleDeleteTeam = async () => {
    if (!team) return;

    try {
      const response = await fetch(`/api/teams/${team._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error(await response.text());

      toast.success("Team deleted successfully");
      router.push("/dashboard/team");
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
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-48 mt-2" />
              </div>
              <div>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24 mt-2" />
              </div>
              <div>
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20 mt-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Skeleton className="h-2 w-2 rounded-full" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {["Member", "Email", "Role", "Joined"].map((header) => (
                    <TableHead key={header}>
                      <Skeleton className="h-4 w-24" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(4)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Team</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Failed to load team. Please try again.</p>
            <Button onClick={fetchTeam} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if current user is a manager/admin
  const currentUserRole = team.members.find(
    (member) => member.user._id === params.id
  )?.role;

  const canEdit = ["Project Manager", "Team Lead", "Admin"].includes(
    currentUserRole || ""
  );

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
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
            <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
            <p className="text-muted-foreground">
              {team.description || "No description"}
            </p>
          </div>
        </div>
        {canEdit && (
          <div className="flex space-x-2">
            <Button
              variant={isEditing ? "outline" : "primary"}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel" : "Edit Team"}
            </Button>
            {isEditing && (
              <Button
                onClick={handleUpdateTeam}
                disabled={isUploading || !editedTeam.name.trim()}
              >
                {isUploading ? "Saving..." : "Save Changes"}
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Delete Team
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit Team</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center">
              <AvatarUpload
                value={editedTeam.image}
                onChange={handleAvatarUpload}
                disabled={isUploading}
              />
            </div>
            <div>
              <Label htmlFor="name">Team Name *</Label>
              <Input
                id="name"
                value={editedTeam.name}
                onChange={(e) =>
                  setEditedTeam({ ...editedTeam, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editedTeam.description}
                onChange={(e) =>
                  setEditedTeam({ ...editedTeam, description: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Team Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Created</Label>
                <p>{new Date(team.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <Label>Total Members</Label>
                <p>{team.members.length}</p>
              </div>
              <div>
                <Label>Active Projects</Label>
                <p>
                  {team.projects.filter((p) => p.status === "Active").length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <p className="text-sm">
                    Team created on{" "}
                    {new Date(team.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {team.projects.slice(0, 3).map((project) => (
                  <div
                    key={project._id}
                    className="flex items-center space-x-2"
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${
                        project.status === "Active"
                          ? "bg-green-500"
                          : "bg-gray-500"
                      }`}
                    ></div>
                    <p className="text-sm">Project "{project.name}" added</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Manage team members and their roles</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.members.map((member) => (
                <TableRow key={member.user._id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Avatar
                        src={member.user.image}
                        alt={member.user.name}
                        size="sm"
                      />
                      <span>{member.user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{member.user.email}</TableCell>
                  <TableCell>
                    <Select
                      value={member.role}
                      onValueChange={(value) =>
                        handleMemberRoleChange(member.user._id, value)
                      }
                      disabled={!canEdit}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Project Manager">
                          Project Manager
                        </SelectItem>
                        <SelectItem value="Team Lead">Team Lead</SelectItem>
                        <SelectItem value="Senior Developer">
                          Senior Developer
                        </SelectItem>
                        <SelectItem value="Developer">Developer</SelectItem>
                        <SelectItem value="QA Engineer">QA Engineer</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Projects</CardTitle>
          <CardDescription>Projects associated with this team</CardDescription>
        </CardHeader>
        <CardContent>
          {team.projects.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {team.projects.map((project) => (
                <Link
                  key={project._id}
                  href={`/dashboard/projects/${project._id}`}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle>{project.name}</CardTitle>
                      <CardDescription>
                        {project.description || "No description"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Badge
                        variant={
                          project.status === "Active" ? "default" : "outline"
                        }
                      >
                        {project.status}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No projects yet</p>
          )}
        </CardContent>
      </Card>

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
          {team && (
            <div className="space-y-2">
              <p className="font-medium">{team.name}</p>
              <p className="text-sm text-muted-foreground">
                {team.members.length} members · {team.projects.length} projects
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
