import mongoose, { Schema, Document, model } from "mongoose";

export interface TeamMember {
  userId: mongoose.Types.ObjectId;
  role:
    | "Project Manager"
    | "Team Lead"
    | "Senior Developer"
    | "Developer"
    | "QA Engineer";
  joinedAt: Date;
}

export interface ProjectInt extends Document {
  name: string;
  description?: string;
  status: "active" | "planning" | "completed" | "on-hold";
  team: mongoose.Types.ObjectId[];
  teamMembers: TeamMember[];
  managerId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  priority: "high" | "medium" | "low";
  dueDate?: Date;
  tags: string[];
}

const ProjectSchema: Schema = new Schema<ProjectInt>(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "planning", "completed", "on-hold"],
      default: "planning",
    },
    team: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    teamMembers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          required: true,
          enum: [
            "Project Manager",
            "Team Lead",
            "Senior Developer",
            "Developer",
            "QA Engineer",
          ],
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
      index: true,
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    dueDate: {
      type: Date,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ProjectSchema.index({ status: 1 });
ProjectSchema.index({ "teamMembers.userId": 1 });
ProjectSchema.index({ priority: 1 });
ProjectSchema.index({ tags: 1 });

ProjectSchema.virtual("memberCount").get(function (this: ProjectInt) {
  return this.teamMembers.length;
});

ProjectSchema.virtual("activities").get(function (this: ProjectInt) {
  return {
    created: this.createdAt,
    updated: this.updatedAt,
    members: this.teamMembers.length,
  };
});

const Project =
  mongoose.models.Project || model<ProjectInt>("Project", ProjectSchema);

export { Project };
