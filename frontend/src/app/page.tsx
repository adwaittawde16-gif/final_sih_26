"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/shared/Header";
import { KPICard } from "@/components/shared/KPICard";
import { LoadingSpinner, ErrorState } from "@/components/ui/loading";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { ThreatLeaderboardResponse, AlertsResponse, CrimeRingsResponse, CCTVMeetingsResponse, NocturnalAnomaliesResponse } from "@/types";
import {
  Flame,
  Network,
  Camera,
  Layers,
  Banknote,
  Moon,
  Eye,
  FileText,
  ArrowRight,
  ShieldAlert,
  Radio,
  BookOpen,
  Bell,
  Activity,
  Cpu,
  Fingerprint
} from "lucide-react";

export default function CommandCenterPage() {
  const [data, setData] = useState<ThreatLeaderboardResponse | null>(null);
  const [alerts, setAlerts] = useState<AlertsResponse | null>(null);
  const [rings, setRings] = useState<CrimeRingsResponse | null>(null);
  const [cctv, setCctv] = useState<CCTVMeetingsResponse | null>(null);
  const [nocturnal, setNocturnal] = useState<NocturnalAnomaliesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [boardRes, alertRes, ringsRes, cctvRes, noctRes] = await Promise.all([
          api.getThreatLeaderboard(),
          api.getAlerts(),
          api.getCrimeRings(),
          api.getCCTVMeetings(),
          api.getNocturnalAnomalies(),
        ]);
        setData(boardRes);
        setAlerts(alertRes);
        setRings(ringsRes);
        setCctv(cctvRes);
        setNocturnal(noctRes);
      } catch (err: any) {
        setError(err.message || "Failed to connect to Python FastAPI backend");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <LoadingSpinner label="Connecting to Tactical Intelligence Backend..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const topSuspect = data?.leaderboard?.[0];
  const criticalCount = data?.critical_count ?? 0;
  const highCount = data?.high_count ?? 0;
  const totalSuspects = data?.total_suspects ?? data?.leaderboard?.length ?? 0;

  const modules = [
    {
      title: "1. Suspect threat index",
      badge: "Algorithmic Risk",
      desc: "Composite 0-100 suspect risk ranking with real-time heuristic weight simulator.",
      href: "/threat",
      icon: Flame,
    },
    {
      title: "2. CDR network graph",
      badge: "Pairwise Mesh",
      desc: "Interactive force-directed graph, dynamic suspect pairs, and cell tower hops.",
      href: "/cdr",
      icon: Network,
    },
    {
      title: "3. CCTV co-location",
      badge: "Optical Match",
      desc: "Camera sighting timeline, spatial proximity clusters, and multi-cam cross-tracking.",
      href: "/cctv",
      icon: Camera,
    },
    {
      title: "4. Crime syndicates",
      badge: "Graph Partition",
      desc: "Community clustering, underworld hierarchy, and syndicate rings.",
      href: "/crime-rings",
      icon: Layers,
    },
    {
      title: "5. Financial intelligence",
      badge: "UPI & Hawala",
      desc: "UPI money trails, mule network flow graphs, merchant flags, and volume spikes.",
      href: "/financial",
      icon: Banknote,
    },
    {
      title: "6. Nocturnal anomalies",
      badge: "00:00 - 06:00 IST",
      desc: "Off-hours burner phone spikes, late-night cell tower bursts, and anomalous traffic.",
      href: "/nocturnal",
      icon: Moon,
    },
    {
      title: "7. Field surveillance",
      badge: "Ground Intel",
      desc: "Officer field reconnaissance logs, geo-tagged spot checks, and density heatmaps.",
      href: "/surveillance",
      icon: Eye,
    },
    {
      title: "8. Master criminal history",
      badge: "Statutory Record",
      desc: "Statutory MCOCA, NDPS, PMLA, Arms Act records, and Modus Operandi.",
      href: "/criminal-history",
      icon: BookOpen,
    },
    {
      title: "9. 360° Suspect dossiers",
      badge: "Intel Synthesis",
      desc: "Full suspect profile aggregation, CDR timeline, financial history, and dossier export.",
      href: "/dossiers",
      icon: FileText,
    },
    {
      title: "10. Live alerts & telemetry",
      badge: "Early Warning",
      desc: "Automated trigger engine flagging simultaneous burner calls, border hops, and transfers.",
      href: "/alerts",
      icon: Bell,
    }
  ];

  return (
    <div className="space-y-6 pb-24 font-sans">
      {/* System Status Ticker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs font-sans text-[var(--text)] transition-colors">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="font-medium text-[var(--text)]">System status: all {modules.length} engines online</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-sans text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5 text-[var(--danger)] font-medium">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="font-mono">{criticalCount}</span> critical alerts
          </div>
          <div className="flex items-center gap-1.5 text-[var(--warn)] font-medium">
            <Activity className="w-3.5 h-3.5" />
            <span className="font-mono">{highCount}</span> high risk
          </div>
          <div className="flex items-center gap-1.5 text-[var(--text)]">
            <Cpu className="w-3.5 h-3.5 text-blue-500" />
            <span>AI heuristic engine active</span>
          </div>
        </div>
      </div>

      <Header
        title="Command center"
        subtitle="Unified suspect risk scoring, CDR pairwise graph analysis, optical CCTV tracking, and financial intelligence."
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard label="Suspects profiled" value={totalSuspects} accent="blue" icon={Flame} subtext="Active surveillance mesh" />
        <KPICard label="Active crime rings" value={rings?.total_rings ?? "—"} accent="purple" icon={Layers} subtext="Syndicate clusters detected" />
        <KPICard label="Critical risk tiers" value={criticalCount} accent="red" icon={ShieldAlert} subtext="Requires immediate warrant" />
        <KPICard label="CCTV encounters" value={cctv?.total_encounters ?? "—"} accent="amber" icon={Camera} subtext={`${cctv?.avg_confidence_pct ?? 0}% avg match confidence`} />
        <KPICard label="Night hotspots" value={nocturnal?.hotspots_count ?? "—"} accent="cyan" icon={Moon} subtext={`${nocturnal?.total_anomalies ?? 0} nocturnal anomalies`} />
      </div>

      {/* Priority Top Suspect Alert Card */}
      {topSuspect && (
        <div className="p-5 rounded-lg border border-[var(--border)] border-l-4 border-l-red-600 bg-[var(--surface)] transition-colors">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-red-950/20 text-red-500 border border-red-800/40">
                  Critical threat priority · Red notice
                </span>
                <span className="text-xs font-sans text-[var(--text-muted)]">Syndicate lead: Ring-01</span>
                <span className="text-xs text-[var(--text-muted)]">·</span>
                <span className="text-xs font-mono text-[var(--text-muted)]">MOB #MB-101</span>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)] flex items-center gap-2 font-sans">
                  <Fingerprint className="w-5 h-5 text-red-500" />
                  {topSuspect.suspect_name}
                </h2>
                <p className="text-xs font-sans text-[var(--text-muted)] mt-1">
                  MSISDN: <span className="font-mono text-[var(--text)] font-bold">{topSuspect.phone_number || "N/A"}</span> · Threat score:{" "}
                  <span className="font-mono text-red-500 font-bold">{(topSuspect.total_threat_score ?? 0).toFixed(1)}/100</span> (Rank #1)
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 font-sans">
              <Link
                href={`/cdr?suspectA=${encodeURIComponent(topSuspect.phone_number)}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[var(--surface-2)] text-[var(--text)] text-xs font-medium rounded-md border border-[var(--border)] hover:border-blue-500 transition-colors"
              >
                <Network className="w-3.5 h-3.5 text-blue-500" />
                Inspect CDR mesh
              </Link>
              <Link
                href={`/dossiers?suspect=${encodeURIComponent(topSuspect.suspect_name)}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-medium text-xs rounded-md transition-colors"
              >
                <FileText className="w-4 h-4" />
                Open 360° suspect dossier
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Intelligence Engines Grid */}
      <div className="space-y-4 font-sans">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-500" />
            <h3 className="text-xs font-sans font-bold text-[var(--text)] uppercase tracking-wider">
              Intelligence engines
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <Link key={m.href} href={m.href} className="group flex">
                <div className="w-full p-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 rounded-md bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-muted)]">
                        <Icon className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)]">
                        {m.badge}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-[var(--text)] group-hover:text-blue-500 transition-colors font-sans">
                      {m.title}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed font-sans">
                      {m.desc}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-[var(--border)] flex items-center justify-between text-xs font-sans text-[var(--text-muted)] group-hover:text-[var(--text)]">
                    <span className="text-[11px] font-medium">Access engine</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-blue-500 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

