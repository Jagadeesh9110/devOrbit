export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { loginUser } from "../../../../controllers/authController";
import { setAuthCookies } from "../../../../lib/auth";

export async function POST(request: NextRequest) {
  try {
    const result = await loginUser(request);

    if (result.success && result.data) {
      console.log("Login successful, setting cookies:", {
        userId: result.data.user.id,
        accessToken: result.data.accessToken.substring(0, 20) + "...",
      });

      const response = NextResponse.json({
        success: true,
        message: result.message,
        user: result.data.user,
      });

      return setAuthCookies(
        response,
        result.data.accessToken,
        result.data.refreshToken
      );
    }

    console.log("Login failed:", result.message);
    return NextResponse.json(
      { success: false, message: result.message },
      { status: 401 }
    );
  } catch (error: any) {
    console.error("Login error:", error.message);
    return NextResponse.json(
      { success: false, message: "Authentication failed" },
      { status: 500 }
    );
  }
}
