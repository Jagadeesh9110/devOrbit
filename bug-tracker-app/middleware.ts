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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    publicPaths.some((path) => pathname.startsWith(path)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const { accessToken, refreshToken } = getTokenFromCookies(request);

  if (!accessToken && !refreshToken) {
    return redirectToLogin(request);
  }

  try {
    if (accessToken) {
      try {
        await verifyEdgeToken(accessToken);
        return NextResponse.next();
      } catch (error) {
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
        return redirectToLogin(request);
      }
    }

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

    return redirectToLogin(request);
  } catch (error) {
    console.error("Middleware error:", error);
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
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
