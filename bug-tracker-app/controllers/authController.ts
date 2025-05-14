import User from "../models/userModel";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { sendEmail } from "../lib/sendEmail";
import connectDB from "../lib/db/Connect";

export const registerUser = async (req: Request) => {
  try {
    await connectDB();
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      throw new Error("All fields are required");
    }

    // Validate role
    const validRoles = [
      "Developer",
      "Tester",
      "Project Manager",
      "Team Manager",
    ];
    if (!validRoles.includes(role)) {
      throw new Error("Invalid role selected");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const newUser = new User({
      name,
      email,
      password,
      role,
      isVerified: false,
    });
    await newUser.save();

    const verificationToken = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_VERIFICATION_TOKEN as string,
      { expiresIn: "24h" }
    );

    const verificationLink = `${process.env.BASE_URL}/auth/verify-email?token=${verificationToken}`;

    await sendEmail({
      to: newUser.email,
      subject: "Verify your email address - Bug Tracker",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #6B46C1; text-align: center;">Welcome to Bug Tracker!</h1>
          <p>Thank you for registering as a ${role}. To complete your registration and access your account, please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background-color: #6B46C1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p style="color: #666; font-size: 14px; word-break: break-all;">${verificationLink}</p>
          <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
        </div>
      `,
    });

    return {
      success: true,
      message:
        "Registration successful. Please check your email for verification.",
    };
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (req: Request) => {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_ACCESS_TOKEN as string,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_TOKEN as string,
      { expiresIn: "7d" }
    );

    return {
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
    };
  } catch (error) {
    throw error;
  }
};

export const verifyEmail = async (token: string) => {
  try {
    await connectDB();

    if (!token) {
      throw new Error("Token is required");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_VERIFICATION_TOKEN as string
    ) as JwtPayload & { userId: string };

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Update user verification status
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    return { success: true, message: "Email verified successfully" };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Invalid or expired token");
  }
};

export const requestPasswordReset = async (req: Request) => {
  const { email } = await req.json();

  if (!email) {
    throw new Error("Email is required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const resetToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_RESET_TOKEN as string,
    { expiresIn: "1h" }
  );

  const resetLink = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: "Password Reset Request",
    html: `<h1>Password Reset</h1><p>Please reset your password by clicking <a href="${resetLink}">here</a>.</p>`,
  });

  return { message: "Password reset email sent." };
};

export const resetPassword = async (req: Request) => {
  const { token, newPassword } = await req.json();

  if (!token || !newPassword) {
    throw new Error("Token and new password are required");
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_RESET_TOKEN as string
    ) as JwtPayload & { userId: string };

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new Error("User not found");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return { message: "Password reset successful" };
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

export const checkAuth = async (req: Request) => {
  const token = req.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    throw new Error("No token provided");
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_TOKEN as string
    ) as JwtPayload & { userId: string };

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new Error("User not found");
    }

    return { message: "User authenticated", user };
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};
