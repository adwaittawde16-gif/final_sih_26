"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/shared/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { api } from "@/lib/api";
import {
  HelpCircle,
  ShieldAlert,
  Sparkles,
  Sliders,
  FileSearch,
  CheckCircle2,
  Clock,
  MapPin,
  Scale,
  Phone,
  Camera,
  Layers,
  TrendingUp,
  AlertCircle
} from "lucide-react";

export default function ExplainabilityPage() {
  const [suspects, setSuspects] = useState<string[]>([
    "Md. Ranbir Bhalla",
    "Md. Teerth Bhargava",
    "Md. Advik Golla",
    "Md. Vedant Padmanabhan",
    "Md. Azad Mannan"
  ]);
  const [selectedSuspect, setSelectedSuspect] = useState<string>("Md. Ranbir Bhalla");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  // Counterfactual sliders state
  const [simNocturnal, setSimNocturnal] = useState<number>(0);
  const [simCCTV, setSimCCTV] = useState<number>(0);

  const fetchExplanation = async (suspect: string) => {
    setLoading(true);
    try {
      const res = await api.explainSuspect(suspect);
      setData(res);
      setSimNocturnal(0);
      setSimCCTV(0);
    } catch (err) {
      console.error("Failed to load explanation:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load top suspects from leaderboard
    api.getThreatLeaderboard().then((leaderboard) => {
      if (leaderboard?.leaderboard && leaderboard.leaderboard.length > 0) {
        const names = leaderboard.leaderboard.map((s) => s.suspect_name);
        setSuspects(names);
        setSelectedSuspect(names[0]);
        fetchExplanation(names[0]);
      } else {
        fetchExplanation(selectedSuspect);
      }
    }).catch(() => {
      fetchExplanation(selectedSuspect);
    });
  }, []);

  const handleSuspectChange = (name: string) => {
    setSelectedSuspect(name);
    fetchExplanation(name);
  };

  // Compute simulated counterfactual score
  const baseScore = data?.total_threat_score || 75.0;
  const simulatedScore = Math.max(
    5.0,
    Math.min(
      100.0,
      baseScore + (simNocturnal * 4.0) + (simCCTV * 10.0)
    )
  );

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header
        title="Explainable AI (XAI) & Evidence Attribution Engine"
        subtitle="Mathematical feature attribution, counterfactual simulation, and forensic evidence lineage."
      />

      {/* Suspect Selector Bar */}
      <Card className="border-slate-800 bg-slate-900/90 text-white">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Criminal Subject:
            </span>
            <select
              value={selectedSuspect}
              onChange={(e) => handleSuspectChange(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-white focus:border-blue-500 focus:outline-none"
            >
              {suspects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {data && (
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="text-slate-400">Phone: <strong className="text-slate-200">{data.phone_number}</strong></span>
              <Badge className={data.threat_tier.includes("CRITICAL") ? "bg-rose-950 text-rose-400 border border-rose-800" : "bg-amber-950 text-amber-400 border border-amber-800"}>
                {data.threat_tier}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {loading && <Loading message="Computing SHAP Feature Attributions & Gathering Evidence Trail..." />}

      {!loading && data && (
        <div className="space-y-6">
          {/* Executive XAI Verdict */}
          <Card className="border-blue-900/40 bg-blue-950/20 text-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                  <Sparkles className="size-4" /> Algorithmic Decision Justification
                </CardTitle>
                <Badge className="bg-blue-600 text-white font-bold text-xs font-mono">
                  Threat Score: {data.total_threat_score}/100
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm font-semibold text-slate-200 leading-relaxed">
                {data.primary_verdict}
              </p>
              <p className="text-xs text-slate-400">
                Statutory Chargeability: <span className="text-emerald-400 font-semibold">{data.statutory_chargeability}</span>
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Feature Attribution Breakdown (SHAP-style) */}
            <div className="space-y-4 lg:col-span-7">
              <Card className="border-slate-800 bg-slate-900/90 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                    <TrendingUp className="size-4 text-emerald-400" /> Multi-Vector Feature Attribution Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.feature_attribution?.map((feat: any, idx: number) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">{feat.feature_name}</span>
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="font-bold text-blue-400">+{feat.score_contribution} pts</span>
                          <span className="text-slate-500">({feat.percentage_influence}% influence)</span>
                        </div>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-950 border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            feat.risk_signal === "CRITICAL"
                              ? "bg-rose-500"
                              : feat.risk_signal === "HIGH"
                              ? "bg-amber-500"
                              : "bg-blue-500"
                          }`}
                          style={{ width: `${Math.min(100, (feat.score_contribution / feat.max_possible) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Counterfactual Simulation Studio */}
              <Card className="border-slate-800 bg-slate-900/90 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
                    <Sliders className="size-4" /> Counterfactual "What-If" Intelligence Simulator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-slate-400">
                    Adjust hypothetical parameters to test model stability and sensitivity:
                  </p>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                      <div className="flex justify-between text-xs font-bold text-slate-300">
                        <span>Simulate Δ Nocturnal Calls:</span>
                        <span className="text-rose-400">{simNocturnal > 0 ? `+${simNocturnal}` : simNocturnal}</span>
                      </div>
                      <input
                        type="range"
                        min="-5"
                        max="5"
                        step="1"
                        value={simNocturnal}
                        onChange={(e) => setSimNocturnal(parseInt(e.target.value))}
                        className="mt-2 w-full accent-rose-500"
                      />
                    </div>

                    <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                      <div className="flex justify-between text-xs font-bold text-slate-300">
                        <span>Simulate Δ CCTV Sightings:</span>
                        <span className="text-emerald-400">{simCCTV > 0 ? `+${simCCTV}` : simCCTV}</span>
                      </div>
                      <input
                        type="range"
                        min="-3"
                        max="3"
                        step="1"
                        value={simCCTV}
                        onChange={(e) => setSimCCTV(parseInt(e.target.value))}
                        className="mt-2 w-full accent-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-purple-900/50 bg-purple-950/20 p-3 font-mono text-xs">
                    <span className="text-slate-300">Simulated Counterfactual Score:</span>
                    <span className="text-lg font-black text-purple-300">{simulatedScore.toFixed(1)} / 100</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Clickable Forensic Evidence Lineage Trail */}
            <div className="space-y-4 lg:col-span-5">
              <Card className="border-slate-800 bg-slate-900/90 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                    <FileSearch className="size-4 text-amber-400" /> Ground-Truth Evidence Lineage ({data.forensic_evidence_trail?.length || 0} Artifacts)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.forensic_evidence_trail?.map((ev: any, idx: number) => {
                    const isCDR = ev.source_modality === "TELECOM_CDR";
                    const isCCTV = ev.source_modality === "CCTV_SURVEILLANCE";
                    return (
                      <div key={idx} className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-1.5 font-mono text-[11px]">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-slate-900 text-[9px] text-slate-300 border border-slate-700">
                            {isCDR ? <Phone className="mr-1 size-2.5 text-blue-400" /> : isCCTV ? <Camera className="mr-1 size-2.5 text-emerald-400" /> : <Scale className="mr-1 size-2.5 text-amber-400" />}
                            {ev.source_modality}
                          </Badge>
                          <span className="text-[10px] text-slate-500">{ev.timestamp}</span>
                        </div>
                        <p className="font-sans text-xs text-slate-200">{ev.summary}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>Location: {ev.location}</span>
                          <span className="font-bold text-rose-400">{ev.flag}</span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
