"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { Header } from "@/components/shared/Header";
import { LoadingSpinner, ErrorState } from "@/components/ui/loading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KPICard } from "@/components/shared/KPICard";
import { api } from "@/lib/api";
import { FinancialIntelligenceResponse } from "@/types";
import { formatINR } from "@/lib/utils";
import {
  Banknote,
  AlertTriangle,
  Receipt,
  TrendingUp,
  ArrowRight,
  Zap,
  ShieldAlert,
  Activity,
  Search,
  Filter
} from "lucide-react";

// AML Risk color tiers
function riskColor(score: number) {
  if (score >= 80) return { hex: "#ef4444", label: "CRITICAL", cls: "text-red-400", bg: "bg-red-950/60 border-red-600/60" };
  if (score >= 60) return { hex: "#f97316", label: "HIGH", cls: "text-orange-400", bg: "bg-orange-950/60 border-orange-600/60" };
  if (score >= 40) return { hex: "#f59e0b", label: "MODERATE", cls: "text-amber-400", bg: "bg-amber-950/60 border-amber-600/60" };
  return { hex: "#22c55e", label: "LOW", cls: "text-emerald-400", bg: "bg-emerald-950/60 border-emerald-600/60" };
}

// Hawala flag detection
function isHawala(cat: string) {
  return cat.toLowerCase().includes("hawala") || cat.toLowerCase().includes("peer");
}

// Wine shop detection
function isWineShop(receiver: string) {
  return receiver.toLowerCase().includes("wine") || receiver.toLowerCase().includes("shop");
}

export default function FinancialIntelligencePage() {
  const [data, setData] = useState<FinancialIntelligenceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<"ALL" | "CRITICAL" | "HIGH" | "MODERATE">("ALL");
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1.0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await api.getFinancialIntelligence();
        setData(res);
        if (res.summaries.length > 0) setSelectedSuspect(res.summaries[0].suspect_name);
      } catch (err: any) {
        setError(err.message || "Failed to load financial intelligence");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Build AML flow node layout when data loads
  useEffect(() => {
    if (!data) return;
    const positions: Record<string, { x: number; y: number }> = {};
    const summaries = data.summaries;

    // Layout: suspects on left column, receivers on right
    // "HAWALA POOL" node in center
    positions["__HAWALA_POOL__"] = { x: 420, y: 220 };
    positions["__WINE_NEXUS__"] = { x: 680, y: 340 };

    summaries.forEach((s, i) => {
      const ySpacing = 120;
      const startY = 80;
      positions[s.suspect_name] = { x: 120, y: startY + i * ySpacing };
    });

    // Receivers from transactions
    const receivers = new Set<string>();
    (data.transactions || []).forEach(t => {
      if (t.receiver_name !== "") receivers.add(t.receiver_name);
    });

    let ri = 0;
    receivers.forEach(r => {
      if (isWineShop(r)) {
        positions[r] = positions["__WINE_NEXUS__"];
      } else if (!positions[r]) {
        positions[r] = { x: 680, y: 80 + ri * 110 };
        ri++;
      }
    });

    setNodePositions(positions);
  }, [data]);

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) setTransform(prev => ({ ...prev, x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }));
  };
  const handleMouseUp = () => setIsPanning(false);
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const f = e.deltaY < 0 ? 1.12 : 0.88;
    setTransform(prev => ({ ...prev, scale: Math.min(2.5, Math.max(0.35, prev.scale * f)) }));
  };

  const filteredSummaries = useMemo(() => {
    if (!data) return [];
    return data.summaries.filter(s => {
      if (searchQuery.trim() && !s.suspect_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (riskFilter !== "ALL") {
        const rc = riskColor(s.threat_score || 0);
        if (rc.label !== riskFilter) return false;
      }
      return true;
    });
  }, [data, searchQuery, riskFilter]);

  const selectedSummary = data?.summaries.find(s => s.suspect_name === selectedSuspect);
  const selectedTransactions = useMemo(() => {
    if (!data || !selectedSuspect) return [];
    return (data.transactions || []).filter(
      t => t.sender_name === selectedSuspect || t.receiver_name === selectedSuspect
    );
  }, [data, selectedSuspect]);

  // AML flow edges for selected suspect
  const flowEdges = useMemo(() => {
    if (!data || !selectedSuspect) return [];
    return (data.transactions || [])
      .filter(t => t.sender_name === selectedSuspect)
      .map(t => ({ from: t.sender_name, to: t.receiver_name, amount: t.amount_inr, category: t.merchant_category }));
  }, [data, selectedSuspect]);

  if (loading) return <LoadingSpinner label="Auditing UPI Transfers & AML Money Trail Network..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const totalHawala = (data?.transactions || []).filter(t => isHawala(t.merchant_category)).reduce((s, t) => s + t.amount_inr, 0);
  const hawalaTxCount = (data?.transactions || []).filter(t => isHawala(t.merchant_category)).length;

  return (
    <div className="space-y-6">
      <Header
        title="Module 5 — Financial Intelligence & AML Money Trail"
        subtitle="Hawala network visualization, UPI peer transfer mapping, wine shop merchant laundering flags, and smurfing ring detection."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KPICard label="Transactions Audited" value={data?.total_transactions || 0} accent="emerald" icon={Receipt} />
        <KPICard label="Total Volume" value={formatINR(data?.total_volume_inr || 0)} accent="green" icon={Banknote} />
        <KPICard label="Hawala / Peer Volume" value={formatINR(totalHawala)} accent="red" icon={AlertTriangle} />
        <KPICard label="High-Risk Suspects" value={data?.high_risk_suspects_count || 0} accent="amber" icon={ShieldAlert} />
      </div>

      {/* AML Flags Alert Banner */}
      {hawalaTxCount > 0 && (
        <div className="flex items-center gap-3 bg-red-950/60 border border-red-700/60 rounded-xl px-4 py-3 font-mono text-sm text-red-300">
          <Zap className="w-5 h-5 text-red-400 shrink-0 animate-pulse" />
          <div>
            <span className="font-extrabold text-red-400 uppercase tracking-wider">AML Alert: </span>
            <span>{hawalaTxCount} Hawala / Peer-to-Peer transactions detected totalling </span>
            <span className="font-bold text-red-300">{formatINR(totalHawala)}</span>
            <span>. Smurfing rings suspected. Initiate freeze request.</span>
          </div>
        </div>
      )}

      {/* 3-Column Layout: Suspect Roster | AML Flow Canvas | Transaction Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT: Suspect Financial Risk Roster */}
        <div className="lg:col-span-3 space-y-3">
          <Card className="bg-slate-900 border-slate-800 text-white p-4 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-200">AML RISK ROSTER</h3>
            </div>

            {/* Search & Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search suspect..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-1 flex-wrap">
                {(["ALL", "CRITICAL", "HIGH", "MODERATE"] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setRiskFilter(f)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                      riskFilter === f
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Suspect Cards */}
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {filteredSummaries.map((s) => {
                const rc = riskColor(s.threat_score || 0);
                const isSelected = selectedSuspect === s.suspect_name;
                return (
                  <div
                    key={s.suspect_name}
                    onClick={() => setSelectedSuspect(s.suspect_name)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all font-mono ${
                      isSelected
                        ? "bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/30"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-white truncate">{s.suspect_name}</p>
                        <p className="text-[10px] text-emerald-400 font-bold">{formatINR(s.total_volume_inr)}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${rc.bg} ${rc.cls} uppercase`}>
                        {rc.label}
                      </span>
                    </div>
                    <div className="mt-1.5 flex gap-3 text-[10px] text-slate-400">
                      <span>📋 {s.total_transactions} txns</span>
                      <span>👥 {s.peer_transfer_count} P2P</span>
                    </div>
                    {(s.wine_shop_spent_inr || 0) > 0 && (
                      <p className="text-[9px] text-amber-400 mt-1 font-bold">⚠️ Wine shop: {formatINR(s.wine_shop_spent_inr || 0)}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* CENTER: Interactive AML Money Flow Canvas */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="bg-slate-950 border-slate-800 p-0 overflow-hidden min-h-[580px] flex flex-col shadow-2xl">
            <div className="p-3 border-b border-slate-800 bg-slate-900/90 flex justify-between items-center text-xs font-mono">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white uppercase tracking-wider">AML MONEY FLOW TRAIL</span>
                {selectedSuspect && (
                  <Badge variant="moderate" className="text-[10px]">Tracing: {selectedSuspect}</Badge>
                )}
              </div>
              <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 mr-1">{Math.round(transform.scale * 100)}%</span>
                <button onClick={() => setTransform(p => ({ ...p, scale: Math.min(2.5, p.scale + 0.15) }))} className="p-1 text-slate-400 hover:text-white"><span className="text-sm">+</span></button>
                <button onClick={() => setTransform(p => ({ ...p, scale: Math.max(0.35, p.scale - 0.15) }))} className="p-1 text-slate-400 hover:text-white"><span className="text-sm">−</span></button>
                <button onClick={() => setTransform({ x: 0, y: 0, scale: 1.0 })} className="p-1 text-slate-400 hover:text-white text-[10px] font-bold">↺</button>
              </div>
            </div>

            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onWheel={handleWheel}
              className={`flex-1 relative bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:22px_22px] min-h-[520px] overflow-hidden ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
            >
              <div className="absolute top-3 left-3 pointer-events-none bg-slate-900/80 backdrop-blur border border-slate-800/80 rounded-md px-2.5 py-1.5 text-[10px] font-mono text-slate-400 z-10">
                🖱️ Drag to pan • Scroll to zoom
              </div>

              {/* Legend */}
              <div className="absolute bottom-3 right-3 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 font-mono text-[10px] space-y-1.5 z-10">
                <p className="text-slate-400 font-bold uppercase tracking-wider mb-1">AML Legend</p>
                <div className="flex items-center gap-1.5"><span className="w-8 h-0.5 bg-red-500 block"/><span className="text-slate-300">Hawala Transfer</span></div>
                <div className="flex items-center gap-1.5"><span className="w-8 h-0.5 bg-amber-500 block border-dashed border-t border-amber-500"/><span className="text-slate-300">Wine Shop Spend</span></div>
                <div className="flex items-center gap-1.5"><span className="w-8 h-0.5 bg-slate-500 block"/><span className="text-slate-300">Peer Transfer</span></div>
              </div>

              <div
                style={{
                  transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                  transformOrigin: "top left",
                  width: "800px",
                  height: "500px",
                  position: "relative"
                }}
              >
                <svg className="w-full h-full absolute inset-0 overflow-visible pointer-events-none">
                  {/* Draw flow edges */}
                  {flowEdges.map((edge, i) => {
                    const p1 = nodePositions[edge.from];
                    const p2 = nodePositions[edge.to] || nodePositions[edge.to];
                    if (!p1 || !p2) return null;
                    const isHawalaEdge = isHawala(edge.category);
                    const isWineEdge = isWineShop(edge.to);
                    const color = isHawalaEdge ? "#ef4444" : isWineEdge ? "#f59e0b" : "#64748b";
                    const midX = (p1.x + p2.x) / 2;
                    const midY = (p1.y + p2.y) / 2;
                    return (
                      <g key={i}>
                        {/* Glow for high-risk */}
                        {(isHawalaEdge || isWineEdge) && (
                          <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                            stroke={color} strokeWidth={8} strokeOpacity={0.12} />
                        )}
                        <line
                          x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                          stroke={color}
                          strokeWidth={isHawalaEdge ? 2.5 : 1.5}
                          strokeDasharray={isWineEdge ? "6 3" : undefined}
                          strokeOpacity={0.85}
                          markerEnd="url(#arrow)"
                        />
                        {/* Amount badge */}
                        <g transform={`translate(${midX},${midY})`}>
                          <rect x={-28} y={-10} width={56} height={20} rx={5}
                            fill="#020617" stroke={color} strokeWidth={1.2} opacity={0.92} />
                          <text x={0} y={4} fill={color} fontSize="9" fontWeight="bold"
                            fontFamily="monospace" textAnchor="middle">
                            {formatINR(edge.amount)}
                          </text>
                        </g>
                        {isHawalaEdge && (
                          <g transform={`translate(${midX},${midY + 14})`}>
                            <text x={0} y={0} fill="#ef4444" fontSize="8" fontWeight="bold"
                              fontFamily="monospace" textAnchor="middle">⚠️ HAWALA</text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* Arrow marker */}
                  <defs>
                    <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                      <path d="M0,0 L0,6 L8,3 z" fill="#64748b" />
                    </marker>
                  </defs>

                  {/* All suspect-to-suspect edges (non-selected, dimmed) */}
                  {data?.summaries.filter(s => s.suspect_name !== selectedSuspect).map(s =>
                    (data?.transactions || [])
                      .filter(t => t.sender_name === s.suspect_name)
                      .map((t, i) => {
                        const p1 = nodePositions[t.sender_name];
                        const p2 = nodePositions[t.receiver_name];
                        if (!p1 || !p2) return null;
                        return (
                          <line key={`${s.suspect_name}-${i}`}
                            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                            stroke="#334155" strokeWidth={1} strokeOpacity={0.3} />
                        );
                      })
                  )}
                </svg>

                {/* Hawala Pool Node */}
                {nodePositions["__HAWALA_POOL__"] && (
                  <div
                    style={{ left: `${nodePositions["__HAWALA_POOL__"].x}px`, top: `${nodePositions["__HAWALA_POOL__"].y}px`, transform: "translate(-50%,-50%)" }}
                    className="absolute flex flex-col items-center z-10"
                  >
                    <div className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-red-500 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                      <span className="text-red-400 text-[10px] font-extrabold font-mono text-center leading-tight">HAWALA<br />POOL</span>
                    </div>
                    <div className="mt-1 px-2 py-0.5 bg-red-950/80 border border-red-600/50 rounded font-mono text-[9px] text-red-300 font-bold">
                      ⚠️ AML FLAGGED
                    </div>
                  </div>
                )}

                {/* Wine Shop Node */}
                {nodePositions["__WINE_NEXUS__"] && (
                  <div
                    style={{ left: `${nodePositions["__WINE_NEXUS__"].x}px`, top: `${nodePositions["__WINE_NEXUS__"].y}px`, transform: "translate(-50%,-50%)" }}
                    className="absolute flex flex-col items-center z-10"
                  >
                    <div className="w-14 h-14 rounded-full bg-amber-600/20 border-2 border-amber-500 flex flex-col items-center justify-center shadow-[0_0_14px_rgba(245,158,11,0.3)]">
                      <span className="text-amber-400 text-[9px] font-extrabold font-mono text-center leading-tight">WINE<br />NEXUS</span>
                    </div>
                    <div className="mt-1 px-2 py-0.5 bg-amber-950/80 border border-amber-600/50 rounded font-mono text-[9px] text-amber-300 font-bold">
                      🍷 MONEY FRONT
                    </div>
                  </div>
                )}

                {/* Suspect Nodes */}
                {data?.summaries.map((s) => {
                  const pos = nodePositions[s.suspect_name];
                  if (!pos) return null;
                  const rc = riskColor(s.threat_score || 0);
                  const isSelected = selectedSuspect === s.suspect_name;
                  return (
                    <div
                      key={s.suspect_name}
                      onClick={() => setSelectedSuspect(s.suspect_name)}
                      style={{ left: `${pos.x}px`, top: `${pos.y}px`, transform: "translate(-50%,-50%)" }}
                      className={`absolute cursor-pointer flex flex-col items-center z-20 transition-transform ${isSelected ? "scale-110" : "hover:scale-105"}`}
                    >
                      <div
                        style={{
                          borderColor: rc.hex,
                          boxShadow: isSelected ? `0 0 20px ${rc.hex}, 0 0 8px white` : `0 0 10px ${rc.hex}80`
                        }}
                        className={`w-12 h-12 rounded-full flex flex-col items-center justify-center bg-slate-900 border-2 ${isSelected ? "ring-2 ring-white" : ""}`}
                      >
                        <span style={{ color: rc.hex }} className="text-xs font-extrabold font-mono leading-none">{(s.threat_score || 0).toFixed(0)}</span>
                        <span className="text-[7px] text-slate-400 font-mono">PTS</span>
                      </div>
                      <div className={`mt-1 px-2 py-0.5 rounded border font-mono text-center shadow max-w-[100px] ${isSelected ? "bg-slate-800 border-slate-600 text-white" : "bg-slate-950/90 border-slate-800 text-slate-300"}`}>
                        <p className="text-[9px] truncate">{s.suspect_name}</p>
                        <p style={{ color: rc.hex }} className="text-[9px] font-bold">{formatINR(s.total_volume_inr)}</p>
                      </div>
                    </div>
                  );
                })}

                {/* Receiver Nodes (non-suspect) */}
                {Array.from(new Set((data?.transactions || []).map(t => t.receiver_name)))
                  .filter(r => !data?.summaries.find(s => s.suspect_name === r))
                  .map((receiver) => {
                    const pos = nodePositions[receiver];
                    if (!pos) return null;
                    const isWine = isWineShop(receiver);
                    return (
                      <div
                        key={receiver}
                        style={{ left: `${pos.x}px`, top: `${pos.y}px`, transform: "translate(-50%,-50%)" }}
                        className="absolute flex flex-col items-center z-10 pointer-events-none"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isWine ? "bg-amber-900/40 border-2 border-amber-500" : "bg-slate-800 border border-slate-600"}`}>
                          <span className="text-[9px] font-mono text-white text-center leading-tight px-1">{isWine ? "🍷" : "💳"}</span>
                        </div>
                        <div className="mt-0.5 px-1.5 py-0.5 bg-slate-950/90 border border-slate-800 rounded font-mono text-center max-w-[90px]">
                          <p className="text-[9px] text-slate-400 truncate">{receiver}</p>
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT: Transaction Log & AML Inspector */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="bg-slate-900 border-slate-800 text-white p-4 space-y-3 sticky top-6">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-200">AML INSPECTOR</h3>
            </div>

            {selectedSummary ? (
              <div className="space-y-3 font-mono">
                <div>
                  <p className="text-base font-bold text-white">{selectedSummary.suspect_name}</p>
                  {(() => {
                    const rc = riskColor(selectedSummary.threat_score || 0);
                    return (
                      <span className={`text-[10px] font-bold uppercase ${rc.cls}`}>{rc.label} RISK — {(selectedSummary.threat_score || 0).toFixed(1)} PTS</span>
                    );
                  })()}
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Total Volume</span>
                    <span className="font-bold text-emerald-400">{formatINR(selectedSummary.total_volume_inr)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Transactions</span>
                    <span className="font-bold text-blue-400">{selectedSummary.total_transactions}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">P2P Transfers</span>
                    <span className="font-bold text-purple-400">{selectedSummary.peer_transfer_count}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Wine Shop</span>
                    <span className="font-bold text-amber-400">{formatINR(selectedSummary.wine_shop_spent_inr || 0)}</span>
                  </div>
                  {(selectedSummary.failed_withdrawals || 0) > 0 && (
                    <div className="col-span-2">
                      <span className="text-[9px] text-red-400 block uppercase">Failed Withdrawals</span>
                      <span className="font-bold text-red-400">{selectedSummary.failed_withdrawals} (Smurfing Signal)</span>
                    </div>
                  )}
                </div>

                {/* AML Flag Badges */}
                <div className="space-y-1.5">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">AML Flags Detected</p>
                  {selectedTransactions.filter(t => isHawala(t.merchant_category)).length > 0 && (
                    <div className="flex items-center gap-2 px-2.5 py-1.5 bg-red-950/60 border border-red-600/60 rounded-lg text-xs text-red-300 font-bold">
                      <AlertTriangle className="w-3 h-3" /> Hawala / Peer Network Transfer
                    </div>
                  )}
                  {selectedTransactions.filter(t => isWineShop(t.receiver_name)).length > 0 && (
                    <div className="flex items-center gap-2 px-2.5 py-1.5 bg-amber-950/60 border border-amber-600/60 rounded-lg text-xs text-amber-300 font-bold">
                      <AlertTriangle className="w-3 h-3" /> Wine Shop Front Business Spend
                    </div>
                  )}
                  {(selectedSummary.failed_withdrawals || 0) > 5 && (
                    <div className="flex items-center gap-2 px-2.5 py-1.5 bg-orange-950/60 border border-orange-600/60 rounded-lg text-xs text-orange-300 font-bold">
                      <AlertTriangle className="w-3 h-3" /> Smurfing Pattern (Failed Withdrawals)
                    </div>
                  )}
                </div>

                {/* Transaction List */}
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Transaction Log ({selectedTransactions.length})</p>
                  {selectedTransactions.length === 0 && (
                    <p className="text-[10px] text-slate-500 text-center py-4">No transactions available in demo data.</p>
                  )}
                  {selectedTransactions.map((t, i) => {
                    const hawala = isHawala(t.merchant_category);
                    const wine = isWineShop(t.receiver_name);
                    return (
                      <div key={i} className={`p-2 rounded-lg border text-[10px] ${hawala ? "bg-red-950/40 border-red-700/50" : wine ? "bg-amber-950/40 border-amber-700/50" : "bg-slate-950 border-slate-800"}`}>
                        <div className="flex justify-between items-start">
                          <div className="space-y-0.5">
                            <p className="font-bold text-white text-[11px]">{t.transaction_id}</p>
                            <p className="text-slate-400">{t.sender_name} <ArrowRight className="w-2.5 h-2.5 inline" /> {t.receiver_name}</p>
                            <p className={hawala ? "text-red-400 font-bold" : wine ? "text-amber-400" : "text-slate-500"}>{t.merchant_category}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`font-bold ${hawala ? "text-red-400" : "text-emerald-400"}`}>{formatINR(t.amount_inr)}</p>
                            <p className="text-slate-500 text-[9px]">{t.timestamp?.slice(0, 10)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center p-8 text-xs font-mono text-slate-500">
                <Banknote className="w-8 h-8 mx-auto text-slate-700 mb-2" />
                Select a suspect to inspect their AML money trail.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
