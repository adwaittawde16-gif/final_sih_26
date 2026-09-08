import React from "react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  label: string;
  value: string | number;
  subtext?: string;
  accent?: "blue" | "red" | "amber" | "green" | "cyan" | "purple" | "indigo" | "emerald";
  icon?: React.ComponentType<{ className?: string }>;
}

export function KPICard({ label, value, subtext, accent = "blue", icon: Icon }: KPICardProps) {
  const accents = {
    blue: "text-blue-700 border-blue-200 bg-blue-50/50",
    red: "text-red-700 border-red-200 bg-red-50/50",
    amber: "text-amber-700 border-amber-200 bg-amber-50/50",
    green: "text-emerald-700 border-emerald-200 bg-emerald-50/50",
    emerald: "text-emerald-700 border-emerald-200 bg-emerald-50/50",
    cyan: "text-cyan-700 border-cyan-200 bg-cyan-50/50",
    purple: "text-purple-700 border-purple-200 bg-purple-50/50",
    indigo: "text-indigo-700 border-indigo-200 bg-indigo-50/50"
  };

  return (
    <div className={cn("p-4 rounded-xl border bg-white shadow-sm transition-all hover:border-slate-400", accents[accent])}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">{label}</span>
        {Icon && <Icon className={cn("w-4 h-4", accents[accent].split(" ")[0])} />}
      </div>
      <div className={cn("text-2xl font-bold font-mono mt-2", accents[accent].split(" ")[0])}>
        {value}
      </div>
      {subtext && <p className="text-[10px] text-slate-500 font-mono mt-1">{subtext}</p>}
    </div>
  );
}
