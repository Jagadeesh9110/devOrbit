export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db/Connect";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  await connectDB();
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = verifyToken(token);

    // Add null check for payload
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const data = await request.formData();
    const file = data.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to buffer for Cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: process.env.CLOUDINARY_FOLDER || "avatars",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer); // Use buffer instead of file
    });

    const imageUrl = (result as { secure_url: string }).secure_url;

    const user = await User.findByIdAndUpdate(
      payload.userId,
      { image: imageUrl },
      { new: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Avatar updated", imageUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error uploading avatar" },
      { status: 500 }
    );
  }
}
