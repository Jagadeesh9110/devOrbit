// app/api/invite/[token]/decline/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db/Connect";
import { declineInvitationByToken } from "@/controllers/teamController";

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    await connectDB();

    const { token } = params;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Get token from cookies (optional for decline)
    const accessToken = request.cookies.get("accessToken")?.value;
    let userId: string | undefined;

    if (accessToken) {
      const payload = verifyToken(accessToken);
      if (payload) {
        userId = payload.userId;
      }
    }

    // Decline invitation
    const result = await declineInvitationByToken(token, userId);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Decline invite API error:", error.message);

    if (error.message.includes("not found")) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    if (error.message.includes("no longer valid")) {
      return NextResponse.json(
        { error: "Invitation is no longer valid" },
        { status: 410 }
      );
    }

    if (error.message.includes("Invalid token")) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
