import mongoose, { Schema, Document, model } from "mongoose";

export interface ITeam extends Document {
  name: string;
  description?: string;
  members: Array<{
    userId: mongoose.Types.ObjectId;
    role:
      | "Project Manager"
      | "Team Lead"
      | "Senior Developer"
      | "Developer"
      | "QA Engineer";
    joinedAt: Date;
  }>;
  projects: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<ITeam>(
  {
    name: {
      type: String,
      required: [true, "Team name is required"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    members: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: [
            "Project Manager",
            "Team Lead",
            "Senior Developer",
            "Developer",
            "QA Engineer",
          ],
          default: "Developer",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    projects: [
      {
        type: Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

teamSchema.index({ "members.userId": 1 });
teamSchema.index({ projects: 1 });

teamSchema.virtual("memberCount").get(function (this: ITeam) {
  return this.members.length;
});

teamSchema.virtual("activities").get(function (this: ITeam) {
  return {
    created: this.createdAt,
    updated: this.updatedAt,
    members: this.members.length,
    projects: this.projects.length,
  };
});

const Team = mongoose.models.Team || model<ITeam>("Team", teamSchema);

export { Team };
