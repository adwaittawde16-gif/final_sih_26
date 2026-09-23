"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Activity, ShieldAlert, Sparkles } from "lucide-react";

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/dossiers?suspect=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border)] mb-4 font-sans transition-colors">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-sans font-semibold text-[var(--text-muted)] uppercase tracking-wider bg-[var(--surface-2)] px-2 py-0.5 rounded border border-[var(--border)] flex items-center gap-1.5">
            <ShieldAlert className="w-3 h-3 text-blue-500" />
            NetSentinel // Intel Ops
          </span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--text)] font-sans">{title}</h1>
        {subtitle && <p className="text-xs text-[var(--text-muted)] mt-0.5 font-sans font-normal">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <form onSubmit={handleSearch} className="relative">
          <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search suspect, FIR, location..."
            className="w-full md:w-72 bg-[var(--surface)] border border-[var(--border)] rounded-md pl-8 pr-3 py-1.5 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-blue-500 font-sans"
          />
        </form>

        <div className="hidden sm:flex items-center gap-1.5 bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] px-3 py-1.5 rounded-md text-xs font-sans">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>API Connected</span>
        </div>
      </div>
    </header>
  );
}

