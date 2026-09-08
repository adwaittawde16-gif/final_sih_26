"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/shared/Header";
import { LoadingSpinner, ErrorState } from "@/components/ui/loading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { ThreatLeaderboardResponse } from "@/types";
import { SlidersHorizontal, Search } from "lucide-react";

export default function ThreatLeaderboardPage() {
  const [data, setData] = useState<ThreatLeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [weights, setWeights] = useState({
    cctv_weight: 30,
    cdr_weight: 20,
    fir_weight: 15,
    criminal_weight: 15,
    financial_weight: 10,
    surveillance_weight: 10,
  });
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const res = await api.getThreatLeaderboard();
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load threat leaderboard");
    } finally {
      setLoading(false);
    }
  }

  async function handleSimulate() {
    try {
      setSimulating(true);
      const res = await api.simulateThreatWeights(weights);
      if (data) {
        setData({
          ...data,
          leaderboard: res.simulated_leaderboard,
        });
      }
    } catch (err: any) {
      alert("Simulation error: " + err.message);
    } finally {
      setSimulating(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading Suspect Threat Index..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  const filtered = (data?.leaderboard || []).filter((s) =>
    s.suspect_name.toLowerCase().includes(search.toLowerCase()) ||
    s.phone_number.includes(search)
  );

  return (
    <div className="space-y-6">
      <Header
        title="Module 1 — Suspect Threat Index & Simulator"
        subtitle="Composite 0–100 risk score ranking based on 6 intelligence parameters."
      />

      {/* Simulator Control Panel */}
      <Card className="border-slate-300 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal className="w-4 h-4 text-slate-800" />
          <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-900">Dynamic Weight Simulator</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { key: "cctv_weight", label: "CCTV Physical", max: 50 },
            { key: "cdr_weight", label: "CDR Network", max: 50 },
            { key: "fir_weight", label: "FIR Severity", max: 50 },
            { key: "criminal_weight", label: "Criminal History", max: 50 },
            { key: "financial_weight", label: "Financial Risk", max: 50 },
            { key: "surveillance_weight", label: "Surveillance", max: 50 },
          ].map((w) => (
            <div key={w.key} className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-slate-600 font-medium">
                <span>{w.label}</span>
                <span className="text-slate-900 font-bold">{(weights as any)[w.key]}%</span>
              </div>
              <input
                type="range"
                min="0"
                max={w.max}
                value={(weights as any)[w.key]}
                onChange={(e) => setWeights({ ...weights, [w.key]: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
          <span className="text-xs font-mono text-slate-600">
            Total Model Weight: <strong className="text-emerald-700">{Object.values(weights).reduce((a, b) => a + b, 0)}%</strong>
          </span>
          <Button size="sm" onClick={handleSimulate} disabled={simulating}>
            {simulating ? "Simulating..." : "Recalculate Scores"}
          </Button>
        </div>
      </Card>

      {/* Leaderboard Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by suspect name or phone number..."
            className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 font-mono shadow-sm"
          />
        </div>
        <span className="text-xs font-mono text-slate-600 font-medium">
          Showing {filtered.length} of {data?.total_suspects} suspects
        </span>
      </div>

      {/* Leaderboard Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Suspect Name</th>
                <th className="p-3">Phone</th>
                <th className="p-3 text-right">Threat Score</th>
                <th className="p-3 text-right">CCTV</th>
                <th className="p-3 text-right">CDR</th>
                <th className="p-3 text-right">FIR</th>
                <th className="p-3 text-right">Criminal</th>
                <th className="p-3 text-right">Financial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((item, idx) => {
                const isTop = idx === 0;
                return (
                  <tr key={item.suspect_name} className={isTop ? "bg-red-50/60" : "hover:bg-slate-50 transition-colors"}>
                    <td className="p-3 font-bold text-slate-500">#{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900">
                      {item.suspect_name}
                      {isTop && <Badge variant="critical" className="ml-2">TOP TARGET</Badge>}
                    </td>
                    <td className="p-3 text-slate-600">{item.phone_number}</td>
                    <td className="p-3 text-right font-bold text-red-700 text-sm">{item.total_threat_score.toFixed(1)}</td>
                    <td className="p-3 text-right text-slate-700">{item.cctv_meeting_score.toFixed(1)}</td>
                    <td className="p-3 text-right text-slate-700">{item.cdr_network_score.toFixed(1)}</td>
                    <td className="p-3 text-right text-slate-700">{item.fir_severity_score.toFixed(1)}</td>
                    <td className="p-3 text-right text-slate-700">{item.criminal_history_score.toFixed(1)}</td>
                    <td className="p-3 text-right text-slate-700">{item.financial_risk_score.toFixed(1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
