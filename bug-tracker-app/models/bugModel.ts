import mongoose, { Schema, Document, model } from "mongoose";
import { notificationsController } from "@/controllers/notificationsController";

export interface IBug extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  createdBy: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  assigneeId?: mongoose.Types.ObjectId;
  priority: "Low" | "Medium" | "High" | "Critical";
  severity: "Minor" | "Major" | "Critical";
  environment: "Development" | "Staging" | "Production";
  labels: string[];
  linkedPRs: { url: string; platform: "GitHub" | "GitLab" }[];
  comments: Array<{
    text: string;
    author: mongoose.Types.ObjectId;
    mentions: mongoose.Types.ObjectId[];
    attachments: Array<{
      url: string;
      type: "image" | "file";
      name: string;
      size: number;
    }>;
    reactions: Array<{
      emoji: string;
      userId: mongoose.Types.ObjectId;
      createdAt: Date;
    }>;
    timeSpent?: number;
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
    viewCount: number;
  }>;
  resolvedBy?: mongoose.Types.ObjectId;
  closedBy?: mongoose.Types.ObjectId;
  dueDate?: Date;
  expectedFixDate?: Date;
  reopenedCount?: number;
  reopenedBy?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  embedding: number[];
  embeddingUpdatedAt?: Date;
  activities: {
    created: Date;
    updated: Date;
    comments: number;
  };
  commentCount: number;
  viewerCount: number;
  updateViewer(userId: mongoose.Types.ObjectId): Promise<IBug>;
  addComment(
    text: string,
    authorId: mongoose.Types.ObjectId,
    mentions?: mongoose.Types.ObjectId[],
    timeSpent?: number
  ): Promise<IBug>;
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
    timeSpent?: number;
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
  embedding?: number[];
  embeddingUpdatedAt?: Date;
}

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Comment author is required"],
    },
    mentions: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    attachments: [
      {
        url: { type: String, required: true },
        type: { type: String, enum: ["image", "file"], required: true },
        name: { type: String, required: true },
        size: { type: Number, required: true, min: 0 },
      },
    ],
    reactions: [
      {
        emoji: { type: String, required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    timeSpent: {
      type: Number,
      min: [0, "Time spent cannot be negative"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const bugSchema = new mongoose.Schema<IBug>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ["Open", "In Progress", "Resolved", "Closed"],
        message: "Status must be one of: Open, In Progress, Resolved, Closed",
      },
      default: "Open",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
      immutable: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project ID is required"],
    },
    assigneeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    priority: {
      type: String,
      enum: {
        values: ["Low", "Medium", "High", "Critical"],
        message: "Priority must be one of: Low, Medium, High, Critical",
      },
      default: "Medium",
    },
    severity: {
      type: String,
      enum: {
        values: ["Minor", "Major", "Critical"],
        message: "Severity must be one of: Minor, Major, Critical",
      },
      required: [true, "Severity is required"],
      default: "Major",
      index: true,
    },
    environment: {
      type: String,
      enum: {
        values: ["Development", "Staging", "Production"],
        message: "Environment must be one of: Development, Staging, Production",
      },
      default: "Development",
      index: true,
    },
    labels: [
      {
        type: String,
        trim: true,
      },
    ],
    linkedPRs: [
      {
        url: { type: String, required: true },
        platform: {
          type: String,
          enum: ["GitHub", "GitLab"],
          required: true,
        },
      },
    ],
    comments: [commentSchema],
    attachments: [
      {
        url: { type: String, required: true },
        type: {
          type: String,
          enum: ["image", "log", "other"],
          required: true,
        },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    viewers: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        lastViewed: { type: Date, default: Date.now },
        viewCount: { type: Number, default: 1, min: 1 },
      },
    ],
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    closedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    dueDate: {
      type: Date,
      validate: {
        validator(value: Date) {
          return !value || value > new Date();
        },
        message: "Due date must be in the future",
      },
    },
    expectedFixDate: {
      type: Date,
      validate: {
        validator(value: Date) {
          return !value || value > new Date();
        },
        message: "Expected fix date must be in the future",
      },
    },
    reopenedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    reopenedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    embedding: {
      type: [Number], // Array of numbers for the vector
      default: [],
    },
    embeddingUpdatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

bugSchema.virtual("activities").get(function (this: IBug) {
  return {
    created: this.createdAt,
    updated: this.updatedAt,
    comments: this.comments.length,
  };
});

bugSchema.virtual("commentCount").get(function (this: IBug) {
  return this.comments.length;
});

bugSchema.virtual("viewerCount").get(function (this: IBug) {
  return this.viewers.length;
});

bugSchema.methods.updateViewer = async function (
  userId: mongoose.Types.ObjectId
): Promise<IBug> {
  const viewerIndex = this.viewers.findIndex(
    (viewer: { userId: mongoose.Types.ObjectId }) =>
      viewer.userId.toString() === userId.toString()
  );

  if (viewerIndex === -1) {
    this.viewers.push({
      userId,
      lastViewed: new Date(),
      viewCount: 1,
    });
  } else {
    this.viewers[viewerIndex].lastViewed = new Date();
    this.viewers[viewerIndex].viewCount += 1;
  }

  return await this.save();
};

bugSchema.methods.addComment = async function (
  text: string,
  authorId: mongoose.Types.ObjectId,
  mentions: mongoose.Types.ObjectId[] = [],
  timeSpent?: number
): Promise<IBug> {
  this.comments.push({
    text,
    author: authorId,
    mentions,
    attachments: [],
    reactions: [],
    timeSpent,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Trigger notifications for mentions
  try {
    if (mentions.length > 0) {
      for (const userId of mentions) {
        if (userId.toString() !== authorId.toString()) {
          await notificationsController.createNotification(
            userId.toString(),
            "mention",
            `Mentioned in Bug: ${this.title}`,
            `You were mentioned in a comment on bug "${this.title}"`,
            this._id.toString()
          );
        }
      }
    }
  } catch (error) {
    console.error("Error creating mention notifications:", error);
  }

  return await this.save();
};

// Indexes
bugSchema.index({ projectId: 1, status: 1 });
bugSchema.index({ projectId: 1, priority: 1 });
bugSchema.index({ projectId: 1, assigneeId: 1 });
bugSchema.index({ labels: 1, projectId: 1 });
bugSchema.index({ createdAt: -1 });
bugSchema.index({ updatedAt: -1 });
bugSchema.index({ createdBy: 1, embedding: 1 });

bugSchema.pre<IBug>("save", async function (next) {
  try {
    if (
      this.isModified("status") &&
      this.status === "Resolved" &&
      this.resolvedBy
    ) {
      this.updatedAt = new Date();
      // Notify assignee and creator
      if (
        this.assigneeId &&
        this.assigneeId.toString() !== this.createdBy.toString()
      ) {
        await notificationsController.createNotification(
          this.assigneeId.toString(),
          "bug_resolved",
          `Bug Resolved: ${this.title}`,
          `Bug "${this.title}" has been resolved`,
          this._id.toString()
        );
      }

      await notificationsController.createNotification(
        this.createdBy.toString(),
        "bug_resolved",
        `Bug Resolved: ${this.title}`,
        `Bug "${this.title}" has been resolved`,
        this._id.toString()
      );
    }

    if (this.isModified("assigneeId") && this.assigneeId) {
      // Notify new assignee
      await notificationsController.createNotification(
        this.assigneeId.toString(),
        "bug_assigned",
        `Bug Assigned: ${this.title}`,
        `You have been assigned to bug "${this.title}"`,
        this._id.toString()
      );
    }

    if (
      this.isNew &&
      (this.priority === "Critical" || this.severity === "Critical")
    ) {
      // Notify project manager
      const Project = mongoose.model("Project");
      const project = await Project.findById(this.projectId).select(
        "managerId"
      );
      if (project && project.managerId) {
        await notificationsController.createNotification(
          project.managerId.toString(),
          "critical",
          `Critical Bug: ${this.title}`,
          `A critical bug "${this.title}" has been reported`,
          this._id.toString()
        );
      }
    }
  } catch (error) {
    console.error("Error creating notifications in bug save:", error);
  }

  if (this.isModified("comments")) {
    const now = new Date();
    this.comments.forEach((comment) => {
      if (!comment.updatedAt || comment.updatedAt < comment.createdAt) {
        comment.updatedAt = now;
      }
    });
  }

  next();
});

const Bug = mongoose.models.Bug || model<IBug>("Bug", bugSchema);

export default Bug;
