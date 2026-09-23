"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNav } from "./NavContext";
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
  Radio,
  Gavel,
  X,
  Zap,
  Workflow,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Mission command", href: "/", icon: ShieldAlert },
  { label: "1. Suspect threat index", href: "/threat", icon: Flame },
  { label: "2. CDR network graph", href: "/cdr", icon: Network },
  { label: "3. CCTV co-location", href: "/cctv", icon: Camera },
  { label: "4. Gangs & syndicates", href: "/gangs", icon: Layers },
  { label: "5. Financial & PMLA", href: "/financial", icon: Banknote },
  { label: "6. Nocturnal calling", href: "/nocturnal", icon: Moon },
  { label: "7. Field surveillance", href: "/surveillance", icon: Eye },
  { label: "8. Suspect dossiers", href: "/dossiers", icon: FileText },
  { label: "9. Social media intel", href: "/social-media", icon: Radio },
  { label: "10. Criminal history", href: "/criminal-history", icon: Gavel },
  { label: "System architecture", href: "/architecture", icon: Workflow },
];

export const TOTAL_MODULES = NAV_ITEMS.filter((item) => item.href !== "/").length;

export function Sidebar() {
  const pathname = usePathname();
  const { isMobileOpen, setIsMobileOpen, isCollapsed } = useNav();

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname, setIsMobileOpen]);

  return (
    <>
      {/* ── Mobile Backdrop Overlay ── */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* ── Sidebar Container ── */}
      <aside
        className={cn(
          "bg-[var(--bg)] text-[var(--text)] border-r border-[var(--border)] flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out font-sans z-50",
          // Mobile state
          "fixed inset-y-0 left-0 lg:static",
          isMobileOpen ? "translate-x-0 w-72 p-4" : "-translate-x-full lg:translate-x-0",
          // Desktop state
          !isMobileOpen && (isCollapsed ? "lg:w-20 lg:p-3" : "lg:w-64 lg:p-4")
        )}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Brand Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--border)]">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--text)] font-sans font-bold text-xs group-hover:border-blue-500/50 transition-colors">
                  SID
                </div>
                {(!isCollapsed || isMobileOpen) && (
                  <div className="transition-opacity duration-200">
                    <h1 className="font-bold text-xs text-[var(--text)] uppercase tracking-wider font-sans">
                      Special Intel Division
                    </h1>
                    <p className="text-[10px] text-[var(--text-muted)] font-sans">
                      Intel Ops Mesh
                    </p>
                  </div>
                )}
              </Link>

              {/* Mobile Close Button */}
              <button
                onClick={() => setIsMobileOpen(false)}
                className="lg:hidden p-1.5 rounded-lg bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Header Label */}
            {(!isCollapsed || isMobileOpen) && (
              <div className="px-2 mb-2 flex items-center justify-between">
                <span className="text-[10px] font-sans font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Modules
                </span>
                <span className="text-[9px] font-mono text-[var(--text-muted)] bg-[var(--surface-2)] px-1.5 py-0.5 rounded border border-[var(--border)]">
                  {TOTAL_MODULES} ENGINES
                </span>
              </div>
            )}

            {/* Navigation List */}
            <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-260px)] pr-0.5 no-scrollbar">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed && !isMobileOpen ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg text-xs font-sans transition-all group relative",
                      isCollapsed && !isMobileOpen
                        ? "justify-center p-2.5"
                        : "px-3 py-2.5 justify-between",
                      isActive
                        ? "bg-[var(--surface-2)] text-[var(--text)] font-semibold border-l-2 border-l-blue-500 border-t border-r border-b border-[var(--border)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] border border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={cn(
                          "w-4 h-4 shrink-0 transition-colors",
                          isActive ? "text-blue-500" : "text-[var(--text-muted)] group-hover:text-[var(--text)]"
                        )}
                      />
                      {(!isCollapsed || isMobileOpen) && (
                        <span className="truncate font-medium">{item.label}</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* System Live Status Card */}
          {(!isCollapsed || isMobileOpen) ? (
            <div className="p-3 bg-[var(--surface)] rounded-lg border border-[var(--border)] mt-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-sans font-semibold text-[var(--text)] tracking-wider uppercase">
                    System operational
                  </span>
                </div>
                <Zap className="w-3 h-3 text-[var(--text-muted)]" />
              </div>
              <p className="text-[11px] text-[var(--text-muted)] font-sans leading-tight">
                NetSentinel v2.4 Security Mesh Active
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] mt-4 text-emerald-400" title="System Live">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
