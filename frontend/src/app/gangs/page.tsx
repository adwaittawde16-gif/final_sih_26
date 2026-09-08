"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/shared/Header";
import { LoadingSpinner, ErrorState } from "@/components/ui/loading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KPICard } from "@/components/shared/KPICard";
import { api } from "@/lib/api";
import { GangListResponse, GangRecord, GangSubGraphResponse } from "@/types";
import {
  Layers,
  CheckCircle2,
  XCircle,
  Edit3,
  GitMerge,
  UserPlus,
  Network,
  Search,
  Radio,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Crown,
  Users,
  AlertTriangle,
  RefreshCw,
  MapPin,
  ArrowUpRight,
  ShieldCheck,
  ShieldX,
  Clock
} from "lucide-react";

// Gang accent colors per gang id
const GANG_COLORS: Record<string, { hex: string; bg: string; glow: string; text: string }> = {
  "GANG-01": { hex: "#ef4444", bg: "bg-red-500", glow: "rgba(239,68,68,0.5)", text: "text-red-400" },
  "GANG-02": { hex: "#f59e0b", bg: "bg-amber-500", glow: "rgba(245,158,11,0.5)", text: "text-amber-400" },
  "GANG-03": { hex: "#a855f7", bg: "bg-purple-500", glow: "rgba(168,85,247,0.5)", text: "text-purple-400" },
  "GANG-04": { hex: "#06b6d4", bg: "bg-cyan-500", glow: "rgba(6,182,212,0.5)", text: "text-cyan-400" },
};

function getGangColor(gangId: string) {
  return GANG_COLORS[gangId] || { hex: "#6366f1", bg: "bg-indigo-500", glow: "rgba(99,102,241,0.5)", text: "text-indigo-400" };
}

export default function GangsPage() {
  const [gangsData, setGangsData] = useState<GangListResponse | null>(null);
  const [selectedGang, setSelectedGang] = useState<GangRecord | null>(null);
  const [subGraph, setSubGraph] = useState<GangSubGraphResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Action States
  const [statusFilter, setStatusFilter] = useState<"ALL" | "CONFIRMED" | "CANDIDATE" | "DISMISSED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [renameInput, setRenameInput] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [tagEntityName, setTagEntityName] = useState("");
  const [showTagModal, setShowTagModal] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Sub-Graph Canvas Transform States
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1.0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadGangs(); }, []);

  useEffect(() => {
    if (selectedGang) {
      loadSubGraph(selectedGang.gang_id);
      setTransform({ x: 0, y: 0, scale: 1.0 });
    }
  }, [selectedGang]);

  // Recompute node positions when subgraph changes
  useEffect(() => {
    if (!subGraph || subGraph.nodes.length === 0) return;
    const nodes = subGraph.nodes;
    const cx = 240;
    const cy = 220;
    const positions: Record<string, { x: number; y: number }> = {};

    if (nodes.length === 1) {
      positions[nodes[0].id] = { x: cx, y: cy };
    } else {
      // Leader at center, rest in orbit
      const leader = nodes.find(n => n.label === selectedGang?.ring_leader) || nodes[0];
      positions[leader.id] = { x: cx, y: cy };

      const others = nodes.filter(n => n.id !== leader.id);
      others.forEach((n, i) => {
        const angle = (2 * Math.PI * i) / others.length;
        const radius = Math.min(160, 80 + others.length * 12);
        positions[n.id] = {
          x: cx + radius * Math.cos(angle),
          y: cy + radius * Math.sin(angle)
        };
      });
    }
    setNodePositions(positions);
  }, [subGraph]);

  function showFeedback(msg: string, type: "success" | "error") {
    setActionFeedback({ msg, type });
    setTimeout(() => setActionFeedback(null), 3000);
  }

  async function loadGangs() {
    try {
      setLoading(true);
      const res = await api.getGangs();
      setGangsData(res);
      if (res.gangs.length > 0) setSelectedGang(res.gangs[0]);
    } catch (err: any) {
      setError(err.message || "Failed to load gang detection data");
    } finally {
      setLoading(false);
    }
  }

  async function loadSubGraph(gangId: string) {
    try {
      const res = await api.getGangSubGraph(gangId);
      setSubGraph(res);
    } catch (err: any) {
      console.error("Failed to load gang subgraph:", err);
    }
  }

  async function handleConfirm(gangId: string) {
    try {
      await api.confirmGang(gangId);
      showFeedback("Gang confirmed successfully.", "success");
      loadGangs();
    } catch (err: any) {
      showFeedback("Error confirming gang: " + err.message, "error");
    }
  }

  async function handleRename(gangId: string) {
    if (!renameInput.trim()) return;
    try {
      await api.renameGang(gangId, renameInput.trim());
      setIsRenaming(false);
      setRenameInput("");
      showFeedback("Gang renamed successfully.", "success");
      loadGangs();
    } catch (err: any) {
      showFeedback("Error renaming gang: " + err.message, "error");
    }
  }

  async function handleDismiss(gangId: string) {
    try {
      await api.dismissGang(gangId);
      showFeedback("Gang dismissed.", "success");
      loadGangs();
    } catch (err: any) {
      showFeedback("Error dismissing gang: " + err.message, "error");
    }
  }

  async function handleTagEntity() {
    if (!tagEntityName.trim() || !selectedGang) return;
    try {
      await api.tagEntityGang(tagEntityName.trim(), selectedGang.gang_id);
      setTagEntityName("");
      setShowTagModal(false);
      showFeedback(`Entity "${tagEntityName}" tagged to ${selectedGang.name}.`, "success");
      loadGangs();
    } catch (err: any) {
      showFeedback("Error tagging entity: " + err.message, "error");
    }
  }

  // Canvas pan/zoom handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (draggedNode) return;
    setIsPanning(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNode && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const rawX = (e.clientX - rect.left - transform.x) / transform.scale;
      const rawY = (e.clientY - rect.top - transform.y) / transform.scale;
      setNodePositions(prev => ({ ...prev, [draggedNode]: { x: rawX, y: rawY } }));
    } else if (isPanning) {
      setTransform(prev => ({ ...prev, x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }));
    }
  };

  const handleMouseUp = () => { setIsPanning(false); setDraggedNode(null); };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.88;
    setTransform(prev => ({ ...prev, scale: Math.min(2.5, Math.max(0.4, prev.scale * factor)) }));
  };

  if (loading) return <LoadingSpinner label="Running Modularity Clustering & Gang Detection Algorithms..." />;
  if (error) return <ErrorState message={error} onRetry={loadGangs} />;

  const filteredGangs = (gangsData?.gangs || []).filter((g) => {
    if (statusFilter !== "ALL" && g.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (
        !g.name.toLowerCase().includes(q) &&
        !g.gang_id.toLowerCase().includes(q) &&
        !g.ring_leader.toLowerCase().includes(q) &&
        !g.members.some(m => m.toLowerCase().includes(q))
      ) return false;
    }
    return true;
  });

  const gangColor = selectedGang ? getGangColor(selectedGang.gang_id) : getGangColor("GANG-01");

  return (
    <div className="space-y-6">
      <Header
        title="Module 4 — Gang & Crime Syndicate Classification"
        subtitle="NetworkX modularity clustering algorithm auto-detecting candidate gangs, metadata tracking, and investigator overrides."
      />

      {/* Action Feedback Toast */}
      {actionFeedback && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl border font-mono text-sm font-bold shadow-2xl flex items-center gap-2 transition-all ${
          actionFeedback.type === "success"
            ? "bg-emerald-950 border-emerald-500 text-emerald-300"
            : "bg-red-950 border-red-500 text-red-300"
        }`}>
          {actionFeedback.type === "success" ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {actionFeedback.msg}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KPICard label="Total Gangs Detected" value={gangsData?.total_gangs || 0} accent="purple" icon={Layers} />
        <KPICard label="Confirmed Gangs" value={gangsData?.confirmed_count || 0} accent="green" icon={CheckCircle2} />
        <KPICard label="Candidate Gangs" value={gangsData?.candidate_count || 0} accent="amber" icon={Radio} />
        <KPICard label="Dismissed Clusters" value={gangsData?.dismissed_count || 0} accent="red" icon={XCircle} />
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-xs text-white">
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {(["ALL", "CONFIRMED", "CANDIDATE", "DISMISSED"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                statusFilter === st ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              {st === "ALL" ? "All Gangs" : st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by gang name, leader, or member..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:border-purple-500 focus:outline-none"
            />
          </div>
          <Button
            size="sm"
            onClick={() => setShowTagModal(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Tag Entity
          </Button>
        </div>
      </div>

      {/* Manual Tag Entity Modal */}
      {showTagModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-mono">
          <Card className="bg-slate-900 border-slate-700 text-white w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-purple-400" /> Ground Truth Gang Override
            </h3>
            <p className="text-xs text-slate-400">
              Manually assign a suspect entity to <strong className="text-purple-300">{selectedGang?.name}</strong>.
            </p>
            <input
              type="text"
              value={tagEntityName}
              onChange={(e) => setTagEntityName(e.target.value)}
              placeholder="Enter suspect name (e.g. Md. Ranbir Bhalla)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowTagModal(false)} className="border-slate-700 text-slate-300">
                Cancel
              </Button>
              <Button size="sm" onClick={handleTagEntity} className="bg-purple-600 hover:bg-purple-500">
                Confirm Tag
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 2-Column Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Gang Cards */}
        <div className="lg:col-span-5 space-y-3 max-h-[720px] overflow-y-auto pr-1">
          {filteredGangs.length === 0 && (
            <div className="text-center p-12 text-slate-500 font-mono text-xs">
              No gangs found matching your filters.
            </div>
          )}
          {filteredGangs.map((gang) => {
            const isSelected = selectedGang?.gang_id === gang.gang_id;
            const gc = getGangColor(gang.gang_id);
            return (
              <Card
                key={gang.gang_id}
                onClick={() => setSelectedGang(gang)}
                className={`space-y-3 cursor-pointer transition-all border ${
                  isSelected
                    ? "bg-slate-900 border-purple-500 shadow-xl ring-2 ring-purple-500/40"
                    : "bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:shadow-lg"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: gc.hex, boxShadow: `0 0 6px ${gc.hex}` }}
                    />
                    <Badge variant={gang.status === "CONFIRMED" ? "critical" : "moderate"}>
                      {gang.gang_id}
                    </Badge>
                    <h4 className="text-sm font-bold text-white">{gang.name}</h4>
                  </div>
                  <Badge
                    variant={gang.status === "CONFIRMED" ? "critical" : gang.status === "DISMISSED" ? "default" : "moderate"}
                    className="uppercase font-mono text-[10px]"
                  >
                    {gang.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono text-xs p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Members</span>
                    <strong className="text-white text-sm">{gang.member_count}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Ring Leader</span>
                    <strong className="text-amber-400 truncate block text-[11px]">{gang.ring_leader}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Threat Score</span>
                    <strong className="text-red-400 text-sm">{gang.aggregate_threat_score.toFixed(1)}</strong>
                  </div>
                </div>

                {/* Primary Locations */}
                {gang.primary_locations && gang.primary_locations.length > 0 && (
                  <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                    <MapPin className="w-3 h-3 text-slate-500 mt-0.5" />
                    {gang.primary_locations.slice(0, 3).map((loc, i) => (
                      <span key={i} className="text-slate-400">{loc}{i < Math.min(gang.primary_locations!.length, 3) - 1 ? " •" : ""}</span>
                    ))}
                  </div>
                )}

                {/* Member Roster Tags */}
                <div className="font-mono text-xs space-y-1">
                  <div className="flex flex-wrap gap-1">
                    {gang.members.slice(0, 4).map((m, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300">
                        {m}
                      </span>
                    ))}
                    {gang.members.length > 4 && (
                      <span className="px-2 py-0.5 bg-slate-800/60 rounded text-[10px] text-slate-500">
                        +{gang.members.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                  <div className="flex items-center gap-1.5">
                    {gang.status !== "CONFIRMED" && (
                      <Button
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleConfirm(gang.gang_id); }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] py-1 px-2.5"
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Confirm
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGang(gang);
                        setIsRenaming(true);
                      }}
                      className="bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800 text-[11px] py-1 px-2.5"
                    >
                      <Edit3 className="w-3 h-3 mr-1" /> Rename
                    </Button>
                    {gang.status !== "DISMISSED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); handleDismiss(gang.gang_id); }}
                        className="bg-slate-950 border-red-900/50 text-red-400 hover:bg-red-950 text-[11px] py-1 px-2.5"
                      >
                        <XCircle className="w-3 h-3 mr-1" /> Dismiss
                      </Button>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {gang.date_first_detected}
                  </span>
                </div>

                {/* Inline Rename Form */}
                {isRenaming && selectedGang?.gang_id === gang.gang_id && (
                  <div className="pt-2 flex gap-2 font-mono" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={renameInput}
                      onChange={(e) => setRenameInput(e.target.value)}
                      placeholder={`New name for ${gang.name}...`}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:border-purple-500 focus:outline-none"
                      autoFocus
                    />
                    <Button size="sm" onClick={() => handleRename(gang.gang_id)} className="bg-purple-600 text-xs">Save</Button>
                    <Button size="sm" variant="outline" onClick={() => { setIsRenaming(false); setRenameInput(""); }} className="text-xs border-slate-700">Cancel</Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Right Column: Gang Internal Sub-Graph Visualizer */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="bg-slate-950 border-slate-800 p-0 relative overflow-hidden min-h-[620px] flex flex-col shadow-2xl">
            {/* Graph Header */}
            <div className="p-3 border-b border-slate-800 bg-slate-900/90 flex justify-between items-center text-xs font-mono">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: gangColor.hex, boxShadow: `0 0 8px ${gangColor.hex}` }}
                />
                <Network className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-white uppercase tracking-wider">
                  {subGraph?.gang_name || selectedGang?.name || "Select a Gang"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="moderate" className="font-mono text-[10px]">
                  {subGraph?.total_nodes || 0} Suspects • {subGraph?.total_edges || 0} Links
                </Badge>
                {/* Canvas Controls */}
                <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                  <button onClick={() => setTransform(p => ({ ...p, scale: Math.min(2.5, p.scale + 0.15) }))} className="p-1 text-slate-400 hover:text-white" title="Zoom In">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] text-slate-400 px-1">{Math.round(transform.scale * 100)}%</span>
                  <button onClick={() => setTransform(p => ({ ...p, scale: Math.max(0.4, p.scale - 0.15) }))} className="p-1 text-slate-400 hover:text-white" title="Zoom Out">
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-[1px] h-3 bg-slate-800 mx-0.5" />
                  <button onClick={() => setTransform({ x: 0, y: 0, scale: 1.0 })} className="p-1 text-slate-400 hover:text-white" title="Reset">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Canvas Area */}
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onWheel={handleWheel}
              className={`flex-1 relative bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:22px_22px] min-h-[550px] overflow-hidden ${
                isPanning ? "cursor-grabbing" : "cursor-grab"
              }`}
            >
              {/* Pan hint */}
              <div className="absolute top-3 left-3 pointer-events-none bg-slate-900/80 backdrop-blur border border-slate-800/80 rounded-md px-2.5 py-1.5 text-[10px] font-mono text-slate-400 z-10">
                🖱️ Drag canvas • Scroll to zoom • Drag nodes
              </div>

              {(!subGraph || subGraph.nodes.length === 0) && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-mono text-xs">
                  <div className="text-center space-y-2">
                    <Network className="w-10 h-10 mx-auto text-slate-700" />
                    <p>Select a gang to visualise its member network</p>
                  </div>
                </div>
              )}

              {subGraph && subGraph.nodes.length > 0 && (
                <div
                  style={{
                    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                    transformOrigin: "center center",
                    width: "500px",
                    height: "460px",
                    position: "relative"
                  }}
                >
                  {/* SVG: Shaded cluster zone + member-to-member edges */}
                  <svg className="w-full h-full absolute inset-0 overflow-visible pointer-events-none">
                    {/* Syndicate territory background */}
                    <circle
                      cx={240}
                      cy={220}
                      r={200}
                      fill={`${gangColor.hex}08`}
                      stroke={`${gangColor.hex}25`}
                      strokeWidth={1.5}
                      strokeDasharray="6 4"
                    />
                    <text
                      x={240}
                      y={32}
                      fill={gangColor.hex}
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                      opacity={0.6}
                      letterSpacing="1.5"
                    >
                      {selectedGang?.name?.toUpperCase()}
                    </text>

                    {/* Render edges from subgraph */}
                    {(subGraph.edges || []).map((edge, i) => {
                      const p1 = nodePositions[edge.source];
                      const p2 = nodePositions[edge.target];
                      if (!p1 || !p2) return null;
                      const isHovered = hoveredMember === edge.source || hoveredMember === edge.target;
                      const midX = (p1.x + p2.x) / 2;
                      const midY = (p1.y + p2.y) / 2;
                      return (
                        <g key={i}>
                          {isHovered && (
                            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                              stroke={gangColor.hex} strokeWidth={6} strokeOpacity={0.2} />
                          )}
                          <line
                            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                            stroke={isHovered ? gangColor.hex : "#334155"}
                            strokeWidth={isHovered ? 2.5 : 1.5}
                            strokeOpacity={isHovered ? 0.9 : 0.5}
                          />
                          {isHovered && (
                            <g transform={`translate(${midX},${midY})`}>
                              <rect x={-18} y={-8} width={36} height={16} rx={4}
                                fill="#020617" stroke={gangColor.hex} strokeWidth={1} opacity={0.9} />
                              <text x={0} y={3.5} fill={gangColor.hex} fontSize="9" fontWeight="bold"
                                fontFamily="monospace" textAnchor="middle">
                                📞 {edge.total_calls}
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}

                    {/* Fallback: draw all-to-all connections if no edges */}
                    {(!subGraph.edges || subGraph.edges.length === 0) &&
                      subGraph.nodes.map((node, i) =>
                        subGraph.nodes.slice(i + 1).map((targetNode, j) => {
                          const p1 = nodePositions[node.id];
                          const p2 = nodePositions[targetNode.id];
                          if (!p1 || !p2) return null;
                          return (
                            <line
                              key={`${node.id}-${targetNode.id}`}
                              x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                              stroke={gangColor.hex}
                              strokeWidth={1.5}
                              strokeOpacity={0.35}
                            />
                          );
                        })
                      )
                    }
                  </svg>

                  {/* HTML: Interactive Member Nodes */}
                  {subGraph.nodes.map((node, idx) => {
                    const pos = nodePositions[node.id];
                    if (!pos) return null;
                    const isLeader = node.label === selectedGang?.ring_leader;
                    const isHovered = hoveredMember === node.id;
                    return (
                      <div
                        key={node.id}
                        onMouseDown={(e) => { e.stopPropagation(); setDraggedNode(node.id); setHoveredMember(node.id); }}
                        onMouseEnter={() => setHoveredMember(node.id)}
                        onMouseLeave={() => { if (draggedNode !== node.id) setHoveredMember(null); }}
                        style={{ left: `${pos.x}px`, top: `${pos.y}px`, transform: "translate(-50%,-50%)" }}
                        className={`absolute cursor-pointer select-none flex flex-col items-center transition-transform duration-150 ${
                          isHovered ? "z-30 scale-115" : "z-10"
                        }`}
                      >
                        {/* Kingpin Label */}
                        {isLeader && (
                          <div className="absolute -top-5 px-1.5 py-0.5 bg-amber-500 text-slate-950 text-[8px] font-extrabold font-mono rounded-full flex items-center gap-0.5 shadow-[0_0_10px_#f59e0b] z-20">
                            <Crown className="w-2.5 h-2.5 fill-slate-950" /> LEADER
                          </div>
                        )}

                        {/* Node Circle */}
                        <div
                          style={{
                            backgroundColor: gangColor.hex,
                            boxShadow: isHovered
                              ? `0 0 22px ${gangColor.hex}, 0 0 8px white`
                              : isLeader
                              ? `0 0 16px ${gangColor.glow}`
                              : `0 0 8px ${gangColor.glow}`
                          }}
                          className={`flex flex-col items-center justify-center rounded-full transition-all ${
                            isLeader ? "w-14 h-14 ring-4 ring-amber-400" : "w-11 h-11"
                          } ${isHovered ? "ring-2 ring-white" : ""}`}
                        >
                          <span className="text-white font-extrabold font-mono text-xs leading-none">{node.threat_score.toFixed(0)}</span>
                          <span className="text-[7px] text-white/75 font-mono">PTS</span>
                        </div>

                        {/* Label Pill */}
                        <div className={`mt-1 px-2 py-0.5 rounded-md border font-mono text-center shadow-md max-w-[110px] transition-all ${
                          isHovered
                            ? "bg-slate-900/95 border-slate-600 text-white font-bold"
                            : "bg-slate-950/90 border-slate-800/80 text-slate-300"
                        }`}>
                          <p className="text-[9px] leading-tight truncate">{node.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom: Selected Gang Inspector Strip */}
            {selectedGang && (
              <div className="border-t border-slate-800 bg-slate-900/80 p-3 font-mono text-xs flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-4 text-slate-300">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Status</span>
                    <Badge variant={selectedGang.status === "CONFIRMED" ? "critical" : "moderate"} className="mt-0.5 text-[10px]">
                      {selectedGang.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Agg. Threat</span>
                    <strong className="text-red-400">{selectedGang.aggregate_threat_score.toFixed(1)}/100</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Leader Phone</span>
                    <strong className="text-blue-400">{selectedGang.leader_phone}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Detected</span>
                    <strong className="text-slate-300">{selectedGang.date_first_detected}</strong>
                  </div>
                </div>
                <Link href={`/dossiers?suspect=${encodeURIComponent(selectedGang.ring_leader)}`}>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-mono flex items-center gap-1.5">
                    Open Leader Dossier <ArrowUpRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
