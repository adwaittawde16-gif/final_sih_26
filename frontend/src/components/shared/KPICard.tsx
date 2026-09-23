"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Maximize2, Minimize2 } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string | number;
  subtext?: string;
  accent?: "blue" | "red" | "amber" | "green" | "cyan" | "purple" | "indigo" | "emerald";
  icon?: React.ComponentType<{ className?: string }>;
}

export function KPICard({ label, value, subtext, accent = "blue", icon: Icon }: KPICardProps) {
  const [isSelected, setIsSelected] = useState(false);

  const valueStr = String(value);

  // Dynamic text size scaling
  const valueSizeClass =
    valueStr.length > 14
      ? "text-base sm:text-lg lg:text-xl"
      : valueStr.length > 9
      ? "text-lg sm:text-xl lg:text-2xl"
      : "text-2xl sm:text-3xl";

  const isCritical = accent === "red";

  return (
    <div
      onClick={() => setIsSelected(!isSelected)}
      title={isSelected ? "Selected. Click to collapse." : "Click to select card"}
      className={cn(
        "p-4 rounded-lg border transition-colors min-w-0 max-w-full cursor-pointer select-none font-sans",
        isSelected
          ? "bg-[var(--surface-2)] border-blue-500"
          : "bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--surface-2)]"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "text-xs font-sans text-[var(--text-muted)] font-medium",
            isSelected ? "break-words whitespace-normal text-[var(--text)]" : "truncate"
          )}
        >
          {label}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {Icon && (
            <div className="p-1.5 rounded-md shrink-0 bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-muted)]">
              <Icon className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      </div>

      <div
        className={cn(
          "font-bold font-mono mt-2 tracking-tight tabular-nums",
          isCritical ? "text-[var(--danger)]" : "text-[var(--text)]",
          isSelected
            ? "whitespace-normal break-all text-xl sm:text-2xl"
            : cn("truncate max-w-full block", valueSizeClass)
        )}
      >
        {value}
      </div>

      {subtext && (
        <p
          className={cn(
            "text-[11px] text-[var(--text-muted)] font-sans mt-1.5 flex items-center gap-1.5",
            isSelected ? "whitespace-normal break-words text-[var(--text)]" : "truncate"
          )}
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] shrink-0 opacity-60" />
          <span className={isSelected ? "break-words" : "truncate"}>{subtext}</span>
        </p>
      )}
    </div>
  );
}
