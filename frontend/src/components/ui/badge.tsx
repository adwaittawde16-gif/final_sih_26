import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "critical" | "high" | "moderate" | "low" | "cyan" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-800 border-slate-300 font-bold",
    critical: "bg-red-100 text-red-700 border-red-300 font-bold tracking-wide",
    high: "bg-amber-100 text-amber-800 border-amber-300 font-bold",
    moderate: "bg-yellow-100 text-yellow-800 border-yellow-300 font-bold",
    low: "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold",
    cyan: "bg-cyan-100 text-cyan-800 border-cyan-300 font-bold",
    outline: "bg-transparent text-slate-700 border-slate-300 font-medium"
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-mono font-semibold transition-colors focus:outline-none",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
