import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  verifyToken,
  refreshAccessToken,
  getTokenFromCookies,
} from "./lib/auth";

const publicPaths = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
  "/auth/callback",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/verify-email",
  "/api/auth/google",
  "/api/auth/github",
  "/api/auth/oauth-callback/google",
  "/api/auth/oauth-callback/github",
  "/api/auth/verify",
];

const isPublicPath = (pathname: string) =>
  publicPaths.some((path) => pathname.startsWith(path)) ||
  pathname.startsWith("/_next") ||
  pathname.startsWith("/static") ||
  pathname.includes(".");

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const { accessToken, refreshToken } = getTokenFromCookies(request);

  if (pathname.startsWith("/api")) {
    if (!accessToken && !refreshToken) {
      console.log("API: No tokens provided");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      if (accessToken) {
        const payload = verifyToken(accessToken);
        if (payload) {
          return NextResponse.next();
        }
      }

      if (refreshToken) {
        const { success, accessToken: newAccessToken } =
          await refreshAccessToken(refreshToken);
        if (success && newAccessToken) {
          console.log("API: Refreshed access token");
          const response = NextResponse.next();
          response.cookies.set({
            name: "accessToken",
            value: newAccessToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 3600, // 1 hour
          });
          return response;
        }
      }

      console.log("API: Unauthorized after refresh attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    } catch (error: any) {
      console.error("API Middleware error:", error.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!accessToken && !refreshToken) {
    console.log("Non-API: No tokens, redirecting to login");
    return redirectToLogin(request);
  }

  try {
    if (accessToken) {
      const payload = verifyToken(accessToken);
      if (payload) {
        return NextResponse.next();
      }
    }

    if (refreshToken) {
      const { success, accessToken: newAccessToken } = await refreshAccessToken(
        refreshToken
      );
      if (success && newAccessToken) {
        console.log("Non-API: Refreshed access token");
        const response = NextResponse.next();
        response.cookies.set({
          name: "accessToken",
          value: newAccessToken,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 3600, // 1 hour
        });
        return response;
      }
    }

    console.log("Non-API: Unauthorized after refresh attempt, redirecting");
    return redirectToLogin(request);
  } catch (error: any) {
    console.error("Middleware error:", error.message);
    const response = redirectToLogin(request);
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
