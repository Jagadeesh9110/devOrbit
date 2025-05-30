"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Skeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "animate-pulse rounded-md bg-gray-100 dark:bg-gray-800",
      className
    )}
    {...props}
  />
);

export { Skeleton };
