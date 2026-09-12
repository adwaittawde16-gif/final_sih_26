"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/shared/Header";
import { KPICard } from "@/components/shared/KPICard";
import { LoadingSpinner, ErrorState } from "@/components/ui/loading";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { ThreatLeaderboardResponse, AlertsResponse } from "@/types";
import { Flame, Network, Camera, Layers, Banknote, Moon, Eye, FileText, ArrowRight } from "lucide-react";

export default function CommandCenterPage() {
  const [data, setData] = useState<ThreatLeaderboardResponse | null>(null);
  const [alerts, setAlerts] = useState<AlertsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [boardRes, alertRes] = await Promise.all([
          api.getThreatLeaderboard(),
          api.getAlerts()
        ]);
        setData(boardRes);
        setAlerts(alertRes);
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

  const topSuspect = data?.leaderboard[0];

  return (
    <div className="space-y-6">
      <Header
        title="Tactical Intelligence Command Center"
        subtitle="Unified suspect risk scoring, CDR networks, CCTV tracking, and financial intelligence."
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard label="Suspects Profiled" value={data?.total_suspects || 100} accent="blue" icon={Flame} />
        <KPICard label="Active Crime Rings" value="88" accent="red" icon={Layers} subtext="Priority RING-01" />
        <KPICard label="Critical Risk Tiers" value={data?.critical_count || 6} accent="red" icon={Flame} />
        <KPICard label="CCTV Encounters" value="12" accent="amber" icon={Camera} subtext="Confirmed matches" />
        <KPICard label="Night Hotspots" value="16" accent="green" icon={Moon} subtext="00:00-06:00 IST" />
      </div>

      {/* Priority Top Suspect Alert Card */}
      {topSuspect && (
        <Card className="border-red-300 bg-red-50/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="critical">CRITICAL RISK · PRIORITY DOSSIER</Badge>
                <span className="text-xs font-mono text-slate-500">RING-01 LEAD</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{topSuspect.suspect_name}</h2>
              <p className="text-xs font-mono text-slate-600">{topSuspect.phone_number} · Composite Score {topSuspect.total_threat_score.toFixed(1)}/100</p>
            </div>
            <Link
              href={`/dossiers?suspect=${encodeURIComponent(topSuspect.suspect_name)}`}
              className="inline-flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg transition-colors font-mono shadow-sm"
            >
              Open 360° Suspect Dossier
            </Link>
          </div>
        </Card>
      )}

      {/* 8 Module Navigation Grid */}
      <div>
        <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest mb-4">
          Core Intelligence Modules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "1. Suspect Threat Index", desc: "0-100 Suspect risk ranking & simulator", href: "/threat", icon: Flame, color: "text-red-600" },
            { title: "2. CDR Network Graph", desc: "Call log pairings & physics network", href: "/cdr", icon: Network, color: "text-blue-600" },
            { title: "3. CCTV Co-Location", desc: "Camera sightings & distance correlation", href: "/cctv", icon: Camera, color: "text-amber-600" },
            { title: "4. Crime Syndicates", desc: "Connected component ring detection", href: "/crime-rings", icon: Layers, color: "text-purple-600" },
            { title: "5. Financial Intelligence", desc: "UPI money trails & merchant flags", href: "/financial", icon: Banknote, color: "text-emerald-600" },
            { title: "6. Nocturnal Anomalies", desc: "Late-night calls & cell tower hotspots", href: "/nocturnal", icon: Moon, color: "text-cyan-600" },
            { title: "7. Field Surveillance", desc: "Field officer reports & density heatmap", href: "/surveillance", icon: Eye, color: "text-indigo-600" },
            { title: "8. Suspect Dossiers", desc: "360° dossiers & real-time alert feed", href: "/dossiers", icon: FileText, color: "text-pink-600" },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <Link key={m.href} href={m.href} className="group">
                <Card className="h-full hover:border-slate-400 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <Icon className={`w-5 h-5 ${m.color}`} />
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                  </div>
                  <CardTitle className="text-sm font-bold group-hover:text-blue-700 transition-colors">{m.title}</CardTitle>
                  <CardDescription className="mt-1">{m.desc}</CardDescription>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
