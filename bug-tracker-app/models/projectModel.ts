import mongoose, { Schema, Document, model } from "mongoose";

export interface TeamMember {
  userId: mongoose.Types.ObjectId;
  role: string;
  joinedAt: Date;
}

export interface ProjectInt extends Document {
  name: string;
  description?: string;
  team: mongoose.Types.ObjectId[];
  teamMembers: TeamMember[];
  managerId: mongoose.Types.ObjectId;
}

const ProjectSchema: Schema = new Schema<ProjectInt>(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
    },
    description: {
      type: String,
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
          enum: ["Developer", "Tester", "Project Manager", "Team Manager"],
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
    },
  },
  { timestamps: true }
);

ProjectSchema.index({ managerId: 1 });

export const Project = model<ProjectInt>("Project", ProjectSchema);
