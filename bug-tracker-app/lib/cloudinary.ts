import { v2 as cloudinary } from "cloudinary";

cloudinary.config();

export async function uploadImage(
  file: Buffer,
  userId: string,
  options: Record<string, any> = {}
) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_FOLDER,
        public_id: `user_${userId}`,
        overwrite: true,
        transformation: [
          { width: 500, height: 500, crop: "fill", gravity: "face" },
          { quality: "auto", fetch_format: "auto" },
        ],
        ...options,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    uploadStream.end(file);
  });
}

export async function deleteImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}

export function extractPublicId(url: string): string | null {
  const matches = url.match(/upload\/(?:v\d+\/)?([^/]+)/);
  return matches ? matches[1].split(".")[0] : null;
}
