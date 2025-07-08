// app/api/invite/[token]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/Connect";
import { getInvitationByToken } from "@/controllers/teamController";

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    await connectDB();

    const { token } = params;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Get invitation details
    const result = await getInvitationByToken(token);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Get invite API error:", error.message);

    if (error.message.includes("not found")) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
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
