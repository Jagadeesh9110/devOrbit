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

    if (!decoded.userId) {
      throw new Error("Invalid token payload");
    }

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
  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");

  response.cookies.set({
    name: "accessToken",
    value: accessToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });

  response.cookies.set({
    name: "refreshToken",
    value: refreshToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
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

export async function serverFetchWithAuth(
  url: string,
  options: RequestInit = {}
) {
  const { cookies } = await import("next/headers");

  const cookieStore = cookies();
  let accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { error: "No access token" };
  }

  const fetchOptions = {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  };

  let res = await fetch(url, fetchOptions);

  if (res.status === 401) {
    const refreshRes = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      const newCookieStore = cookies();
      accessToken = newCookieStore.get("accessToken")?.value;

      if (!accessToken) {
        return { error: "Failed to get new access token" };
      }

      const retryOptions = {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        },
      };

      res = await fetch(url, retryOptions);

      if (!res.ok) {
        return {
          error: `Request failed with status ${res.status} after refresh`,
        };
      }
    } else {
      return { error: "refresh_failed" };
    }
  }

  if (!res.ok) {
    return { error: `Request failed with status ${res.status}` };
  }

  const data = await res.json();
  return { data };
}

export const getClientSideToken = () => {
  if (typeof window === "undefined") {
    return { accessToken: null, refreshToken: null };
  }

  // For httpOnly cookies, we can't directly access them
  // Instead, we'll make the API call and let the server handle authentication
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
      throw new Error(`Refresh failed with status ${res.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Client-side refresh failed:", error);
    return { success: false };
  }
};

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  try {
    // First attempt
    let res = await fetch(url, {
      ...options,
      credentials: "include", // Always include credentials for cookie handling
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
      },
    }).catch((error) => {
      throw new Error(`Network error: ${error.message}`);
    });

    // If unauthorized, try to refresh the token
    if (res.status === 401) {
      console.log("Token expired, attempting refresh...");
      const refreshResult = await clientSideRefresh();
      if (!refreshResult.success) {
        throw new Error("Authentication token refresh failed");
      }

      // Retry the original request with new token (in httpOnly cookie)
      res = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
          ...options.headers,
          "Content-Type": "application/json",
        },
      }).catch((error) => {
        throw new Error(`Network error after token refresh: ${error.message}`);
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

    const data = await res.json().catch(() => {
      throw new Error("Invalid JSON response from server");
    });

    return data;
  } catch (error) {
    console.error("fetchWithAuth error:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to make request",
    };
  }
}
