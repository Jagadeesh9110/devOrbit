"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/TextArea";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Separator } from "@/components/ui/Separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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

interface BugDetailsProps {
  bugId: string;
  onClose?: () => void;
}

interface MockBug {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: string;
  reporter: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  timeSpent: string;
  estimatedTime: string;
  environment: {
    os: string;
    browser: string;
    device: string;
  };
  stepsToReproduce: string[];
  attachments: Array<{
    name: string;
    size: string;
    type: string;
  }>;
}

interface Comment {
  id: number;
  author: string;
  content: string;
  timestamp: string;
  mentions: string[];
  reactions: {
    thumbsUp: number;
    heart?: number;
  };
}

interface Duplicate {
  id: string;
  title: string;
  similarity: number;
  status: string;
}

interface Pattern {
  type: string;
  description: string;
}

interface Suggestion {
  type: string;
  confidence: number;
  description: string;
  code?: string;
}

interface AIInsights {
  duplicates: Duplicate[];
  patterns: Pattern[];
  suggestions: Suggestion[];
}

export default function BugDetails({ bugId, onClose }: BugDetailsProps) {
  const router = useRouter();
  const [newComment, setNewComment] = useState<string>("");
  const [showAISuggestions, setShowAISuggestions] = useState<boolean>(true);
  const [isMarkingResolved, setIsMarkingResolved] = useState<boolean>(false);

  const mockBug: MockBug = {
    id: bugId,
    title: "Login button not responsive on mobile devices",
    description:
      "Users report that the login button becomes unclickable on iOS Safari. The issue appears when the keyboard is shown and the viewport height changes.",
    status: "in-progress",
    priority: "high",
    assignee: "John Doe",
    reporter: "Jane Smith",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-16T14:45:00Z",
    tags: ["iOS", "Safari", "Mobile", "Critical-Path"],
    timeSpent: "2h 30m",
    estimatedTime: "4h",
    environment: {
      os: "iOS 17.1",
      browser: "Safari 17",
      device: "iPhone 15 Pro",
    },
    stepsToReproduce: [
      "Open the app on iOS Safari",
      "Navigate to login page",
      "Tap on email input field",
      "Keyboard appears and viewport shrinks",
      "Try to tap login button",
    ],
    attachments: [
      { name: "screenshot.png", size: "2.3 MB", type: "image" },
      { name: "console-log.txt", size: "1.2 KB", type: "text" },
    ],
  };

  const mockComments: Comment[] = [
    {
      id: 1,
      author: "Jane Smith",
      content:
        "I can reproduce this consistently on iPhone 15 Pro. The button seems to be covered by the virtual keyboard overlay.",
      timestamp: "2024-01-15T11:00:00Z",
      mentions: ["@john-doe"],
      reactions: { thumbsUp: 2, heart: 1 },
    },
    {
      id: 2,
      author: "John Doe",
      content:
        "@jane-smith Thanks for the detailed report. I'll investigate the viewport handling for mobile Safari.",
      timestamp: "2024-01-15T14:30:00Z",
      mentions: ["@jane-smith"],
      reactions: { thumbsUp: 1 },
    },
  ];

  const aiInsights: AIInsights = {
    duplicates: [
      {
        id: "BUG-123",
        title: "iOS Safari viewport issues",
        similarity: 87,
        status: "resolved",
      },
      {
        id: "BUG-456",
        title: "Mobile keyboard overlay problems",
        similarity: 72,
        status: "open",
      },
    ],
    patterns: [
      {
        type: "Frequent Reporter",
        description:
          "Jane Smith has reported 8 similar mobile issues this month",
      },
      {
        type: "Component Risk",
        description: "Login component has 15% higher bug rate than average",
      },
      {
        type: "Device Pattern",
        description: "iOS Safari issues increased 40% in last 2 weeks",
      },
    ],
    suggestions: [
      {
        type: "Fix Suggestion",
        confidence: 90,
        description: "Add CSS safe area handling for iOS viewport changes",
        code: "body { padding-bottom: env(safe-area-inset-bottom); }",
      },
      {
        type: "Priority Prediction",
        confidence: 88,
        description:
          "Based on user impact analysis, suggest priority: Critical",
      },
    ],
  };

  const handleMarkResolved = async (): Promise<void> => {
    setIsMarkingResolved(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Bug marked as resolved");
      // In a real app, you might redirect or update state here
    } catch (error) {
      console.error("Error marking bug as resolved:", error);
    } finally {
      setIsMarkingResolved(false);
    }
  };

  const handleClose = (): void => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  const handlePostComment = (): void => {
    if (newComment.trim()) {
      // In a real app, you would make an API call here
      console.log("Posting comment:", newComment);
      setNewComment("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/bugs">Bugs</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{mockBug.id}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-mono text-slate-500">
                {mockBug.id}
              </span>
              <Badge
                className={
                  mockBug.priority === "high"
                    ? "bg-orange-100 text-orange-800"
                    : ""
                }
              >
                {mockBug.priority}
              </Badge>
              <Badge className="bg-purple-100 text-purple-800">
                {mockBug.status.replace("-", " ")}
              </Badge>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100">
              {mockBug.title}
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
              disabled={isMarkingResolved}
            >
              {isMarkingResolved ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Resolving...
                </div>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Resolved
                </>
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>Assigned to {mockBug.assignee}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>
              {mockBug.timeSpent} / {mockBug.estimatedTime}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Bug className="w-4 h-4" />
            <span>Reported by {mockBug.reporter}</span>
          </div>
        </div>
      </Card>

      {/* AI Insights */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200 dark:border-blue-800">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-800 dark:text-blue-300">
                AI Insights
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAISuggestions(!showAISuggestions)}
            >
              {showAISuggestions ? "Hide" : "Show"}
            </Button>
          </div>

          {showAISuggestions && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Potential Duplicates */}
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <Bug className="w-4 h-4" />
                  Potential Duplicates
                </h4>
                <div className="space-y-2">
                  {aiInsights.duplicates.map((dup, index) => (
                    <Link
                      key={index}
                      href={`/bugs/${dup.id}`}
                      className="block p-2 bg-slate-50 dark:bg-slate-700 rounded hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-mono text-slate-500">
                            {dup.id}
                          </p>
                          <p className="text-sm font-medium truncate">
                            {dup.title}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {dup.similarity}% match
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Patterns */}
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Patterns Detected
                </h4>
                <div className="space-y-3">
                  {aiInsights.patterns.map((pattern, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center gap-2">
                        {pattern.type === "Frequent Reporter" && (
                          <Users className="w-3 h-3 text-orange-500" />
                        )}
                        {pattern.type === "Component Risk" && (
                          <AlertTriangle className="w-3 h-3 text-red-500" />
                        )}
                        {pattern.type === "Device Pattern" && (
                          <TrendingUp className="w-3 h-3 text-blue-500" />
                        )}
                        <span className="text-xs font-medium">
                          {pattern.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {pattern.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Suggestions */}
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  AI Suggestions
                </h4>
                <div className="space-y-3">
                  {aiInsights.suggestions.map((suggestion, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">
                          {suggestion.type}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.confidence}% confidence
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {suggestion.description}
                      </p>
                      {suggestion.code && (
                        <pre className="text-xs p-2 bg-slate-100 dark:bg-slate-700 rounded overflow-x-auto">
                          <code>{suggestion.code}</code>
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description & Details */}
          <Card className="p-6">
            <h3 className="font-semibold mb-3">Description</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              {mockBug.description}
            </p>

            <h4 className="font-medium mb-2">Environment</h4>
            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
              <div>OS: {mockBug.environment.os}</div>
              <div>Browser: {mockBug.environment.browser}</div>
              <div>Device: {mockBug.environment.device}</div>
            </div>

            <h4 className="font-medium mb-2">Steps to Reproduce</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400 mb-4">
              {mockBug.stepsToReproduce.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>

            <h4 className="font-medium mb-2">Attachments</h4>
            <div className="space-y-2">
              {mockBug.attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded"
                >
                  <File className="w-4 h-4" />
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-slate-500">({file.size})</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {mockBug.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Comments */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">
              Comments ({mockComments.length})
            </h3>

            <div className="space-y-4 mb-6">
              {mockComments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-green-500">
                      {comment.author
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {comment.author}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                      {comment.content}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>👍 {comment.reactions.thumbsUp}</span>
                      {comment.reactions.heart && (
                        <span>❤️ {comment.reactions.heart}</span>
                      )}
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
                <Button size="sm" onClick={handlePostComment}>
                  Post Comment
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Activity Timeline */}
          <Card className="p-4">
            <h4 className="font-medium mb-3">Activity Timeline</h4>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                <div className="flex-1">
                  <p className="font-medium">Bug reported</p>
                  <p className="text-xs text-slate-500">
                    by Jane Smith • 2 days ago
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
                <div className="flex-1">
                  <p className="font-medium">Assigned to John Doe</p>
                  <p className="text-xs text-slate-500">1 day ago</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                <div className="flex-1">
                  <p className="font-medium">Status changed to In Progress</p>
                  <p className="text-xs text-slate-500">6 hours ago</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Related Links */}
          <Card className="p-4">
            <h4 className="font-medium mb-3">Related Links</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Gitlab className="w-4 h-4" />
                <Link href="#" className="text-blue-600 hover:underline">
                  GitLab Issue #1234
                </Link>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Bug className="w-4 h-4" />
                <Link href="#" className="text-blue-600 hover:underline">
                  Slack Thread
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
