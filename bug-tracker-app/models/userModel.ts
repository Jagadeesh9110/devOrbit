import mongoose, { Schema, Document, model } from "mongoose";
import bcrypt from "bcryptjs";

export interface UserInt extends Document {
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  verificationToken: String | null;
  verificationTokenExpiry: Date | null;
  resetToken: String | null;
  resetTokenExpiry: Date | null;
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

// Check if the model has already been compiled
const User = mongoose.models.User || model<UserInt>("User", UserSchema);

export default User;
