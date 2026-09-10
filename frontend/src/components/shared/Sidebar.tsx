"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, AlertTriangle, BarChart3, BriefcaseBusiness, Database, FileSearch, GitBranch, Menu, Radio, ScanSearch, Share2, Users, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const groups = [
  { label: "Workspace", items: [{ label: "Overview", href: "/", icon: BarChart3 }, { label: "Live intelligence feed", href: "/command-center", icon: Radio }] },
  { label: "Analysis", items: [
    { label: "Entity extraction", href: "/nlp-extraction", icon: ScanSearch },
    { label: "Relationship graph", href: "/cdr-network", icon: Share2 },
    { label: "CDR analysis", href: "/cdr", icon: GitBranch },
    { label: "Financial trail", href: "/financial-intelligence", icon: BriefcaseBusiness },
    { label: "Social media intel", href: "/social-intelligence", icon: Users },
    { label: "Anomaly detection", href: "/anomaly-detection", icon: AlertTriangle },
    { label: "Key-player ranking", href: "/threat-index", icon: Activity },
  ] },
  { label: "Records", items: [{ label: "Dossiers", href: "/dossiers", icon: FileSearch }, { label: "Data ingestion", href: "/data-ingestion", icon: Database }] },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return <>
    <button className="fixed left-3 top-3 z-30 flex size-9 items-center justify-center border border-line bg-white text-ink lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu className="size-4" /></button>
    <aside className={cn("fixed inset-y-0 left-0 z-40 flex w-[238px] -translate-x-full flex-col border-r border-line bg-[#f7f8f7] transition-transform lg:static lg:translate-x-0", open && "translate-x-0")}>
      <div className="flex items-center justify-between border-b border-line px-4 py-4">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="flex size-8 items-center justify-center bg-ink font-mono text-xs font-bold text-white">NX</span>
          <span><span className="block text-[12px] font-bold tracking-[.08em] text-ink">NEXUS</span><span className="block font-mono text-[9px] uppercase tracking-wider text-muted">intelligence platform</span></span>
        </Link>
        <button className="text-muted lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation"><X className="size-4" /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-2.5 py-4">
        {groups.map(group => <div key={group.label} className="mb-5"><p className="mb-2 px-2 font-mono text-[9px] font-bold uppercase tracking-[.18em] text-muted">{group.label}</p><nav className="space-y-0.5">{group.items.map(item => { const Icon = item.icon; const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href); return <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={cn("flex items-center gap-2.5 border-l-2 px-2.5 py-2 text-[11px] font-medium transition-colors", active ? "border-accent bg-[#e9eef1] text-ink" : "border-transparent text-muted hover:border-[#b7c4ca] hover:bg-[#eef1f0] hover:text-ink")}><Icon className="size-3.5" />{item.label}</Link>; })}</nav></div>)}
      </div>
      <div className="border-t border-line p-3"><div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider text-emerald-700"><span className="size-1.5 bg-emerald-600" />System nominal</div><p className="mt-2 font-mono text-[9px] text-muted">8 sources / 0 failed checks</p><p className="mt-1 font-mono text-[9px] text-muted">workspace: NX-26-0910</p></div>
    </aside>
    {open && <button className="fixed inset-0 z-30 bg-ink/20 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation overlay" />}
  </>;
}
