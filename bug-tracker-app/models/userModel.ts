import mongoose, { Schema, Document, model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  email: string;
  name: string;
  password?: string;
  image?: string;
  isVerified: boolean;
  verificationToken: string | null;
  verificationTokenExpiry: Date | null;
  resetToken: string | null;
  resetTokenExpiry: Date | null;
  role: "Admin" | "Project Manager" | "Developer" | "Tester";
  teamIds: mongoose.Types.ObjectId[];
  badges: Badge[];
  authProvider?: "GOOGLE" | "GITHUB";
  authProviderId?: string;
  notificationsEnabled: boolean;
  themePreference: "light" | "dark" | "system";
  comparePassword(enteredPassword: string): Promise<boolean>;
}

interface Badge {
  name: string;
  description: string;
  earnedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    password: {
      type: String,
      required: function (this: IUser) {
        return !this.authProvider;
      },
      validate: {
        validator: function (this: IUser, value: string | null) {
          if (this.authProvider) return true;
          return value != null && value.length >= 8;
        },
        message: "Password is required and must be at least 8 characters long",
      },
    },
    image: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    verificationTokenExpiry: {
      type: Date,
      default: null,
    },
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpiry: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ["Admin", "Project Manager", "Developer", "Tester"],
      default: "Developer",
    },
    teamIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Team",
      },
    ],
    badges: [
      {
        name: String,
        description: String,
        earnedAt: Date,
      },
    ],
    authProvider: {
      type: String,
      enum: ["GOOGLE", "GITHUB"],
    },
    authProviderId: {
      type: String,
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    themePreference: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (enteredPassword: string) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || model<IUser>("User", userSchema);

export default User;
