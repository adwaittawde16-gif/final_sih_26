"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Banknote,
  Camera,
  Eye,
  FileText,
  Flame,
  Layers3,
  Menu,
  Moon,
  Network,
  Radio,
  Shield,
  ShieldCheck,
  UploadCloud,
  Zap,
  Cpu,
  Sparkles,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const groups = [
  {
    label: "Overview",
    items: [{ label: "Command center", href: "/", icon: Shield }]
  },
  {
    label: "Core AI & ML Engine",
    items: [
      { label: "NLP Entity Extraction", href: "/nlp-extraction", icon: Cpu },
      { label: "Graph Algorithm Proofs", href: "/graph-algorithms", icon: Network },
      { label: "Multi-Source Ingestion", href: "/data-ingestion", icon: UploadCloud },
      { label: "Statistical Anomalies", href: "/anomaly-detection", icon: Activity },
      { label: "Explainable AI (XAI)", href: "/explainability", icon: Sparkles },
      { label: "RBAC & Forensic Audit", href: "/access-control", icon: ShieldCheck },
      { label: "Scalability Benchmark", href: "/scalability-benchmark", icon: Zap }
    ]
  },
  {
    label: "Intelligence modules",
    items: [
      { label: "Threat index", href: "/threat-index", icon: Flame },
      { label: "CDR network", href: "/cdr-network", icon: Network },
      { label: "CCTV co-location", href: "/cctv-colocation", icon: Camera },
      { label: "Syndicates", href: "/syndicates", icon: Layers3 },
      { label: "Financial intelligence", href: "/financial-intelligence", icon: Banknote },
      { label: "Nocturnal anomalies", href: "/nocturnal-anomalies", icon: Moon }
    ]
  },
  {
    label: "Field operations",
    items: [
      { label: "Field surveillance", href: "/field-surveillance", icon: Eye },
      { label: "Subject dossiers", href: "/dossiers", icon: FileText },
      { label: "Social intelligence", href: "/social-intelligence", icon: Radio }
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="fixed left-3 top-3 z-30 flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="size-4" />
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 -translate-x-full flex-col border-r border-slate-800 bg-slate-950 text-white transition-transform lg:static lg:translate-x-0",
          open && "translate-x-0"
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600 font-mono text-sm font-bold shadow-lg shadow-blue-950/40">
              BP
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider">Brihanmumbai Police</p>
              <p className="mt-0.5 font-mono text-[9px] text-slate-400">Special Crime Analysis Unit</p>
            </div>
          </div>
          <button className="text-slate-400 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation">
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5">
          {groups.map((group) => (
            <div key={group.label} className="mb-6">
              <p className="mb-2 px-3 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
                {group.label}
              </p>
              <nav className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition",
                        active
                          ? "bg-blue-600 text-white shadow-md shadow-blue-950/30"
                          : "text-slate-400 hover:bg-slate-900 hover:text-white"
                      )}
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="m-3 rounded-xl border border-slate-800 bg-slate-900 p-3">
          <div className="flex items-center gap-2">
            <Activity className="size-3.5 text-emerald-400" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-400">System live</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Restricted command feeds active</p>
          <p className="mt-3 font-mono text-[9px] text-slate-600">08 SEP 2026 · 22:55 IST</p>
        </div>
      </aside>

      {open && (
        <button
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close navigation overlay"
        />
      )}
    </>
  );
}
