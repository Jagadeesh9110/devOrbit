import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/sendEmail";
import { settingsController } from "@/controllers/settingsController";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["Admin", "Member"]),
});

// Helper function to generate random token using Web Crypto API
function generateInviteToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  try {
    const { email, role } = inviteSchema.parse(body);
    const result = await settingsController.getProfile(accessToken);

    if (!result.success || result.data.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const inviteToken = generateInviteToken();

    // Save invite to DB or send directly
    await sendEmail({
      to: email,
      subject: "Team Invitation",
      html: `Join our team! <a href="https://yourapp.com/invite/${inviteToken}">Accept</a>`,
    });

    return NextResponse.json(
      { success: true, message: "Invitation sent" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to send invite" },
      { status: 500 }
    );
  }
}
