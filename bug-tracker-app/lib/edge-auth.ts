import { NextRequest, NextResponse } from "next/server";

function stringToUint8Array(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getKey(secret: string): Promise<CryptoKey> {
  const keyData = stringToUint8Array(secret);
  return crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function signToken(
  payload: any,
  secret: string,
  expiresIn: number
): Promise<string> {
  const key = await getKey(secret);
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresIn;

  const tokenPayload = {
    ...payload,
    iat: now,
    exp,
  };

  const headerBase64 = btoa(JSON.stringify(header));
  const payloadBase64 = btoa(JSON.stringify(tokenPayload));
  const unsignedToken = `${headerBase64}.${payloadBase64}`;

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    stringToUint8Array(unsignedToken)
  );

  const signatureBase64 = uint8ArrayToBase64(new Uint8Array(signature));
  return `${unsignedToken}.${signatureBase64}`;
}

async function verifyToken(token: string, secret: string): Promise<any> {
  try {
    if (!token || typeof token !== "string") {
      throw new Error("Token is missing or invalid format");
    }

    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid token format: must have 3 parts");
    }

    const [headerBase64, payloadBase64, signatureBase64] = parts;

    try {
      atob(headerBase64);
      atob(payloadBase64);
      atob(signatureBase64);
    } catch (e) {
      throw new Error("Invalid base64 encoding in token parts");
    }

    const key = await getKey(secret);
    const unsignedToken = `${headerBase64}.${payloadBase64}`;
    const signature = base64ToUint8Array(signatureBase64);
    const unsignedTokenData = stringToUint8Array(unsignedToken);

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      unsignedTokenData
    );

    if (!isValid) {
      throw new Error("Invalid token signature");
    }

    let payload;
    try {
      payload = JSON.parse(atob(payloadBase64));
    } catch (e) {
      throw new Error("Invalid token payload: not valid JSON");
    }

    const now = Math.floor(Date.now() / 1000);

    if (!payload.exp) {
      throw new Error("Token missing expiration");
    }

    if (payload.exp < now) {
      throw new Error(
        `Token expired at ${new Date(payload.exp * 1000).toISOString()}`
      );
    }

    return payload;
  } catch (error) {
    console.error(
      "Token verification failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    throw error;
  }
}

export interface TokenPayload {
  userId: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export const generateTokens = async ({
  userId,
  role,
}: {
  userId: string;
  role?: string;
}) => {
  if (!process.env.JWT_ACCESS_TOKEN || !process.env.JWT_REFRESH_TOKEN) {
    throw new Error("JWT secrets are not configured");
  }

  const accessToken = await signToken(
    { userId, role },
    process.env.JWT_ACCESS_TOKEN,
    15 * 60
  );

  const refreshToken = await signToken(
    { userId, role },
    process.env.JWT_REFRESH_TOKEN,
    7 * 24 * 60 * 60
  );

  return { accessToken, refreshToken };
};

export const verifyEdgeToken = async (
  token: string,
  isRefreshToken = false
): Promise<TokenPayload> => {
  const secret = isRefreshToken
    ? process.env.JWT_REFRESH_TOKEN
    : process.env.JWT_ACCESS_TOKEN;

  if (!secret) {
    console.error(
      "JWT secret is missing for",
      isRefreshToken ? "refresh token" : "access token"
    );
    throw new Error("JWT token secret is not configured");
  }

  try {
    console.log("Verifying token type:", isRefreshToken ? "refresh" : "access");
    const payload = (await verifyToken(token, secret)) as TokenPayload;

    if (!payload.userId) {
      console.error("Token payload missing userId:", payload);
      throw new Error("Invalid token payload: missing userId");
    }

    return payload;
  } catch (error) {
    console.error(
      "Edge token verification failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Invalid token");
  }
};

export const refreshEdgeToken = async (refreshToken: string) => {
  try {
    console.log("Attempting to refresh token...");
    if (!refreshToken) {
      throw new Error("Refresh token is missing");
    }

    const payload = await verifyEdgeToken(refreshToken, true);
    console.log(
      "Refresh token verified, generating new access token for user:",
      payload.userId
    );

    const { accessToken } = await generateTokens({
      userId: payload.userId,
      role: payload.role,
    });

    console.log("New access token generated successfully");
    return { success: true, accessToken };
  } catch (error) {
    console.error(
      "Token refresh error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Invalid refresh token",
    };
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

export const getTokenFromCookies = (request: NextRequest) => {
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  return { accessToken, refreshToken };
};
