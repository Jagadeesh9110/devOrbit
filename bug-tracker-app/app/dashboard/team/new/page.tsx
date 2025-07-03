"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";
import { Badge } from "@/components/ui/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  X,
} from "lucide-react";
import { fetchWithAuth } from "@/lib/auth";

interface TeamMemberFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  location: string;
  startDate: string;
  salary: string;
  skills: string[];
  bio: string;
  teamId?: string;
}

const TeamMemberAdd = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<TeamMemberFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    location: "",
    startDate: "",
    salary: "",
    skills: [],
    bio: "",
  });
  const [newSkill, setNewSkill] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const roles = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "UI/UX Designer",
    "QA Engineer",
    "DevOps Engineer",
    "Product Manager",
    "Scrum Master",
    "Tech Lead",
    "Senior Developer",
  ];

  const departments = [
    "Engineering",
    "Design",
    "Product",
    "QA",
    "DevOps",
    "Management",
  ];

  const handleInputChange = (
    field: keyof TeamMemberFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: generateSecurePassword(),
        phone: formData.phone,
        jobTitle: formData.role,
        department: formData.department,
        location: formData.location,
        startDate: formData.startDate,
        salary: formData.salary,
        skills: formData.skills,
        bio: formData.bio,
        role: formData.role || "Developer",
      };

      const response = await fetchWithAuth("/api/users", {
        method: "POST",
        body: JSON.stringify(userData),
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Optionally add user to a team if teamId is specified
      if (formData.teamId) {
        const teamResponse = await fetchWithAuth(
          `/api/teams/${formData.teamId}/teamMembers`,
          {
            method: "POST",
            body: JSON.stringify({
              userId: response.data._id,
              role: formData.role || "Developer",
              specialties: formData.skills,
            }),
          }
        );

        if (teamResponse.error) {
          console.error("Failed to add user to team:", teamResponse.error);
        }
      }

      router.push("/team");
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setError(error.message || "Failed to add team member");
    } finally {
      setLoading(false);
    }
  };

  const generateSecurePassword = () => {
    // Generate a temporary secure password (in production, replace with secure random string generation)
    return "TempPass123!"; // Placeholder; use crypto.randomBytes or similar in production
  };

  const getInitials = () => {
    return `${formData.firstName.charAt(0) || ""}${
      formData.lastName.charAt(0) || ""
    }`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-600 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/team")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Team
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              Add New Team Member
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Add a new member to your team
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-red-700 bg-red-100 p-3 rounded border border-red-300">
            {error}
          </div>
        )}

        <div className="max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Main Information */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          First Name *
                        </label>
                        <Input
                          value={formData.firstName}
                          onChange={(e) =>
                            handleInputChange("firstName", e.target.value)
                          }
                          placeholder="Enter first name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Last Name *
                        </label>
                        <Input
                          value={formData.lastName}
                          onChange={(e) =>
                            handleInputChange("lastName", e.target.value)
                          }
                          placeholder="Enter last name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          placeholder="Enter email address"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Phone
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          value={formData.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          placeholder="Enter phone number"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          value={formData.location}
                          onChange={(e) =>
                            handleInputChange("location", e.target.value)
                          }
                          placeholder="Enter location (e.g., San Francisco, CA)"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Bio
                      </label>
                      <Textarea
                        value={formData.bio}
                        onChange={(e) =>
                          handleInputChange("bio", e.target.value)
                        }
                        placeholder="Brief description about the team member"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Skills & Expertise</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill"
                        onKeyPress={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addSkill())
                        }
                      />
                      <Button type="button" onClick={addSkill}>
                        Add
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {skill}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => removeSkill(skill)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Avatar className="w-20 h-20 mx-auto mb-4">
                      <AvatarFallback className="bg-blue-500 text-white text-lg">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold">
                      {formData.firstName || formData.lastName
                        ? `${formData.firstName} ${formData.lastName}`.trim()
                        : "New Member"}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formData.role || "Role not specified"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      Work Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Role *
                      </label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) =>
                          handleInputChange("role", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Department
                      </label>
                      <Select
                        value={formData.department}
                        onValueChange={(value) =>
                          handleInputChange("department", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Start Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) =>
                            handleInputChange("startDate", e.target.value)
                          }
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Salary
                      </label>
                      <Input
                        value={formData.salary}
                        onChange={(e) =>
                          handleInputChange("salary", e.target.value)
                        }
                        placeholder="e.g., $75,000"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/team")}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Team Member"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default TeamMemberAdd;
