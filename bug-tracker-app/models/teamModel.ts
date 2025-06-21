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
    workload?: number;
    assignedBugs?: number;
    resolvedBugs?: number;
    avgResolutionTime?: string;
    specialties?: string[];
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
        workload: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
        assignedBugs: {
          type: Number,
          default: 0,
        },
        resolvedBugs: {
          type: Number,
          default: 0,
        },
        avgResolutionTime: {
          type: String,
          default: "0 days",
        },
        specialties: [
          {
            type: String,
            trim: true,
          },
        ],
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

teamSchema.methods.getPerformanceMetrics = function () {
  const totalAssigned = this.members.reduce(
    (sum: number, member: any) => sum + (member.assignedBugs || 0),
    0
  );
  const totalResolved = this.members.reduce(
    (sum: number, member: any) => sum + (member.resolvedBugs || 0),
    0
  );
  const avgWorkload =
    this.members.reduce(
      (sum: number, member: any) => sum + (member.workload || 0),
      0
    ) / this.members.length;

  return {
    totalAssigned,
    totalResolved,
    resolutionRate:
      totalAssigned > 0 ? Math.round((totalResolved / totalAssigned) * 100) : 0,
    avgWorkload: Math.round(avgWorkload),
    memberCount: this.members.length,
  };
};

const Team = mongoose.models.Team || model<ITeam>("Team", teamSchema);

export { Team };
