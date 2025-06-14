"use client";

import { CldUploadWidget } from "next-cloudinary";
import { CldImage } from "next-cloudinary";
import { Button } from "./Button";

interface AvatarUploadProps {
  value: string;
  onChange: (url: string, publicId: string) => void;
  disabled?: boolean;
}

export const AvatarUpload = ({
  value,
  onChange,
  disabled = false,
}: AvatarUploadProps) => {
  return (
    <div className="space-y-4">
      <div className="relative h-32 w-32 rounded-full overflow-hidden border">
        {value ? (
          <CldImage
            fill
            src={value}
            alt="Avatar"
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="h-full w-full bg-gray-200" />
        )}
      </div>

      <CldUploadWidget
        uploadPreset="user_avatars"
        options={{
          maxFiles: 1,
          resourceType: "image",
          cropping: true,
          croppingAspectRatio: 1,
          croppingDefaultSelectionRatio: 1,
          showSkipCropButton: false,
          sources: ["local", "camera"],
          multiple: false,
          clientAllowedFormats: ["jpg", "png", "webp"],
          maxFileSize: 5000000,
        }}
        onSuccess={(result: any) => {
          onChange(result.info.secure_url, result.info.public_id);
        }}
      >
        {({ open }) => (
          <Button
            type="button"
            variant="outline"
            onClick={() => open()}
            disabled={disabled}
          >
            {value ? "Change Avatar" : "Upload Avatar"}
          </Button>
        )}
      </CldUploadWidget>
    </div>
  );
};
