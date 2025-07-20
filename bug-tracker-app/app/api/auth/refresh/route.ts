export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import {
  getTokenFromCookies,
  refreshAccessToken,
  setAuthCookies,
} from "../../../../lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = getTokenFromCookies(request);
    if (!refreshToken) {
      console.log("Refresh: No refresh token provided");
      return NextResponse.json(
        { success: false, message: "No refresh token provided" },
        { status: 401 }
      );
    }

    const { success, accessToken, error } = await refreshAccessToken(
      refreshToken
    );
    if (success && accessToken) {
      console.log("Refresh: New access token generated");
      const response = NextResponse.json({ success: true });
      return setAuthCookies(response, accessToken, refreshToken);
    }

    console.log("Refresh: Failed to refresh token:", error);
    return NextResponse.json(
      { success: false, message: error || "Failed to refresh token" },
      { status: 401 }
    );
  } catch (error: any) {
    console.error("Refresh error:", error.message);
    return NextResponse.json(
      { success: false, message: "Failed to refresh token" },
      { status: 500 }
    );
  }
}
