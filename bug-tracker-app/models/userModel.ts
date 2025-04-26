import mongoose, { Schema, Document, model } from "mongoose";
import bcrypt from "bcryptjs";

export interface UserInt extends Document {
  name: string;
  email: string;
  password: string;
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
// Because this inside Mongoose middleware is typed as any by default in TypeScript, it's better to hint TypeScript that this is a UserInt document.

UserSchema.methods.comparePassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};
export const User = model<UserInt>("User", UserSchema);
