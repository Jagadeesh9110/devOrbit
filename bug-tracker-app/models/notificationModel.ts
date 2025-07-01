import mongoose, { Schema, Document, model } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: "bug_assigned" | "bug_resolved" | "mention" | "critical";
  title: string;
  message: string;
  time: Date;
  read: boolean;
  bugId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  age: string;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: ["bug_assigned", "bug_resolved", "mention", "critical"],
        message:
          "Type must be one of: bug_assigned, bug_resolved, mention, critical",
      },
      required: [true, "Notification type is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    time: {
      type: Date,
      default: Date.now,
      required: [true, "Time is required"],
    },
    read: {
      type: Boolean,
      default: false,
    },
    bugId: {
      type: Schema.Types.ObjectId,
      ref: "Bug",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
notificationSchema.index({ userId: 1, time: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ read: 1 });

notificationSchema.virtual("age").get(function (this: INotification) {
  const now = new Date();
  const diffMs = now.getTime() - this.time.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffMinutes > 0)
    return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
  return "Just now";
});

// Method: Mark as read
notificationSchema.methods.markAsRead =
  async function (): Promise<INotification> {
    this.read = true;
    return await this.save();
  };

const Notification =
  mongoose.models.Notification ||
  model<INotification>("Notification", notificationSchema);

export default Notification;
