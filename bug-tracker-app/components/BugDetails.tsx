"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Separator } from "@/components/ui/Separator";
import { Textarea } from "@/components/ui/TextArea";
import {
  Clock,
  User,
  Bug,
  Settings,
  Gitlab,
  File,
  Bot,
  Edit,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  Users,
  TrendingUp,
} from "lucide-react";
import { PopulatedBug, PopulatedUser, PopulatedComment } from "@/types/bug";

interface BugDetailsProps {
  // Support both patterns - either pass bug data directly or bugId to fetch
  bug?: PopulatedBug;
  bugId?: string;
  onClose?: () => void;
}

export default function BugDetails({
  bug: initialBug,
  bugId,
  onClose,
}: BugDetailsProps) {
  const [bug, setBug] = useState<PopulatedBug | null>(initialBug || null);
  const [loading, setLoading] = useState(!initialBug && !!bugId);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<string>("");

  useEffect(() => {
    // Only fetch if we don't have initial bug data and we have a bugId
    if (!initialBug && bugId) {
      const fetchBug = async () => {
        try {
          setLoading(true);
          setError(null);

          const response = await fetch(`/api/bugs/${bugId}`);

          if (!response.ok) {
            throw new Error(
              `Failed to fetch bug: ${response.status} ${response.statusText}`
            );
          }

          const bugData = await response.json();
          setBug(bugData);
        } catch (err) {
          console.error("Error fetching bug:", err);
          setError(
            err instanceof Error
              ? err.message
              : "An error occurred while fetching the bug"
          );
        } finally {
          setLoading(false);
        }
      };

      fetchBug();
    }
  }, [bugId, initialBug]);

  const handleMarkResolved = async () => {
    if (!bug) return;
    console.log(`Marking bug ${bug._id} as resolved`);
    // Add your API call here
  };

  const handlePostComment = async (bugId: string, text: string) => {
    if (!text.trim()) return;
    console.log(`Posting comment to bug ${bugId}: ${text}`);
    setNewComment("");
    // Add your API call here
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "High":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Open":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "In Progress":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "Resolved":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
      case "Closed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  // Helper function to get user initials for avatar
  const getUserInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">
            Loading bug details...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="p-6 max-w-md">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Error Loading Bug
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
              >
                Retry
              </Button>
              {onClose && (
                <Button onClick={onClose} variant="ghost" size="sm">
                  Close
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Bug not found state
  if (!bug) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="p-6 max-w-md">
          <div className="text-center">
            <Bug className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Bug Not Found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              The bug with ID {bugId} could not be found.
            </p>
            {onClose && (
              <Button onClick={onClose} variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        {/* Breadcrumb component can be added here if needed */}
      </div>

      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-mono text-slate-500">
                {bug._id.toString()}
              </span>
              <Badge className={getPriorityColor(bug.priority)}>
                {bug.priority}
              </Badge>
              <Badge className={getStatusColor(bug.status)}>{bug.status}</Badge>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100">
              {bug.title}
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleMarkResolved}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark as Resolved
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>Assigned to {bug.assigneeId?.name || "Unassigned"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>
              {bug.comments.reduce((sum, c) => sum + (c.timeSpent || 0), 0)}h
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Bug className="w-4 h-4" />
            <span>Reported by {bug.createdBy.name}</span>
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200 dark:border-blue-800">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-800 dark:text-blue-300">
                AI Insights
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-3">Description</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              {bug.description}
            </p>

            <h4 className="font-medium mb-2">Environment</h4>
            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
              <div>
                OS: {bug.environment.includes("iOS") ? "iOS" : bug.environment}
              </div>
              <div>Browser: Unknown</div>
              <div>Device: Unknown</div>
            </div>

            <h4 className="font-medium mb-2">Steps to Reproduce</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400 mb-4">
              <li>No steps provided</li>
            </ol>

            <h4 className="font-medium mb-2">Attachments</h4>
            <div className="space-y-2">
              {bug.attachments.map((attachment, index) => {
                const fileName =
                  attachment.url.split("/").pop() || `Attachment ${index + 1}`;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded"
                  >
                    <File className="w-4 h-4" />
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {fileName}
                    </a>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {bug.labels.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">
              Comments ({bug.comments.length})
            </h3>

            <div className="space-y-4 mb-6">
              {bug.comments.map((comment) => (
                <div key={comment._id.toString()} className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-green-500">
                      {getUserInitials(comment.author.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {comment.author.name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {comment.author.role}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                      {comment.text}
                    </p>
                    {comment.timeSpent && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                        <Clock className="w-3 h-3" />
                        <span>{comment.timeSpent}h logged</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>👍 {comment.reactions.length}</span>
                      <button className="hover:text-blue-600">Reply</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-3">
              <Textarea
                placeholder="Add a comment... Use @username to mention someone"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    📎 Attach
                  </Button>
                  <Button variant="outline" size="sm">
                    🎯 Mention
                  </Button>
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    handlePostComment(bug._id.toString(), newComment)
                  }
                >
                  Post Comment
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-4">
            <h4 className="font-medium mb-3">Activity Timeline</h4>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                <div className="flex-1">
                  <p className="font-medium">Bug reported</p>
                  <p className="text-xs text-slate-500">
                    by {bug.createdBy.name} •{" "}
                    {new Date(bug.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
                <div className="flex-1">
                  <p className="font-medium">
                    Assigned to {bug.assigneeId?.name || "Unassigned"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(bug.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                <div className="flex-1">
                  <p className="font-medium">Status changed to {bug.status}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(bug.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="font-medium mb-3">Assignee Details</h4>
            {bug.assigneeId ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="bg-blue-500 text-xs">
                      {getUserInitials(bug.assigneeId.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">
                    {bug.assigneeId.name}
                  </span>
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <p>Role: {bug.assigneeId.role}</p>
                  {bug.assigneeId.department && (
                    <p>Department: {bug.assigneeId.department}</p>
                  )}
                  {bug.assigneeId.jobTitle && (
                    <p>Title: {bug.assigneeId.jobTitle}</p>
                  )}
                  <p>
                    Status:{" "}
                    <span
                      className={`inline-block w-2 h-2 rounded-full mr-1 ${
                        bug.assigneeId.status === "online"
                          ? "bg-green-500"
                          : bug.assigneeId.status === "away"
                          ? "bg-yellow-500"
                          : "bg-gray-500"
                      }`}
                    ></span>
                    {bug.assigneeId.status}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No assignee</p>
            )}
          </Card>

          <Card className="p-4">
            <h4 className="font-medium mb-3">Related Links</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Gitlab className="w-4 h-4" />
                <a href="#" className="text-blue-600 hover:underline">
                  GitLab Issue #1234
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Bug className="w-4 h-4" />
                <a href="#" className="text-blue-600 hover:underline">
                  Slack Thread
                </a>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
