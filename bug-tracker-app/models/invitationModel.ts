import mongoose, { Schema, Document, model } from "mongoose";
import crypto from "crypto";

export interface IInvitation extends Document {
  teamId: mongoose.Types.ObjectId;
  email: string;
  invitedBy: mongoose.Types.ObjectId;
  role: "Admin" | "Project Manager" | "Developer" | "Tester";
  status: "pending" | "accepted" | "declined" | "expired";
  token: string;
  expiresAt: Date;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const invitationSchema = new Schema<IInvitation>(
  {
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["Admin", "Project Manager", "Developer", "Tester"],
      default: "Developer",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "expired"],
      default: "pending",
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

invitationSchema.pre<IInvitation>("save", function (next) {
  if (this.isNew && !this.token) {
    this.token = crypto.randomBytes(32).toString("hex");
  }
  if (this.isNew && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  next();
});

invitationSchema.methods.isExpired = function (): boolean {
  return this.expiresAt < new Date() || this.status === "expired";
};

invitationSchema.methods.markExpired = function () {
  this.status = "expired";
  return this.save();
};

invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Invitation =
  mongoose.models.Invitation ||
  model<IInvitation>("Invitation", invitationSchema);

export default Invitation;
