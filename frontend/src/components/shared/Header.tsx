"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Activity } from "lucide-react";

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/dossiers?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-300 mb-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono font-bold text-blue-800 uppercase tracking-widest bg-blue-100 px-2 py-0.5 rounded border border-blue-300">
            SIH 2026 Tactical Intelligence Platform
          </span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 font-sans">{title}</h1>
        {subtitle && <p className="text-xs text-slate-600 mt-0.5 font-sans">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <form onSubmit={handleSearch} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search suspect, FIR, location..."
            className="w-64 md:w-80 bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 font-mono transition-colors shadow-sm"
          />
        </form>

        <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold">
          <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
          <span>API Connected</span>
        </div>
      </div>
    </header>
  );
}
