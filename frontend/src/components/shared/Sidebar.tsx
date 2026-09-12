"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  Flame,
  Network,
  Camera,
  Layers,
  Banknote,
  Moon,
  Eye,
  FileText,
  Radio
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Command Center", href: "/", icon: ShieldAlert },
  { label: "1. Suspect Threat Index", href: "/threat", icon: Flame },
  { label: "2. CDR Network Graph", href: "/cdr", icon: Network },
  { label: "3. CCTV Co-Location", href: "/cctv", icon: Camera },
  { label: "4. Gangs & Syndicates", href: "/gangs", icon: Layers },
  { label: "5. Financial Intelligence", href: "/financial", icon: Banknote },
  { label: "6. Nocturnal Anomalies", href: "/nocturnal", icon: Moon },
  { label: "7. Field Surveillance", href: "/surveillance", icon: Eye },
  { label: "8. Suspect Dossiers", href: "/dossiers", icon: FileText },
  { label: "9. Social Media Intel", href: "/social-media", icon: Radio },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 border-r border-slate-800 min-h-screen flex flex-col justify-between p-4 shrink-0 shadow-lg">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-blue-600 border border-blue-500 flex items-center justify-center text-white font-mono font-bold text-sm shadow">
            BP
          </div>
          <div>
            <h1 className="font-bold text-xs text-white uppercase tracking-wider font-sans">Brihanmumbai Police</h1>
            <p className="text-[10px] font-mono text-slate-400 tracking-tight">Special Crime Analysis Unit</p>
          </div>
        </div>

        {/* Navigation Label */}
        <div className="px-2 mb-2">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
            Intelligence Modules
          </span>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-mono transition-all group",
                  isActive
                    ? "bg-blue-600 text-white font-bold shadow"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 transition-transform group-hover:scale-110",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                  )}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* System Live Status */}
      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 mt-6">
        <div className="flex items-center gap-2 mb-1">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-wider uppercase">
            System Live
          </span>
        </div>
        <p className="text-[11px] text-slate-300 font-sans leading-tight">
          Restricted Command Feeds Active
        </p>
        <p className="text-[9px] font-mono text-slate-500 mt-2">
          07 SEP 2026 · 18:42 IST
        </p>
      </div>
    </aside>
  );
}
