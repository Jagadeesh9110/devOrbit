import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getTokenFromCookies, refreshAccessToken } from "../../../../lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = getTokenFromCookies(request);

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "No refresh token provided" },
        { status: 401 }
      );
    }

    const { success, accessToken, error } = await refreshAccessToken(
      refreshToken
    );

    if (success && accessToken) {
      const response = NextResponse.json({ success: true, accessToken });

      response.cookies.set({
        name: "accessToken",
        value: accessToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60,
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: error || "Failed to refresh token" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to refresh token" },
      { status: 500 }
    );
  }
}
