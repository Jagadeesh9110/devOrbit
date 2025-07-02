export const runtime = "nodejs";

import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

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
    expiresIn: "1h",
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
): TokenPayload | null => {
  const secret = isRefreshToken
    ? process.env.JWT_REFRESH_TOKEN
    : process.env.JWT_ACCESS_TOKEN;

  if (!secret) {
    console.error(
      "JWT secret missing for",
      isRefreshToken ? "refresh" : "access"
    );
    throw new Error("JWT token secret is not configured");
  }

  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    if (!decoded.userId) {
      console.error("Invalid token payload, missing userId:", decoded);
      throw new Error("Invalid token payload");
    }
    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.error("JWT Error:", error.message);
    } else if (error instanceof jwt.TokenExpiredError) {
      console.error("Token expired:", error.message);
    } else {
      console.error("Token verification error:", error);
    }
    return null;
  }
};

export const setAuthCookies = (
  response: NextResponse,
  accessToken: string,
  refreshToken: string
) => {
  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");

  const isProduction = process.env.NODE_ENV === "production";
  response.cookies.set({
    name: "accessToken",
    value: accessToken,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 3600, // 1 hour
  });

  response.cookies.set({
    name: "refreshToken",
    value: refreshToken,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return response;
};

export const getTokenFromCookies = (
  request: Request | { cookies: Map<string, string> } | any
) => {
  if ("cookies" in request && typeof request.cookies.get === "function") {
    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;
    return { accessToken, refreshToken };
  }

  const accessToken =
    request.cookies?.get("accessToken") || request.cookies?.accessToken;
  const refreshToken =
    request.cookies?.get("refreshToken") || request.cookies?.refreshToken;
  return { accessToken, refreshToken };
};

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const payload = verifyToken(refreshToken, true);
    if (!payload) {
      console.error("Invalid refresh token");
      return { success: false, error: "Invalid refresh token" };
    }

    const { accessToken } = generateTokens({
      userId: payload.userId,
      role: payload.role,
    });
    console.log("New access token generated for user:", payload.userId);
    return { success: true, accessToken };
  } catch (error: any) {
    console.error("Token refresh error:", error.message);
    return { success: false, error: error.message || "Invalid refresh token" };
  }
};

export async function serverFetchWithAuth(
  url: string,
  options: RequestInit = {}
) {
  const { cookies } = await import("next/headers");

  const cookieStore = cookies();
  let accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    console.error("No access token in serverFetchWithAuth");
    return { error: "No access token" };
  }

  const fetchOptions = {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  };

  let res = await fetch(url, fetchOptions);

  if (res.status === 401) {
    // console.log("Access token expired, attempting refresh...");
    const refreshRes = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      const newCookieStore = cookies();
      accessToken = newCookieStore.get("accessToken")?.value;

      if (!accessToken) {
        console.error("Failed to get new access token after refresh");
        return { error: "Failed to get new access token" };
      }

      const retryOptions = {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      };

      res = await fetch(url, retryOptions);

      if (!res.ok) {
        console.error("Request failed after refresh:", res.status);
        return {
          error: `Request failed with status ${res.status} after refresh`,
        };
      }
    } else {
      console.error("Refresh failed:", refreshRes.status);
      return { error: "refresh_failed" };
    }
  }

  if (!res.ok) {
    console.error("Request failed:", res.status);
    return { error: `Request failed with status ${res.status}` };
  }

  const data = await res.json();
  return { data };
}

export const getClientSideToken = () => {
  if (typeof window === "undefined") {
    return { accessToken: null, refreshToken: null };
  }

  return {
    accessToken: null,
    refreshToken: null,
  };
};

export const clientSideRefresh = async () => {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error("Refresh failed with status:", res.status);
      throw new Error(`Refresh failed with status ${res.status}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Client-side refresh failed:", error.message);
    return { success: false };
  }
};

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  try {
    let res = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
      },
    });

    if (res.status === 401) {
      console.log("Token expired, attempting refresh...");
      const refreshResult = await clientSideRefresh();
      if (!refreshResult.success) {
        console.warn("Both tokens are invalid, redirecting to login...");
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
        return { error: "Session expired. Redirecting to login." };
      }

      res = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
          ...options.headers,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Authentication failed after token refresh");
        }
        throw new Error(
          `Request failed with status ${res.status} after token refresh`
        );
      }
    } else if (!res.ok) {
      if (res.status === 403) {
        throw new Error(
          "Access forbidden - You don't have permission to access this resource"
        );
      } else if (res.status === 404) {
        throw new Error("Resource not found");
      } else if (res.status >= 500) {
        throw new Error("Server error - Please try again later");
      }
      throw new Error(`Request failed with status ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error: any) {
    console.error("fetchWithAuth error:", error.message);
    return {
      error: error.message || "Failed to make request",
    };
  }
}
