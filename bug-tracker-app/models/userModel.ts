import mongoose, { Schema, Document, model } from "mongoose";
import bcrypt from "bcryptjs";

export interface Badge {
  name: string;
  earnedAt: Date;
  projectId?: mongoose.Types.ObjectId;
}

export interface UserInt extends Document {
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  verificationToken: String | null;
  verificationTokenExpiry: Date | null;
  resetToken: String | null;
  resetTokenExpiry: Date | null;
  role: "Developer" | "Tester" | "Project Manager" | "Team Manager";
  teamIds: mongoose.Types.ObjectId[];
  badges: Badge[];
  comparePassword: (enteredPassword: string) => Promise<boolean>;
}

const UserSchema: Schema = new Schema<UserInt>(
  {
    name: {
      type: String,
      required: [true, "Username is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password should be at least 8 characters long"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: { type: String, required: false, default: null },
    verificationTokenExpiry: { type: Date, required: false, default: null },
    resetToken: { type: String, required: false, default: null },
    resetTokenExpiry: { type: Date, required: false, default: null },
    role: {
      type: String,
      enum: ["Developer", "Tester", "Project Manager", "Team Manager"],
      required: [true, "Role is required"],
    },
    teamIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    badges: [
      {
        name: {
          type: String,
          required: true,
        },
        earnedAt: {
          type: Date,
          default: Date.now,
        },
        projectId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Project",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

UserSchema.pre<UserInt>("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const hashedPassword = await bcrypt.hash(this.password as string, 10);
    this.password = hashedPassword;
    next();
  } catch (err) {
    next(err as Error);
  }
});

UserSchema.methods.comparePassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || model<UserInt>("User", UserSchema);

export default User;
