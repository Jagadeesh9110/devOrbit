// app/api/auth/verify/route.ts - Enhanced version
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { verifyToken, refreshAccessToken, setAuthCookies } from "@/lib/auth";
import connectDB from "@/lib/db/Connect";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;

    // No tokens provided
    if (!accessToken && !refreshToken) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          isAuthenticated: false,
        },
        { status: 401 }
      );
    }

    // Try to verify access token first
    if (accessToken) {
      try {
        const payload = verifyToken(accessToken);
        if (payload) {
          const user = await User.findById(payload.userId).select("-password");
          if (!user) {
            return NextResponse.json(
              {
                error: "User not found",
                isAuthenticated: false,
              },
              { status: 404 }
            );
          }

          if (!user.isVerified) {
            return NextResponse.json(
              {
                error: "Email not verified",
                isAuthenticated: false,
                emailVerified: false,
              },
              { status: 403 }
            );
          }

          return NextResponse.json({
            user: {
              id: user._id,
              email: user.email,
              name: user.name,
              role: user.role,
              isVerified: user.isVerified,
              createdAt: user.createdAt,
            },
            isAuthenticated: true,
          });
        }
      } catch (error) {
        console.log("Access token verification failed, trying refresh...");
      }
    }

    // Access token failed, try refresh token
    if (refreshToken) {
      const refreshResult = await refreshAccessToken(refreshToken);
      if (refreshResult.success && refreshResult.accessToken) {
        try {
          const payload = verifyToken(refreshResult.accessToken);
          if (payload) {
            const user = await User.findById(payload.userId).select(
              "-password"
            );
            if (!user) {
              return NextResponse.json(
                {
                  error: "User not found",
                  isAuthenticated: false,
                },
                { status: 404 }
              );
            }

            if (!user.isVerified) {
              return NextResponse.json(
                {
                  error: "Email not verified",
                  isAuthenticated: false,
                  emailVerified: false,
                },
                { status: 403 }
              );
            }

            // Set new access token in response
            const response = NextResponse.json({
              user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
              },
              isAuthenticated: true,
              tokenRefreshed: true,
            });

            // Update access token cookie
            response.cookies.set({
              name: "accessToken",
              value: refreshResult.accessToken,
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
              maxAge: 15 * 60, // 15 minutes
            });

            return response;
          }
        } catch (error) {
          console.error("Error verifying refreshed token:", error);
        }
      }
    }

    const response = NextResponse.json(
      {
        error: "Invalid or expired tokens",
        isAuthenticated: false,
      },
      { status: 401 }
    );

    response.cookies.set({
      name: "accessToken",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    response.cookies.set({
      name: "refreshToken",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Auth verification error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        isAuthenticated: false,
      },
      { status: 500 }
    );
  }
}
