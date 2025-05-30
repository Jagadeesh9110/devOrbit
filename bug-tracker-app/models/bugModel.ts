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
      index: true,
    },
    environment: {
      type: String,
      enum: ["Development", "Staging", "Production"],
      default: "Development",
      index: true,
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
        text: {
          type: String,
          required: true,
          trim: true,
        },
        author: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        mentions: [
          {
            type: Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        attachments: [
          {
            url: String,
            type: {
              type: String,
              enum: ["image", "file"],
            },
            name: String,
            size: Number,
          },
        ],
        reactions: [
          {
            emoji: String,
            userId: {
              type: Schema.Types.ObjectId,
              ref: "User",
            },
            createdAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
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
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        lastViewed: {
          type: Date,
          default: Date.now,
        },
        viewCount: {
          type: Number,
          default: 1,
        },
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

BugSchema.virtual("commentCount").get(function (this: BugInt) {
  return this.comments.length;
});

BugSchema.virtual("viewerCount").get(function (this: BugInt) {
  return this.viewers.length;
});

BugSchema.methods.updateViewer = async function (
  userId: mongoose.Types.ObjectId
) {
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

  return this.save();
};

BugSchema.methods.addComment = async function (
  text: string,
  authorId: mongoose.Types.ObjectId,
  mentions: mongoose.Types.ObjectId[] = []
) {
  this.comments.push({
    text,
    author: authorId,
    mentions,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return this.save();
};

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

const Bug = mongoose.models.Bug || model<BugInt>("Bug", BugSchema);

export { Bug };
