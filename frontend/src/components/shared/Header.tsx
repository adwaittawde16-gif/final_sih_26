"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CircleHelp, Search } from "lucide-react";

export function Header({ title, subtitle, description }: { title: string; subtitle?: string; description?: string }) {
  const [query, setQuery] = useState("");
  const [clock, setClock] = useState("");
  const router = useRouter();

  useEffect(() => {
    const tick = () =>
      setClock(
        new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Kolkata",
        }).format(new Date())
      );
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/dossiers?search=${encodeURIComponent(query.trim())}`);
  };

  const displaySubtitle = subtitle || description;

  return (
    <header className="border-b border-line bg-white">
      <div className="flex min-h-[62px] items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <div className="pl-12 lg:pl-0">
          <p className="font-mono text-[9px] font-bold uppercase tracking-[.2em] text-accent">Workspace / command view</p>
          <h1 className="mt-1 text-[17px] font-semibold tracking-tight text-ink">{title}</h1>
          {displaySubtitle && <p className="mt-0.5 hidden text-[11px] text-muted md:block">{displaySubtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <form onSubmit={submit} className="relative hidden xl:block">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search entities, IDs, locations"
              className="h-8 w-56 border border-line bg-[#fafbfa] pl-8 pr-2 font-mono text-[10px] text-ink outline-none focus:border-accent"
            />
          </form>
          <div className="hidden items-center gap-2 border-l border-line pl-3 font-mono text-[10px] text-muted sm:flex">
            <span className="size-1.5 bg-emerald-600" />
            LIVE <span className="text-ink">{clock} IST</span>
          </div>
          <button className="relative flex size-8 items-center justify-center border border-line text-muted hover:text-ink" aria-label="Notifications">
            <Bell className="size-3.5" />
            <span className="absolute right-1.5 top-1.5 size-1.5 bg-accent" />
          </button>
          <button className="hidden size-8 items-center justify-center border border-line text-muted hover:text-ink sm:flex" aria-label="Help">
            <CircleHelp className="size-3.5" />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-line bg-[#fafbfa] px-4 py-1.5 font-mono text-[9px] uppercase tracking-wider text-muted lg:px-6">
        <span>Environment: synthetic data</span>
        <span>Last sync: 18:42:16</span>
        <span className="text-emerald-700">● 8 / 8 data sources operational</span>
        <span className="ml-auto hidden md:inline">Analyst session · NX-04</span>
      </div>
    </header>
  );
}
