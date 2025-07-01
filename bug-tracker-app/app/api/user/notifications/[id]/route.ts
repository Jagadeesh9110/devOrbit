import { NextResponse } from "next/server";
import { notificationsController } from "@/controllers/notificationsController";
import { getTokenFromCookies } from "@/lib/auth";

export async function DELETE(
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

    const result = await notificationsController.deleteNotification(
      accessToken,
      id
    );

    return NextResponse.json(
      { success: result.success, data: result.data, error: result.error },
      { status: result.status }
    );
  } catch (error: any) {
    console.error("DELETE /api/user/notifications/[id] error:", error.message);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
