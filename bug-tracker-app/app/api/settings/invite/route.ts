import { NextRequest, NextResponse } from "next/server";
import { settingsController } from "@/controllers/settingsController";
import Invitation from "@/models/invitationModel";
import { sendEmail } from "@/lib/sendEmail";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["Admin", "Project Manager", "Developer", "Tester"]),
  teamId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  try {
    const { email, role, teamId } = inviteSchema.parse(body);
    const profileResult = await settingsController.getProfile(accessToken);
    if (!profileResult.success || profileResult.data.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create invitation in DB
    const invitation = new Invitation({
      teamId: teamId || profileResult.data.teamIds[0],
      email,
      invitedBy: profileResult.data.id,
      role,
      status: "pending",
    });
    await invitation.save();

    // Send email with invite link
    const inviteUrl = `https://devorbit.com/invite/${invitation.token}`;
    await sendEmail({
      to: email,
      subject: "devOrbit Team Invitation",
      html: `You’ve been invited to join devOrbit! <a href="${inviteUrl}">Accept Invitation</a>`,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Invitation sent",
        data: { token: invitation.token },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to send invite" },
      { status: 500 }
    );
  }
}
