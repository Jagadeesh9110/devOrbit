"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
  src?: string;
  alt?: string;
  className?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
}

export const Avatar = ({
  src,
  alt = "Avatar",
  className,
  fallback,
  size = "md",
}: AvatarProps) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden bg-gray-200 flex items-center justify-center",
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      ) : (
        <span className="font-medium text-gray-600">
          {fallback?.charAt(0).toUpperCase() || "U"}
        </span>
      )}
    </div>
  );
};

export const AvatarFallback = ({ children }: { children: React.ReactNode }) => {
  return <div className="bg-gray-200 rounded-full">{children}</div>;
};

export const AvatarImage = ({ src, alt }: { src: string; alt: string }) => {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, 33vw"
    />
  );
};
