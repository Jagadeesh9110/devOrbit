export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { notificationsController } from "@/controllers/notificationsController";
import { getTokenFromCookies } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { accessToken } = getTokenFromCookies(request);
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await notificationsController.getNotifications(accessToken);

    return NextResponse.json(
      { success: result.success, data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error: any) {
    console.error("GET /api/user/notifications error:", error.message);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
