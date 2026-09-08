"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/shared/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import {
  User, Phone, Network, Camera, Banknote, ShieldAlert, Brain,
  BarChart3, ArrowLeft, AlertTriangle, CheckCircle2, FileText,
  Activity, Scale, Crosshair, Loader2, ExternalLink
} from "lucide-react";
import Link from "next/link";

// ─── helpers ──────────────────────────────────────────────────────────────────
function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
      <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
    </div>
  );
}

const FEATURE_META: Record<string, { label: string; max: number; color: string; icon: React.ElementType }> = {
  cctv_meeting_score:     { label: "CCTV Co-Location",        max: 30, color: "bg-amber-400",  icon: Camera },
  cdr_network_score:      { label: "CDR Network Centrality",  max: 20, color: "bg-blue-400",   icon: Network },
  fir_severity_score:     { label: "FIR Statutory Severity",  max: 15, color: "bg-rose-400",   icon: Scale },
  criminal_history_score: { label: "Criminal History",        max: 15, color: "bg-red-500",    icon: ShieldAlert },
  financial_risk_score:   { label: "Financial Risk Pattern",  max: 10, color: "bg-emerald-400",icon: Banknote },
  surveillance_score:     { label: "Field Surveillance",      max: 10, color: "bg-indigo-400", icon: Activity },
};

// ─── page ──────────────────────────────────────────────────────────────────────
export default function SubjectDossierPage() {
  const params = useParams<{ id: string }>();
  // decode e.g. "M-047" or a URL-encoded suspect name
  const rawId = decodeURIComponent(params?.id ?? "M-047");

  const [threatData, setThreatData] = useState<any>(null);
  const [xaiData, setXaiData]     = useState<any>(null);
  const [cdrData, setCdrData]     = useState<any>(null);
  const [cctvData, setCctvData]   = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  // Try to find a real suspect by matching the slug to a name
  const [resolvedName, setResolvedName] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError("");

    // First: load threat scores to resolve an actual suspect name
    api.getThreatIndex().then((suspects: any[]) => {
      if (!suspects || suspects.length === 0) { setError("No suspects loaded."); setLoading(false); return; }

      // Match by name substring (case-insensitive) or take first as demo fallback
      const match = suspects.find((s: any) =>
        s.suspect_name?.toLowerCase().includes(rawId.toLowerCase()) ||
        rawId.toLowerCase().includes(s.suspect_name?.toLowerCase())
      ) ?? suspects[0];

      const name = match.suspect_name;
      setResolvedName(name);
      setThreatData(match);

      // Load XAI + CDR in parallel
      return Promise.all([
        api.explainSuspect(name).catch(() => null),
        api.getCDRSummary().catch(() => null),
        api.getCCTVMeetings().catch(() => null),
      ]);
    }).then((results) => {
      if (!results) return;
      const [xai, cdr, cctv] = results;
      setXaiData(xai);
      // Filter CDR pairs involving this suspect
      if (cdr && Array.isArray(cdr)) {
        setCdrData(cdr.filter((r: any) =>
          r.suspect_1 === resolvedName || r.suspect_2 === resolvedName
        ).slice(0, 5));
      } else if (cdr?.pair_summary) {
        setCdrData(cdr.pair_summary.slice(0, 5));
      }
      if (cctv && Array.isArray(cctv)) {
        setCctvData(cctv.slice(0, 5));
      } else if (cctv?.meetings) {
        setCctvData(cctv.meetings.slice(0, 5));
      }
    }).catch((e) => {
      setError("Backend unavailable — start FastAPI on port 8080.");
    }).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawId]);

  const totalScore  = threatData?.total_threat_score ?? 0;
  const scoreColor  = totalScore >= 75 ? "text-red-400" : totalScore >= 50 ? "text-amber-400" : "text-emerald-400";
  const scoreBorder = totalScore >= 75 ? "border-red-700" : totalScore >= 50 ? "border-amber-600" : "border-emerald-700";

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Back nav */}
      <div className="flex items-center gap-3">
        <Link href="/dossiers" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
          <ArrowLeft className="size-3.5" /> All dossiers
        </Link>
        <span className="text-slate-700">/</span>
        <span className="font-mono text-xs text-slate-300">{rawId}</span>
      </div>

      <Header
        title={`360° Subject Intelligence Dossier`}
        description={`Composite threat profile · XAI feature attribution · multi-domain evidence trail`}
      />

      {loading && (
        <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-8 text-slate-400">
          <Loader2 className="size-5 animate-spin text-blue-400" />
          <span className="text-sm">Pulling intelligence streams for subject {rawId}…</span>
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl border border-rose-800 bg-rose-950/50 p-5 text-sm text-rose-400">{error}</div>
      )}

      {!loading && threatData && (
        <div className="space-y-6">

          {/* ── Identity Card ── */}
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <Card className="border-slate-800 bg-slate-900/90 text-white">
              <CardContent className="flex flex-wrap items-center gap-4 p-5">
                <div className="flex size-14 items-center justify-center rounded-full border-2 border-slate-700 bg-slate-800">
                  <User className="size-7 text-slate-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{resolvedName ?? rawId}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge className="border-slate-700 bg-slate-800 font-mono text-[10px] text-slate-300">
                      <Phone className="mr-1 size-3" />{threatData.phone_number ?? "—"}
                    </Badge>
                    <Badge className={`border font-mono text-[10px] ${scoreBorder} bg-slate-900 ${scoreColor}`}>
                      COMPOSITE THREAT: {totalScore}/100
                    </Badge>
                    {totalScore >= 75 && (
                      <Badge className="border border-red-700 bg-red-950/50 text-[10px] text-red-300">
                        <AlertTriangle className="mr-1 size-3" /> CRITICAL PRIORITY
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Score dial */}
            <Card className={`flex min-w-[120px] flex-col items-center justify-center border p-4 text-center ${scoreBorder} bg-slate-900/90`}>
              <p className="font-mono text-[10px] text-slate-500">COMPOSITE</p>
              <p className={`text-4xl font-black ${scoreColor}`}>{totalScore}</p>
              <p className="mt-0.5 font-mono text-[10px] text-slate-500">/ 100</p>
            </Card>
          </div>

          {/* ── XAI Feature Attribution ── */}
          <Card className="border-slate-800 bg-slate-900/90 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300">
                <Brain className="size-4 text-violet-400" /> Explainable AI — Why This Subject Was Flagged
              </CardTitle>
              <CardDescription className="text-slate-500">
                SHAP-style feature attribution · each bar shows % contribution to composite threat score
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(FEATURE_META).map(([key, meta]) => {
                const raw   = threatData[key] ?? 0;
                const Icon  = meta.icon;
                const pct   = meta.max > 0 ? Math.round((raw / meta.max) * 100) : 0;
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <Icon className="size-3.5 text-slate-500" />{meta.label}
                      </span>
                      <span className="font-mono text-slate-400">
                        {raw.toFixed(1)} / {meta.max} &nbsp;
                        <span className={`font-bold ${meta.color.replace("bg-", "text-")}`}>({pct}%)</span>
                      </span>
                    </div>
                    <Bar value={raw} max={meta.max} color={meta.color} />
                  </div>
                );
              })}

              {/* XAI narrative if available */}
              {xaiData?.narrative && (
                <div className="mt-3 rounded-lg border border-violet-800 bg-violet-950/40 p-3 text-[11px] text-violet-300">
                  <p className="mb-1 font-bold uppercase tracking-wider text-violet-400">AI Narrative</p>
                  <p>{xaiData.narrative}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Counterfactual What-If ── */}
          {xaiData?.counterfactuals && (
            <Card className="border-slate-800 bg-slate-900/90 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300">
                  <BarChart3 className="size-4 text-cyan-400" /> Counterfactual Simulator — What Would Change?
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {xaiData.counterfactuals.map((cf: any, i: number) => (
                  <div key={i} className="rounded-lg border border-slate-700 bg-slate-950 p-3">
                    <p className="text-xs font-semibold text-cyan-300">{cf.hypothesis}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{cf.explanation}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-500">New score:</span>
                      <span className="font-mono text-xs font-bold text-amber-400">
                        {cf.simulated_score ?? "—"} / 100
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* ── Evidence Trail ── */}
          <Card className="border-slate-800 bg-slate-900/90 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300">
                <Crosshair className="size-4 text-rose-400" /> Multi-Domain Evidence Trail
              </CardTitle>
              <CardDescription className="text-slate-500">
                Raw signals that contributed to this subject's threat score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* CDR rows */}
                {(cdrData && cdrData.length > 0) ? cdrData.map((row: any, i: number) => (
                  <div key={`cdr-${i}`} className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs">
                    <span className="flex items-center gap-1 rounded border border-blue-800 bg-blue-950/50 px-1.5 py-0.5 font-bold text-blue-300">
                      <Phone className="size-3" /> CDR
                    </span>
                    <span className="flex-1 text-slate-300">
                      Call association with <span className="font-semibold text-white">{row.suspect_2 ?? row.suspect_1 ?? "Unknown"}</span>
                      {row.total_calls && ` · ${row.total_calls} calls`}
                      {row.nocturnal_calls > 0 && <span className="ml-2 text-amber-400">⚑ {row.nocturnal_calls} nocturnal</span>}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">via tower data</span>
                  </div>
                )) : (
                  <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-3 text-xs text-slate-500">
                    CDR data unavailable — backend offline or no CDR records for this subject.
                  </div>
                )}

                {/* CCTV rows */}
                {(cctvData && cctvData.length > 0) ? cctvData.map((row: any, i: number) => (
                  <div key={`cctv-${i}`} className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs">
                    <span className="flex items-center gap-1 rounded border border-amber-800 bg-amber-950/50 px-1.5 py-0.5 font-bold text-amber-300">
                      <Camera className="size-3" /> CCTV
                    </span>
                    <span className="flex-1 text-slate-300">
                      Co-location with <span className="font-semibold text-white">{row.suspect_2 ?? "Unknown"}</span>
                      {row.camera_location && ` · ${row.camera_location}`}
                      {row.avg_match_confidence && (
                        <span className="ml-2 font-mono text-emerald-400">
                          conf {(row.avg_match_confidence * 100).toFixed(0)}%
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">{row.camera_id ?? "—"}</span>
                  </div>
                )) : null}

                {/* Static financial signal row */}
                <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs">
                  <span className="flex items-center gap-1 rounded border border-emerald-800 bg-emerald-950/50 px-1.5 py-0.5 font-bold text-emerald-300">
                    <Banknote className="size-3" /> FININT
                  </span>
                  <span className="flex-1 text-slate-300">
                    Financial risk signal · score <span className="font-semibold text-white">{(threatData.financial_risk_score ?? 0).toFixed(1)}</span> / 10
                    {(threatData.financial_risk_score ?? 0) >= 7 && (
                      <span className="ml-2 text-rose-400">⚑ Smurfing pattern detected</span>
                    )}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">via UPI ledger</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Quick Action Bar ── */}
          <div className="flex flex-wrap gap-3">
            <Link href={`/explainability?suspect=${encodeURIComponent(resolvedName ?? rawId)}`}>
              <Button variant="outline" className="border-violet-700 bg-violet-950/40 text-xs text-violet-300 hover:border-violet-500 hover:text-white">
                <Brain className="mr-1.5 size-3.5" /> Full XAI Deep-Dive
              </Button>
            </Link>
            <Link href="/graph-algorithms">
              <Button variant="outline" className="border-blue-700 bg-blue-950/40 text-xs text-blue-300 hover:border-blue-500 hover:text-white">
                <Network className="mr-1.5 size-3.5" /> Graph Topology View
              </Button>
            </Link>
            <Link href="/anomaly-detection">
              <Button variant="outline" className="border-amber-700 bg-amber-950/40 text-xs text-amber-300 hover:border-amber-500 hover:text-white">
                <Activity className="mr-1.5 size-3.5" /> Anomaly Detection
              </Button>
            </Link>
            <Link href="/nlp-extraction">
              <Button variant="outline" className="border-emerald-700 bg-emerald-950/40 text-xs text-emerald-300 hover:border-emerald-500 hover:text-white">
                <FileText className="mr-1.5 size-3.5" /> Attach FIR Narrative
              </Button>
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}
