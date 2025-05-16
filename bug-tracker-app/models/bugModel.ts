import mongoose, { Schema, Document, model } from "mongoose";

export interface BugInt extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  createdBy: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  assigneeId?: mongoose.Types.ObjectId;
  priority: "Low" | "Medium" | "High" | "Critical";
  severity: "Minor" | "Major" | "Critical";
  environment?: "Development" | "Staging" | "Production";
  labels: string[];
  linkedPRs: { url: string; platform: "GitHub" | "GitLab" }[];
  comments: Array<{
    text: string;
    author: mongoose.Types.ObjectId;
    mentions: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
  }>;
  attachments: Array<{
    url: string;
    type: "image" | "log" | "other";
    uploadedAt: Date;
  }>;
  viewers: Array<{
    userId: mongoose.Types.ObjectId;
    lastViewed: Date;
  }>;
  resolvedBy?: mongoose.Types.ObjectId;
  closedBy?: mongoose.Types.ObjectId;
  dueDate?: Date;
  expectedFixDate?: Date;
  reopenedCount?: number;
  reopenedBy?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BugInput {
  title: string;
  description: string;
  status: string;
  createdBy: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  assigneeId?: mongoose.Types.ObjectId;
  priority: "Low" | "Medium" | "High" | "Critical";
  severity?: "Minor" | "Major" | "Critical";
  environment?: string;
  comments?: Array<{
    text: string;
    author: mongoose.Types.ObjectId;
    createdAt: Date;
  }>;
  attachments?: string[];
  viewers?: Array<{
    userId: mongoose.Types.ObjectId;
    lastViewed: Date;
  }>;
  resolvedBy?: mongoose.Types.ObjectId;
  closedBy?: mongoose.Types.ObjectId;
  dueDate?: Date;
  expectedFixDate?: Date;
  reopenedCount?: number;
  reopenedBy?: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

const BugSchema: Schema = new Schema<BugInt>(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    assigneeId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
      index: true,
    },
    severity: {
      type: String,
      enum: ["Minor", "Major", "Critical"],
      required: true,
      default: "Major",
    },
    environment: {
      type: String,
      enum: ["Development", "Staging", "Production"],
    },
    labels: [{ type: String, index: true }],
    linkedPRs: [
      {
        url: { type: String, required: true },
        platform: { type: String, enum: ["GitHub", "GitLab"], required: true },
      },
    ],
    comments: [
      {
        text: { type: String, required: true, trim: true },
        author: { type: Schema.Types.ObjectId, ref: "User", required: true },
        mentions: [{ type: Schema.Types.ObjectId, ref: "User" }],
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    attachments: [
      {
        url: { type: String, required: true },
        type: { type: String, enum: ["image", "log", "other"], required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    viewers: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        lastViewed: { type: Date, default: Date.now },
      },
    ],
    resolvedBy: { type: Schema.Types.ObjectId, ref: "User", index: true },
    closedBy: { type: Schema.Types.ObjectId, ref: "User", index: true },
    dueDate: { type: Date },
    expectedFixDate: { type: Date },
    reopenedCount: { type: Number, default: 0 },
    reopenedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

BugSchema.virtual("activities").get(function (this: BugInt) {
  return {
    created: this.createdAt,
    updated: this.updatedAt,
    comments: this.comments.length,
  };
});

BugSchema.index({ projectId: 1, status: 1 });
BugSchema.index({ projectId: 1, priority: 1 });
BugSchema.index({ projectId: 1, assigneeId: 1 });
BugSchema.index({ labels: 1, projectId: 1 });

BugSchema.pre("save", function (this: BugInt, next) {
  if (
    typeof this.isModified === "function" &&
    this.isModified("status") &&
    this.status === "Resolved"
  ) {
    this.updatedAt = new Date();
  }
  next();
});

export const Bug = model<BugInt>("Bug", BugSchema);
