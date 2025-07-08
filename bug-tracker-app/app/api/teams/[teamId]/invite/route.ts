// app/api/teams/[teamId]/invite/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db/Connect";
import { sendInvitation } from "@/controllers/teamController";

export async function POST(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    await connectDB();

    const accessToken = request.cookies.get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(accessToken);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { teamId } = params;
    const body = await request.json();
    const { email, role } = body;

    // Validate input
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (
      role &&
      !["Admin", "Project Manager", "Developer", "Tester"].includes(role)
    ) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Send invitation
    const result = await sendInvitation(
      teamId,
      { email, role },
      payload.userId
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Team invite API error:", error.message);

    if (error.message.includes("Invalid team ID")) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
    }

    if (error.message.includes("Team not found")) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    if (error.message.includes("Forbidden")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (
      error.message.includes("already exists") ||
      error.message.includes("already a member")
    ) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    if (error.message.includes("Invalid email")) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
