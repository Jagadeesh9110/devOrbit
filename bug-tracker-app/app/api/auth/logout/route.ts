import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  const isProduction = process.env.NODE_ENV === "production";
  const domain = isProduction ? process.env.COOKIE_DOMAIN : undefined;

  // Clear accessToken cookie
  response.cookies.set("accessToken", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
    ...(domain && { domain }),
  });

  // Clear refreshToken cookie
  response.cookies.set("refreshToken", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
    ...(domain && { domain }),
  });

  return response;
}

export async function GET() {
  const response = NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/auth/login?message=Logged out successfully`
  );

  const isProduction = process.env.NODE_ENV === "production";
  const domain = isProduction ? process.env.COOKIE_DOMAIN : undefined;

  // Clear cookies
  response.cookies.set("accessToken", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
    ...(domain && { domain }),
  });

  response.cookies.set("refreshToken", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
    ...(domain && { domain }),
  });

  return response;
}
