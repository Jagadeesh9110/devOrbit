import { NextResponse } from "next/server";
import { getTokenFromCookies, verifyEdgeToken } from "@/lib/edge-auth";
import type { NextRequest } from "next/server";
import User from "@/models/userModel";
import ConnectDB from "@/lib/db/Connect";
import { deleteImage, extractPublicId } from "@/lib/cloudinary";

export async function PUT(request: NextRequest) {
  try {
    await ConnectDB();
    const { accessToken } = getTokenFromCookies(request);

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyEdgeToken(accessToken);
    const { image } = await request.json();

    const currentUser = await User.findById(payload.userId);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (currentUser.image) {
      const publicId = extractPublicId(currentUser.image);
      if (publicId) {
        await deleteImage(publicId).catch((err) =>
          console.error("Failed to delete old image:", err)
        );
      }
    }

    const user = await User.findByIdAndUpdate(
      payload.userId,
      { image },
      { new: true }
    ).select(
      "-password -verificationToken -verificationTokenExpiry -resetToken -resetTokenExpiry"
    );

    return NextResponse.json(user);
  } catch (error) {
    console.error("Avatar update error:", error);
    return NextResponse.json(
      { error: "Failed to update avatar" },
      { status: 500 }
    );
  }
}
