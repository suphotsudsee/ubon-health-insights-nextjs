"use client";

import { cn } from "@/lib/utils";
import { getStatusInfo } from "@/lib/dashboard-utils";

interface StatusBadgeProps {
  percentage: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ percentage, showLabel = true, size = "md" }: StatusBadgeProps) {
  const status = getStatusInfo(percentage);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-3 py-1 text-sm",
        size === "lg" && "px-4 py-1.5 text-base",
        status.bgClass,
        percentage <= 60 && percentage > 40 ? "text-foreground" : "text-white"
      )}
    >
      <span>{status.emoji}</span>
      {showLabel && <span>{percentage}% {status.label}</span>}
      {!showLabel && <span>{percentage}%</span>}
    </span>
  );
}
