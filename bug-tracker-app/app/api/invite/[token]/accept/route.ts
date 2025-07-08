// app/api/invite/[token]/accept/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db/Connect";
import { acceptInvitationByToken } from "@/controllers/teamController";

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

    // Get token from cookies
    const accessToken = request.cookies.get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify token
    const payload = verifyToken(accessToken);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    // Accept invitation
    const result = await acceptInvitationByToken(token, payload.userId);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Accept invite API error:", error.message);

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

    if (error.message.includes("expired")) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 410 }
      );
    }

    if (error.message.includes("Email mismatch")) {
      return NextResponse.json(
        { error: "Email mismatch - please login with the invited email" },
        { status: 400 }
      );
    }

    if (error.message.includes("already a member")) {
      return NextResponse.json(
        { error: "You are already a member of this team" },
        { status: 409 }
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
