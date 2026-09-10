"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Bell, CalendarDays, Search, SlidersHorizontal } from "lucide-react";

export function Header({ title, subtitle, description }: { title: string; subtitle?: string; description?: string }) {
  const displaySubtitle = subtitle || description;
  const [query, setQuery] = useState("");
  const router = useRouter();
  const handleSearch = (event: FormEvent) => { event.preventDefault(); if (query.trim()) router.push(`/dossiers?search=${encodeURIComponent(query.trim())}`); };
  return (
    <header className="mb-5 flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="pl-12 lg:pl-0">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded border border-blue-200 bg-blue-50 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-blue-700">SIH 2026 · Restricted</span>
          <span className="hidden font-mono text-[10px] text-slate-400 sm:inline">/ command operations</span>
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-950 md:text-2xl">{title}</h1>
        {displaySubtitle && <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">{displaySubtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <form onSubmit={handleSearch} className="relative min-w-0 flex-1 sm:flex-none">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
          <input aria-label="Search subjects, FIRs, or locations" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search subjects, FIRs, locations" className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 font-mono text-[11px] text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-400 focus:outline-none sm:w-64" />
        </form>
        <button className="hidden size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm hover:text-slate-900 sm:flex" aria-label="Filter workspace">
          <SlidersHorizontal className="size-4" />
        </button>
        <button className="relative flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm hover:text-slate-900" aria-label="Notifications">
          <Bell className="size-4" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-red-500" />
        </button>
        <div className="hidden items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-semibold text-emerald-700 md:flex">
          <Activity className="size-3.5" /> Connected
        </div>
        <div className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-[10px] text-slate-500 xl:flex">
          <CalendarDays className="size-3.5" /> 07 Sep 2026
        </div>
      </div>
    </header>
  );
}

