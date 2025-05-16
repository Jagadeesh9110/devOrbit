import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getTokenFromCookies } from "../../../../lib/auth";
import connectDB from "../../../../lib/db/Connect";
import User from "../../../../models/userModel";
import { generateTokens, setAuthCookies } from "../../../../lib/auth";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { accessToken } = getTokenFromCookies(request);

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { role } = await request.json();

    if (!role) {
      return NextResponse.json(
        { success: false, message: "Role is required" },
        { status: 400 }
      );
    }

    // Verify the token and get user ID
    const checkResponse = await fetch(
      `${request.nextUrl.origin}/api/auth/check`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const checkData = await checkResponse.json();

    if (!checkData.user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Update user's role
    const user = await User.findByIdAndUpdate(
      checkData.user.id,
      { role },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Failed to update role" },
        { status: 500 }
      );
    }

    // Generate new tokens with updated role
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      generateTokens({
        userId: user._id.toString(),
        role: user.role,
      });

    const jsonResponse = NextResponse.json({
      success: true,
      message: "Role updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });

    // Set new auth cookies
    return setAuthCookies(jsonResponse, newAccessToken, newRefreshToken);
  } catch (error) {
    console.error("Role update error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update role" },
      { status: 500 }
    );
  }
}
