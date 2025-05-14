import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export interface TokenPayload {
  userId: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export const generateTokens = ({
  userId,
  role,
}: {
  userId: string;
  role?: string;
}) => {
  if (!process.env.JWT_ACCESS_TOKEN || !process.env.JWT_REFRESH_TOKEN) {
    throw new Error("JWT secrets are not configured");
  }

  const accessToken = jwt.sign({ userId, role }, process.env.JWT_ACCESS_TOKEN, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign(
    { userId, role },
    process.env.JWT_REFRESH_TOKEN,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

export const verifyToken = (
  token: string,
  isRefreshToken = false
): TokenPayload => {
  const secret = isRefreshToken
    ? process.env.JWT_REFRESH_TOKEN
    : process.env.JWT_ACCESS_TOKEN;

  if (!secret) {
    throw new Error("JWT token secret is not configured");
  }

  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;

    // Additional validation
    if (!decoded.userId) {
      throw new Error("Invalid token payload");
    }

    // Check if token is expired
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      throw new Error("Token has expired");
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token has expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    }
    throw error;
  }
};

export const setAuthCookies = (
  response: NextResponse,
  accessToken: string,
  refreshToken: string
) => {
  // Clear any existing tokens first
  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");

  // Set new tokens
  response.cookies.set({
    name: "accessToken",
    value: accessToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60, // 15 minutes
  });

  response.cookies.set({
    name: "refreshToken",
    value: refreshToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return response;
};

export const getTokenFromCookies = (request: NextRequest) => {
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  return { accessToken, refreshToken };
};

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const payload = verifyToken(refreshToken, true);
    const { accessToken } = generateTokens({
      userId: payload.userId,
      role: payload.role,
    });
    return { success: true, accessToken };
  } catch (error) {
    console.error("Token refresh error:", error);
    return { success: false, error: "Invalid refresh token" };
  }
};
