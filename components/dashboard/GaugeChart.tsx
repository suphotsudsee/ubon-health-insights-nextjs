"use client";

import { getStatusInfo } from "@/lib/dashboard-utils";

interface GaugeChartProps {
  value: number;
  label: string;
  maxValue?: number;
}

export function GaugeChart({ value, label, maxValue = 100 }: GaugeChartProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const status = getStatusInfo(percentage);
  
  // Calculate the stroke dash for the arc
  const radius = 70;
  const circumference = Math.PI * radius; // Half circle
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="180" height="100" viewBox="0 0 180 100">
          {/* Background arc */}
          <path
            d="M 10 90 A 70 70 0 0 1 170 90"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Value arc */}
          <path
            d="M 10 90 A 70 70 0 0 1 170 90"
            fill="none"
            stroke={`hsl(var(--${status.color.replace('status-', 'status-')}))`}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            style={{
              stroke: percentage <= 20 ? 'hsl(var(--status-critical))' :
                      percentage <= 40 ? 'hsl(var(--status-low))' :
                      percentage <= 60 ? 'hsl(var(--status-medium))' :
                      percentage <= 80 ? 'hsl(var(--status-good))' :
                      'hsl(var(--status-excellent))'
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <span className="text-3xl font-bold">{Math.round(percentage)}%</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-muted-foreground text-center">
        {label}
      </span>
      <span className={`mt-1 text-xs font-medium ${status.bgClass} px-2 py-0.5 rounded-full ${percentage <= 60 && percentage > 40 ? 'text-foreground' : 'text-white'}`}>
        {status.emoji} {status.label}
      </span>
    </div>
  );
}
