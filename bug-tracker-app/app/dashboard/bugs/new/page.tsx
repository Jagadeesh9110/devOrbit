"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Bug, Upload, User, FileText, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { fetchWithAuth } from "@/lib/auth";

interface BugFormData {
  title: string;
  description: string;
  severity: string;
  priority: string;
  environment: string;
  assignedTo: string;
  dueDate: string;
  labels: string;
  attachments: FileList | null;
  projectId: string;
}

interface TeamMember {
  _id: string;
  name: string;
  role: string;
}

interface SeverityOption {
  value: string;
  label: string;
  color: string;
}

interface PriorityOption {
  value: string;
  label: string;
  color: string;
}

interface EnvironmentOption {
  value: string;
  label: string;
}

const BugNew: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") || "";
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<BugFormData>({
    defaultValues: {
      title: "",
      description: "",
      severity: "Major",
      priority: "Medium",
      environment: "Development",
      assignedTo: "auto-assign",
      dueDate: "",
      labels: "",
      attachments: null,
      projectId,
    },
  });

  useEffect(() => {
    if (!projectId) return;

    const fetchTeamMembers = async () => {
      try {
        const response = await fetchWithAuth(`/api/projects/${projectId}/team`);
        if (response.success) {
          setTeamMembers(response.data?.teamMembers || []);
        } else {
          throw new Error(response.message);
        }
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchTeamMembers();
  }, [projectId]);

  const severityOptions: SeverityOption[] = [
    { value: "Minor", label: "Minor", color: "bg-green-100 text-green-800" },
    { value: "Major", label: "Major", color: "bg-yellow-100 text-yellow-800" },
    { value: "Critical", label: "Critical", color: "bg-red-100 text-red-800" },
  ];

  const priorityOptions: PriorityOption[] = [
    { value: "Low", label: "Low", color: "bg-blue-100 text-blue-800" },
    {
      value: "Medium",
      label: "Medium",
      color: "bg-yellow-100 text-yellow-800",
    },
    { value: "High", label: "High", color: "bg-orange-100 text-orange-800" },
    { value: "Critical", label: "Critical", color: "bg-red-100 text-red-800" },
  ];

  const environmentOptions: EnvironmentOption[] = [
    { value: "Development", label: "Development" },
    { value: "Staging", label: "Staging" },
    { value: "Production", label: "Production" },
  ];

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const files = event.target.files;
    if (files) {
      setUploadedFiles(Array.from(files));
      form.setValue("attachments", files);
    }
  };

  const onSubmit = async (data: BugFormData): Promise<void> => {
    if (!data.projectId) {
      setError("Project ID is required");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("projectId", data.projectId);
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("severity", data.severity);
    formData.append("priority", data.priority);
    formData.append("environment", data.environment);
    if (data.assignedTo !== "auto-assign") {
      formData.append("assigneeId", data.assignedTo);
    }
    if (data.dueDate) {
      formData.append("dueDate", data.dueDate);
    }
    if (data.labels) {
      formData.append(
        "labels",
        JSON.stringify(data.labels.split(",").map((l) => l.trim()))
      );
    }
    if (data.attachments) {
      Array.from(data.attachments).forEach((file) => {
        formData.append("attachments", file);
      });
    }

    try {
      const response = await fetchWithAuth("/api/bugs", {
        method: "POST",
        body: formData,
      });

      if (response.success) {
        router.push(
          `/dashboard/bugs${projectId ? `?projectId=${projectId}` : ""}`
        );
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = (): void => {
    router.push(`/dashboard/bugs${projectId ? `?projectId=${projectId}` : ""}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <main className="container mx-auto px-4 py-6">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/dashboard/bugs${
                  projectId ? `?projectId=${projectId}` : ""
                }`}
              >
                Bugs
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>New Bug Report</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {error && (
          <div className="text-center py-4">
            <p className="text-red-500 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <Bug className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Report New Bug
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Help us improve by reporting issues you've encountered
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Bug Report Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    rules={{ required: "Title is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bug Title *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Brief description of the issue..."
                            {...field}
                            className="text-base"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    rules={{ required: "Description is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Detailed Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the bug in detail. Include steps to reproduce, expected behavior, and actual behavior..."
                            className="min-h-[120px] text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Severity */}
                    <FormField
                      control={form.control}
                      name="severity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Severity *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select severity" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {severityOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      className={option.color}
                                      variant="outline"
                                    >
                                      {option.label}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Priority */}
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {priorityOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      className={option.color}
                                      variant="outline"
                                    >
                                      {option.label}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Environment */}
                    <FormField
                      control={form.control}
                      name="environment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Environment</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select environment" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {environmentOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Assigned Team Member */}
                    <FormField
                      control={form.control}
                      name="assignedTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assign to Team Member</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select team member" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="auto-assign">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  <span>Auto-assign</span>
                                </div>
                              </SelectItem>
                              {teamMembers.map((member) => (
                                <SelectItem key={member._id} value={member._id}>
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    <span>{member.name}</span>
                                    <span className="text-xs text-gray-500">
                                      ({member.role})
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Due Date */}
                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Labels */}
                    <FormField
                      control={form.control}
                      name="labels"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Labels (comma-separated)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., frontend, urgent, ui"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* File Upload */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Screenshots & Attachments
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Drag & drop your files here or click to select
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf,.txt,.log"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-md cursor-pointer transition-colors duration-200"
                      >
                        Select Files
                      </label>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Uploaded Files:</p>
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                          >
                            <FileText className="w-4 h-4" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              ({(file.size / 1024).toFixed(2)} KB)
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Submitting...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          Submit Bug Report
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BugNew;
