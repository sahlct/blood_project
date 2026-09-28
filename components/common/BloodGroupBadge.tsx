import React from "react";
import { cn } from "@/lib/utils";
import { Droplet } from "lucide-react";

interface BloodGroupBadgeProps {
  group: string;
  size?: "sm" | "md" | "lg" | "xl";
  showIcon?: boolean;
  className?: string;
}

export function BloodGroupBadge({
  group,
  size = "md",
  showIcon = true,
  className,
}: BloodGroupBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-bold gap-1",
    md: "px-3 py-1 text-sm font-black gap-1.5",
    lg: "px-4 py-2 text-lg font-black gap-2",
    xl: "px-5 py-3 text-2xl font-black gap-2.5",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
    xl: "w-7 h-7",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xl font-mono shadow-xs border transition-all",
        "bg-gradient-to-br from-red-500/10 via-rose-50 to-red-50 border-red-200 text-red-700",
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Droplet className={cn(iconSizes[size], "fill-red-600 text-red-600 shrink-0")} />}
      <span>{group}</span>
    </span>
  );
}
