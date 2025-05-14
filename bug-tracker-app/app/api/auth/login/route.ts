import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { loginUser } from "../../../../controllers/authController";
import { setAuthCookies } from "../../../../lib/auth";

export async function POST(request: NextRequest) {
  try {
    const result = await loginUser(request);

    if (result.success && result.data) {
      const response = NextResponse.json({
        success: true,
        message: result.message,
        user: result.data.user,
      });

      // Set auth cookies
      return setAuthCookies(
        response,
        result.data.accessToken,
        result.data.refreshToken
      );
    }

    return NextResponse.json(
      { success: false, message: result.message },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Authentication failed" },
      { status: 500 }
    );
  }
}
