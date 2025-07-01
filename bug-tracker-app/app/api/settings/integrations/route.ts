import { NextRequest, NextResponse } from "next/server";
import { settingsController } from "@/controllers/settingsController";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mock integrations data (replace with real logic if available)
  const result = {
    success: true,
    data: [
      {
        name: "GitHub",
        status: "connected",
        description: "Link bugs to GitHub issues",
      },
      {
        name: "Slack",
        status: "connected",
        description: "Send notifications to Slack channels",
      },
      {
        name: "Jira",
        status: "disconnected",
        description: "Sync with Jira tickets",
      },
      {
        name: "GitLab",
        status: "disconnected",
        description: "Connect with GitLab merge requests",
      },
    ],
    status: 200,
    error: null,
  };

  return NextResponse.json(
    { success: result.success, data: result.data, error: result.error },
    { status: result.status }
  );
}
