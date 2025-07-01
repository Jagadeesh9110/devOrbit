import { NextResponse } from "next/server";
import { notificationsController } from "@/controllers/notificationsController";
import { getTokenFromCookies } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { accessToken } = getTokenFromCookies(request);
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Notification ID is required" },
        { status: 400 }
      );
    }

    const result = await notificationsController.markNotificationAsRead(
      accessToken,
      id
    );

    return NextResponse.json(
      { success: result.success, data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error: any) {
    console.error(
      "PUT /api/user/notifications/[id]/read error:",
      error.message
    );
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
