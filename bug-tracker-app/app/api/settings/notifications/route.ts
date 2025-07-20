export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { settingsController } from "@/controllers/settingsController";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await settingsController.getNotifications(accessToken);
  return NextResponse.json(
    { success: result.success, data: result.data, error: result.error },
    { status: result.status }
  );
}

export async function PUT(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = await settingsController.updateNotifications(
    accessToken,
    body
  );
  return NextResponse.json(
    { success: result.success, data: result.data, error: result.error },
    { status: result.status }
  );
}
