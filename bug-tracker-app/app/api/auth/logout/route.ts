import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  response.cookies.set("accessToken", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });
  response.cookies.set("refreshToken", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });

  return response;
}
