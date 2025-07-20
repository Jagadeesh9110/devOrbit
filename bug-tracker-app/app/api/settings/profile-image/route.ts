export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { settingsController } from "@/controllers/settingsController";

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await settingsController.uploadProfileImage(
    accessToken,
    buffer
  );
  return NextResponse.json(
    { success: result.success, data: result.data, error: result.error },
    { status: result.status }
  );
}
