import mongoose, { Schema, Document, model } from "mongoose";

export interface BugInt extends Document {
  title: string;
  description: string;
  status: "Open" | "In Progress" | "Closed";
  createdBy: mongoose.Types.ObjectId; // user
}

const BugSchema: Schema = new Schema<BugInt>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Closed"],
      default: "Open",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Relation to User
      required: true,
    },
  },
  { timestamps: true }
);

export const Bug = model<BugInt>("Bug", BugSchema);
