import mongoose, { Schema, Document, model } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: "ASSIGNMENT" | "MENTION" | "COMMENT" | "STATUS_CHANGE";
  title: string;
  message: string;
  relatedBugId?: mongoose.Types.ObjectId;
  relatedCommentId?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["ASSIGNMENT", "MENTION", "COMMENT", "STATUS_CHANGE"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedBugId: {
      type: Schema.Types.ObjectId,
      ref: "Bug",
    },
    relatedCommentId: {
      type: Schema.Types.ObjectId,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification =
  mongoose.models.Notification ||
  model<INotification>("Notification", notificationSchema);

export { Notification };
