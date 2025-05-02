import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

export function authMiddleware(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return NextResponse.json(
      { message: "Unauthorized: No token provided" },
      { status: 401 }
    );
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_TOKEN as string
    ) as JwtPayload & { userId: string };

    // Optionally attach decoded info to the request (Next.js Edge doesn't support modifying req directly)
    // So you may pass it via headers for downstream usage (if needed)
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", decoded.userId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Unauthorized: Invalid or expired token" },
      { status: 401 }
    );
  }
}
