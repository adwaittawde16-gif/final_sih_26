"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useNav } from "./NavContext";
import { useTheme } from "./ThemeContext";
import {
  Menu,
  ChevronRight,
  Search,
  Activity,
  Clock,
  Sparkles,
  Shield,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon
} from "lucide-react";

const ROUTE_NAMES: Record<string, string> = {
  "/": "Command center",
  "/threat": "Module 1 — Suspect threat index",
  "/cdr": "Module 2 — CDR network graph & forensics",
  "/cctv": "Module 3 — CCTV co-location encounters",
  "/gangs": "Module 4 — Gangs & crime syndicates",
  "/crime-rings": "Module 4 & 5 — Crime rings detection",
  "/financial": "Module 5 — Financial & PMLA forensics",
  "/nocturnal": "Module 6 — Nocturnal calling anomalies",
  "/surveillance": "Module 7 — Field surveillance & heatmaps",
  "/dossiers": "Module 8 — Suspect dossier generator",
  "/social-media": "Module 9 — Social media intelligence",
  "/criminal-history": "Module 10 — Master criminal history register",
  "/architecture": "System architecture & flowchart",
};

export function TacticalCommandBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleMobile, isCollapsed, toggleCollapse } = useNav();
  const { theme, toggleTheme } = useTheme();

  const [timeStr, setTimeStr] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      setTimeStr(`${now.toLocaleTimeString("en-GB", options)} IST`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dossiers?suspect=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const currentTitle = ROUTE_NAMES[pathname] || "Intelligence ops";

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--bg)]/90 backdrop-blur-md border-b border-[var(--border)] px-4 py-2 flex items-center justify-between gap-4 font-sans transition-colors">
      {/* Left section: Mobile Hamburger + Desktop Collapse + Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={toggleMobile}
          className="lg:hidden p-1.5 rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex p-1.5 rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-blue-500" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-[var(--text-muted)]" />
          )}
        </button>

        {/* Breadcrumb Path */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-[var(--text-muted)] font-medium hidden sm:flex">
            <Shield className="w-3.5 h-3.5 text-blue-500" />
            <span>Intel Ops</span>
            <ChevronRight className="w-3 h-3 text-[var(--text-muted)] opacity-60" />
          </div>
          <span className="text-[var(--text)] font-medium truncate max-w-[200px] sm:max-w-none">
            {currentTitle}
          </span>
        </div>
      </div>

      {/* Center & Right section: Search bar + Theme Toggle + Status + Clock */}
      <div className="flex items-center gap-2.5">
        {/* Quick Global Suspect Search Bar */}
        <form onSubmit={handleSearch} className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search suspect, FIR..."
            className="w-48 lg:w-60 bg-[var(--surface)] border border-[var(--border)] rounded-md pl-8 pr-3 py-1 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-blue-500 font-sans"
          />
        </form>

        {/* Theme Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Live IST Digital Clock */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] text-[11px] font-mono">
          <Clock className="w-3 h-3 text-[var(--text-muted)]" />
          <span>{timeStr || "18:30:00 IST"}</span>
        </div>

        {/* Telemetry Live Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] text-[11px] font-sans">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="hidden sm:inline">Live telemetry</span>
        </div>
      </div>
    </header>
  );
}
