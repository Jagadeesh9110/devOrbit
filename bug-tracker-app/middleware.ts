import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  verifyEdgeToken,
  refreshEdgeToken,
  getTokenFromCookies,
} from "./lib/edge-auth";

const publicPaths = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/verify-email",
];

const isPublicPath = (pathname: string) =>
  publicPaths.some((path) => pathname.startsWith(path)) ||
  pathname.startsWith("/_next") ||
  pathname.startsWith("/static") ||
  pathname.includes(".");

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const { accessToken, refreshToken } = getTokenFromCookies(request);

  // No tokens available, redirect to login
  if (!accessToken && !refreshToken) {
    return redirectToLogin(request);
  }

  try {
    // Try to verify access token first
    if (accessToken) {
      try {
        await verifyEdgeToken(accessToken);
        const response = NextResponse.next();
        // Ensure the access token is properly set in the response
        response.cookies.set({
          name: "accessToken",
          value: accessToken,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 15 * 60, // 15 minutes
        });
        return response;
      } catch (error) {
        // Access token invalid, try refresh token
        if (refreshToken) {
          const { success, accessToken: newAccessToken } =
            await refreshEdgeToken(refreshToken);
          if (success && newAccessToken) {
            const response = NextResponse.next();
            response.cookies.set({
              name: "accessToken",
              value: newAccessToken,
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
              maxAge: 15 * 60,
            });
            return response;
          }
        }
      }
    }

    // Try refresh token if no access token
    if (refreshToken) {
      const { success, accessToken: newAccessToken } = await refreshEdgeToken(
        refreshToken
      );
      if (success && newAccessToken) {
        const response = NextResponse.next();
        response.cookies.set({
          name: "accessToken",
          value: newAccessToken,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 15 * 60,
        });
        return response;
      }
    }

    // If we get here, no valid tokens were found
    return redirectToLogin(request);
  } catch (error) {
    console.error("Middleware error:", error);
    const response = redirectToLogin(request);
    // Clear invalid tokens
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  }
}

function redirectToLogin(request: NextRequest) {
  const url = new URL("/auth/login", request.url);
  if (!request.nextUrl.pathname.startsWith("/auth/login")) {
    url.searchParams.set("from", request.nextUrl.pathname);
  }
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
