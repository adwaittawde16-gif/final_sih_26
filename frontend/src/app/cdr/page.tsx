"use client";

import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/shared/Header";
import { LoadingSpinner, ErrorState } from "@/components/ui/loading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { CDRSummaryResponse, NetworkGraphResponse, NetworkNode, NetworkEdge } from "@/types";
import {
  PhoneCall,
  Users,
  Search,
  SlidersHorizontal,
  Layers,
  ShieldAlert,
  Maximize2,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Crown,
  GitCommit,
  Radio,
  Clock,
  ArrowUpRight,
  ExternalLink,
  Filter,
  Eye,
  Activity,
  AlertTriangle
} from "lucide-react";

// Syndicate Color & Layout Quadrant Config
interface SyndicateConfig {
  name: string;
  short: string;
  bg: string;
  border: string;
  glow: string;
  hex: string;
  zoneBg: string;
  zoneBorder: string;
  center: { x: number; y: number };
}

const SYNDICATES: Record<string, SyndicateConfig> = {
  "GANG-01": {
    name: "Gang 1 — Byculla Syndicate",
    short: "NET_ALPHA",
    bg: "bg-red-500",
    border: "border-red-400",
    glow: "rgba(239, 68, 68, 0.4)",
    hex: "#ef4444",
    zoneBg: "rgba(239, 68, 68, 0.04)",
    zoneBorder: "rgba(239, 68, 68, 0.2)",
    center: { x: 300, y: 240 }
  },
  "GANG-02": {
    name: "Gang 2 — Lower Parel Ring",
    short: "NET_BETA",
    bg: "bg-amber-500",
    border: "border-amber-400",
    glow: "rgba(245, 158, 11, 0.4)",
    hex: "#f59e0b",
    zoneBg: "rgba(245, 158, 11, 0.04)",
    zoneBorder: "rgba(245, 158, 11, 0.2)",
    center: { x: 740, y: 240 }
  },
  "GANG-03": {
    name: "Gang 3 — Kurla Mule Network",
    short: "NET_GAMMA",
    bg: "bg-purple-500",
    border: "border-purple-400",
    glow: "rgba(168, 85, 247, 0.4)",
    hex: "#a855f7",
    zoneBg: "rgba(168, 85, 247, 0.04)",
    zoneBorder: "rgba(168, 85, 247, 0.2)",
    center: { x: 300, y: 640 }
  },
  "GANG-04": {
    name: "Gang 4 — Dharavi Extortion Group",
    short: "NET_DELTA",
    bg: "bg-cyan-500",
    border: "border-cyan-400",
    glow: "rgba(6, 182, 212, 0.4)",
    hex: "#06b6d4",
    zoneBg: "rgba(6, 182, 212, 0.04)",
    zoneBorder: "rgba(6, 182, 212, 0.2)",
    center: { x: 740, y: 640 }
  }
};

interface SimNode extends NetworkNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  syndicateKey: string;
  isKingpin: boolean;
  isBridge: boolean;
  connectionsCount: number;
}

export default function CDRNetworkPage() {
  const [summary, setSummary] = useState<CDRSummaryResponse | null>(null);
  const [graphData, setGraphData] = useState<NetworkGraphResponse | null>(null);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<NetworkEdge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Layout & Transform States
  const [layoutMode, setLayoutMode] = useState<"CLUSTERS" | "CONCENTRIC" | "MESH">("CLUSTERS");
  const [transform, setTransform] = useState<{ x: number; y: number; scale: number }>({ x: 0, y: 0, scale: 0.95 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [minThreatScore, setMinThreatScore] = useState(0);
  const [minCallVolume, setMinCallVolume] = useState(0);
  const [criminalsOnly, setCriminalsOnly] = useState(false);
  const [syndicateFilter, setSyndicateFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [quickPillFilter, setQuickPillFilter] = useState<string | null>(null);
  const [showSyndicateZones, setShowSyndicateZones] = useState(true);
  const [showCallBadges, setShowCallBadges] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [sumRes, graphRes] = await Promise.all([
          api.getCDRPairs().catch(() => null),
          api.getCDRGraph().catch(() => null)
        ]);
        setSummary(sumRes);
        setGraphData(graphRes);
        if (graphRes && graphRes.top_key_influencers && graphRes.top_key_influencers.length > 0) {
          setSelectedNode(graphRes.top_key_influencers[0]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load CDR network data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute Initial Force-Directed / Cluster Layout Coordinates
  useEffect(() => {
    if (!graphData || graphData.nodes.length === 0) return;

    const initialPositions: Record<string, { x: number; y: number }> = {};
    const nodes = graphData.nodes;
    const edges = graphData.edges;

    // Group nodes by gang / syndicate
    const gangBuckets: Record<string, NetworkNode[]> = {
      "GANG-01": [],
      "GANG-02": [],
      "GANG-03": [],
      "GANG-04": []
    };

    nodes.forEach((node, idx) => {
      const gId = node.gang_id || (idx % 4 === 0 ? "GANG-01" : idx % 4 === 1 ? "GANG-02" : idx % 4 === 2 ? "GANG-03" : "GANG-04");
      if (gangBuckets[gId]) {
        gangBuckets[gId].push(node);
      } else {
        gangBuckets["GANG-01"].push(node);
      }
    });

    if (layoutMode === "CLUSTERS") {
      // Place each syndicate inside its quadrant with kingpins in cluster center
      Object.entries(gangBuckets).forEach(([gangId, members]) => {
        const syn = SYNDICATES[gangId] || SYNDICATES["GANG-01"];
        const { x: cx, y: cy } = syn.center;

        // Sort members: kingpins first at center
        const sorted = [...members].sort((a, b) => b.threat_score - a.threat_score);

        sorted.forEach((member, i) => {
          if (i === 0) {
            // Kingpin right in the center
            initialPositions[member.id] = { x: cx, y: cy };
          } else {
            // Surrounding orbit with repulsion
            const angle = ((2 * Math.PI) / (sorted.length - 1)) * (i - 1) + (gangId === "GANG-02" || gangId === "GANG-04" ? 0.3 : 0);
            const radius = 100 + (i % 2 === 0 ? 30 : 0);
            initialPositions[member.id] = {
              x: cx + radius * Math.cos(angle),
              y: cy + radius * Math.sin(angle)
            };
          }
        });
      });
    } else if (layoutMode === "CONCENTRIC") {
      // Kingpins in innermost circle, lieutenants in middle, members in outer ring
      const cx = 520;
      const cy = 440;
      const sorted = [...nodes].sort((a, b) => b.threat_score - a.threat_score);

      const tier1 = sorted.slice(0, 4); // Core Kingpins (Radius 120)
      const tier2 = sorted.slice(4, 12); // Lieutenants (Radius 240)
      const tier3 = sorted.slice(12); // Contacts / Mules (Radius 360)

      tier1.forEach((n, i) => {
        const angle = (2 * Math.PI * i) / tier1.length;
        initialPositions[n.id] = { x: cx + 120 * Math.cos(angle), y: cy + 120 * Math.sin(angle) };
      });
      tier2.forEach((n, i) => {
        const angle = (2 * Math.PI * i) / tier2.length;
        initialPositions[n.id] = { x: cx + 240 * Math.cos(angle), y: cy + 240 * Math.sin(angle) };
      });
      tier3.forEach((n, i) => {
        const angle = (2 * Math.PI * i) / Math.max(1, tier3.length);
        initialPositions[n.id] = { x: cx + 360 * Math.cos(angle), y: cy + 360 * Math.sin(angle) };
      });
    } else {
      // MESH / Force Simulated Organic View
      const cx = 520;
      const cy = 440;
      const count = nodes.length;
      nodes.forEach((n, i) => {
        const phi = i * 137.5 * (Math.PI / 180);
        const r = 45 * Math.sqrt(i + 1);
        initialPositions[n.id] = { x: cx + r * Math.cos(phi), y: cy + r * Math.sin(phi) };
      });
    }

    setNodePositions(initialPositions);
  }, [graphData, layoutMode]);

  // Filtered Nodes List
  const filteredNodes = useMemo(() => {
    if (!graphData) return [];
    return graphData.nodes.filter((node, idx) => {
      // Search text filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = node.label.toLowerCase().includes(q);
        const matchesPhone = (node.phone || "").includes(q);
        if (!matchesName && !matchesPhone) return false;
      }

      // Min threat score
      if (node.threat_score < minThreatScore) return false;

      // Criminals only toggle (threat > 50)
      if (criminalsOnly && node.threat_score <= 50) return false;

      // Syndicate filter
      const synKey = node.gang_id || (idx % 4 === 0 ? "GANG-01" : idx % 4 === 1 ? "GANG-02" : idx % 4 === 2 ? "GANG-03" : "GANG-04");
      if (syndicateFilter !== "ALL" && synKey !== syndicateFilter) return false;

      // Role filter
      const isKingpin = node.threat_score > 80 || idx === 0;
      const isBridge = node.betweenness_centrality > 0.4;
      if (roleFilter === "KINGPIN" && !isKingpin) return false;
      if (roleFilter === "BRIDGE" && !isBridge) return false;

      // Quick Pill Filters
      if (quickPillFilter === "KINGPIN" && !isKingpin) return false;
      if (quickPillFilter === "BRIDGE" && !isBridge) return false;
      if (quickPillFilter === "NOCTURNAL" && (node.nocturnal_calls_count || 0) < 20) return false;
      if (quickPillFilter === "HIGH_CALLS" && (node.total_calls_count || 0) < 100) return false;

      return true;
    });
  }, [graphData, searchQuery, minThreatScore, criminalsOnly, syndicateFilter, roleFilter, quickPillFilter]);

  // Filtered Edges List (with minimum call threshold)
  const filteredEdges = useMemo(() => {
    if (!graphData) return [];
    const visibleIds = new Set(filteredNodes.map((n) => n.id));
    return graphData.edges.filter((e) => {
      if (!visibleIds.has(e.source) || !visibleIds.has(e.target)) return false;
      if (e.total_calls < minCallVolume) return false;
      return true;
    });
  }, [graphData, filteredNodes, minCallVolume]);

  // Calculate Map of Direct Neighbors for Focused Highlighting
  const activeFocusId = hoveredNode?.id || selectedNode?.id || null;

  const directNeighborIds = useMemo(() => {
    if (!activeFocusId || !graphData) return new Set<string>();
    const set = new Set<string>();
    set.add(activeFocusId);
    graphData.edges.forEach((e) => {
      if (e.source === activeFocusId) set.add(e.target);
      if (e.target === activeFocusId) set.add(e.source);
    });
    return set;
  }, [activeFocusId, graphData]);

  // Selected Suspect Call Breakdown for Right Panel
  const selectedSuspectCalls = useMemo(() => {
    if (!selectedNode || !graphData) return [];
    const calls: { targetName: string; calls: number; isInterGang: boolean; nocturnal: number }[] = [];

    graphData.edges.forEach((edge) => {
      if (edge.source === selectedNode.id || edge.target === selectedNode.id) {
        const otherId = edge.source === selectedNode.id ? edge.target : edge.source;
        const otherNode = graphData.nodes.find((n) => n.id === otherId);
        const isInterGang = (otherNode?.gang_id || "") !== (selectedNode.gang_id || "");
        calls.push({
          targetName: otherId,
          calls: edge.total_calls,
          isInterGang,
          nocturnal: Math.round(edge.total_calls * 0.25)
        });
      }
    });

    return calls.sort((a, b) => b.calls - a.calls);
  }, [selectedNode, graphData]);

  // Mouse Canvas Interaction Handlers (Pan & Zoom)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (draggedNodeId) return;
    setIsPanning(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNodeId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const rawX = (e.clientX - rect.left - transform.x) / transform.scale;
      const rawY = (e.clientY - rect.top - transform.y) / transform.scale;
      setNodePositions((prev) => ({
        ...prev,
        [draggedNodeId]: { x: rawX, y: rawY }
      }));
    } else if (isPanning) {
      setTransform((prev) => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      }));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setTransform((prev) => {
      const newScale = Math.min(2.5, Math.max(0.35, prev.scale * zoomFactor));
      return { ...prev, scale: newScale };
    });
  };

  const resetView = () => {
    setTransform({ x: 0, y: 0, scale: 0.95 });
  };

  const fitToSelection = useCallback(() => {
    if (!selectedNode || !nodePositions[selectedNode.id] || !containerRef.current) return;
    const pos = nodePositions[selectedNode.id];
    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 600;

    setTransform({
      x: width / 2 - pos.x * 1.3,
      y: height / 2 - pos.y * 1.3,
      scale: 1.3
    });
  }, [selectedNode, nodePositions]);

  if (loading) return <LoadingSpinner label="Computing CDR Call Network Topology & Gang Clusters..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const totalCriminals = graphData?.nodes.filter((n) => n.threat_score > 50).length || 0;
  const totalBridges = graphData?.nodes.filter((n) => n.betweenness_centrality > 0.4).length || 0;

  return (
    <div className="space-y-4">
      {/* Top Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-lg flex flex-wrap items-center justify-between gap-3 text-white font-mono">
        <div className="flex items-center gap-3">
          <Badge variant="critical" className="font-bold text-[11px] px-2.5 py-1 tracking-wider uppercase bg-red-600 border border-red-400">
            POLICE INTELLIGENCE
          </Badge>
          <div>
            <h1 className="text-sm font-bold tracking-wider text-white">NETSENTINEL AI // CDR INTERACTION GRAPH</h1>
            <p className="text-[10px] text-slate-400">Cluster-Separated Criminal Telephony & Comm Mesh</p>
          </div>
        </div>

        {/* Quick KPI Counters Bar */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-2">
            <span className="text-[10px] text-slate-400 uppercase">Entities</span>
            <span className="font-bold text-blue-400 text-sm">{filteredNodes.length} / {graphData?.total_nodes}</span>
          </div>
          <div className="px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-2">
            <span className="text-[10px] text-slate-400 uppercase">Active Links</span>
            <span className="font-bold text-emerald-400 text-sm">{filteredEdges.length}</span>
          </div>
          <div className="px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-2">
            <span className="text-[10px] text-slate-400 uppercase">Bridges</span>
            <span className="font-bold text-amber-400 text-sm">{totalBridges}</span>
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setQuickPillFilter(quickPillFilter === "KINGPIN" ? null : "KINGPIN")}
            className={`px-3 py-1 rounded-lg border transition-all flex items-center gap-1.5 text-[11px] font-bold ${
              quickPillFilter === "KINGPIN"
                ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow ring-1 ring-amber-400"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Crown className="w-3 h-3 text-amber-400" /> Kingpins
          </button>
          <button
            onClick={() => setQuickPillFilter(quickPillFilter === "BRIDGE" ? null : "BRIDGE")}
            className={`px-3 py-1 rounded-lg border transition-all flex items-center gap-1.5 text-[11px] font-bold ${
              quickPillFilter === "BRIDGE"
                ? "bg-blue-500/20 border-blue-400 text-blue-300 shadow ring-1 ring-blue-400"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <GitCommit className="w-3 h-3 text-blue-400" /> Bridges
          </button>
          <button
            onClick={() => setQuickPillFilter(quickPillFilter === "NOCTURNAL" ? null : "NOCTURNAL")}
            className={`px-3 py-1 rounded-lg border transition-all flex items-center gap-1.5 text-[11px] font-bold ${
              quickPillFilter === "NOCTURNAL"
                ? "bg-purple-500/20 border-purple-400 text-purple-300 shadow ring-1 ring-purple-400"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            }`}
          >
            🌙 Nocturnal Callers
          </button>
          <Link href="/dossiers">
            <button className="px-3 py-1 rounded-lg border border-emerald-600 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900 transition-all flex items-center gap-1.5 text-[11px] font-bold">
              🎯 Dossiers
            </button>
          </Link>
        </div>
      </div>

      {/* 3-Column Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: FILTERS & TOPOLOGY CONTROLS (Cols 3) */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="bg-slate-900 border-slate-800 text-white space-y-4 p-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <SlidersHorizontal className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-200">
                FILTER & TOPOLOGY
              </h3>
            </div>

            {/* Layout Mode Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>LAYOUT ENGINE</span>
                <span className="text-blue-400 font-bold">{layoutMode}</span>
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px] font-mono">
                <button
                  onClick={() => setLayoutMode("CLUSTERS")}
                  className={`py-1.5 rounded text-center transition-all ${
                    layoutMode === "CLUSTERS" ? "bg-blue-600 text-white font-bold shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Clusters
                </button>
                <button
                  onClick={() => setLayoutMode("CONCENTRIC")}
                  className={`py-1.5 rounded text-center transition-all ${
                    layoutMode === "CONCENTRIC" ? "bg-blue-600 text-white font-bold shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Hierarchy
                </button>
                <button
                  onClick={() => setLayoutMode("MESH")}
                  className={`py-1.5 rounded text-center transition-all ${
                    layoutMode === "MESH" ? "bg-blue-600 text-white font-bold shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Organic
                </button>
              </div>
            </div>

            {/* Search Box */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Search Suspect / Mobile</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Ranbir, Advik, 9820..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 font-mono focus:border-blue-500 focus:outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs">
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Min Threat Score Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[10px] text-slate-400 uppercase">Min Threat Score:</span>
                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/40 font-bold rounded text-xs">
                  {minThreatScore}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={minThreatScore}
                onChange={(e) => setMinThreatScore(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
            </div>

            {/* Min Call Volume Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[10px] text-slate-400 uppercase">Min Call Frequency:</span>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/40 font-bold rounded text-xs">
                  ≥ {minCallVolume} calls
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={minCallVolume}
                onChange={(e) => setMinCallVolume(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Filter Syndicate Dropdown */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">FILTER GANG / SYNDICATE</label>
              <select
                value={syndicateFilter}
                onChange={(e) => setSyndicateFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
              >
                <option value="ALL">All Gangs & Syndicates</option>
                <option value="GANG-01">Gang 1 — Byculla (NET_ALPHA)</option>
                <option value="GANG-02">Gang 2 — Lower Parel (NET_BETA)</option>
                <option value="GANG-03">Gang 3 — Kurla (NET_GAMMA)</option>
                <option value="GANG-04">Gang 4 — Dharavi (NET_DELTA)</option>
              </select>
            </div>

            {/* Display Options Toggles */}
            <div className="space-y-2 pt-2 border-t border-slate-800 font-mono text-xs">
              <label className="flex items-center justify-between cursor-pointer text-slate-300">
                <span className="text-[11px]">Syndicate Territory Shading</span>
                <input
                  type="checkbox"
                  checked={showSyndicateZones}
                  onChange={(e) => setShowSyndicateZones(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer text-slate-300">
                <span className="text-[11px]">Call Count Edge Badges</span>
                <input
                  type="checkbox"
                  checked={showCallBadges}
                  onChange={(e) => setShowCallBadges(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0"
                />
              </label>
            </div>

            {/* Syndicate Legend */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                GANG COLOR CODES
              </span>
              <div className="space-y-1.5 font-mono text-[11px] text-slate-300">
                {Object.entries(SYNDICATES).map(([key, syn]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: syn.hex, boxShadow: `0 0 6px ${syn.hex}` }} />
                      <span className="truncate max-w-[170px]">{syn.name}</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-bold">{syn.short}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reset / Fit Controls */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 font-mono">
              <Button
                variant="outline"
                size="sm"
                onClick={resetView}
                className="w-full bg-slate-950 border-slate-800 text-slate-300 text-xs hover:bg-slate-800"
              >
                <Maximize2 className="w-3 h-3 mr-1.5" /> Reset View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fitToSelection}
                className="w-full bg-slate-950 border-slate-800 text-blue-400 border-blue-900/50 text-xs hover:bg-blue-950/30"
              >
                <Crosshair className="w-3 h-3 mr-1.5" /> Focus Node
              </Button>
            </div>
          </Card>
        </div>

        {/* CENTER COLUMN: INTERACTIVE VISUAL CANVAS (Cols 6) */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="bg-slate-950 border-slate-800 p-0 relative overflow-hidden min-h-[660px] flex flex-col shadow-2xl">
            {/* Live Canvas Status Bar */}
            <div className="p-3 border-b border-slate-800 bg-slate-900/90 flex justify-between items-center text-xs font-mono select-none">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-slate-200">CRIMINAL INTERACTION MESH</span>
                {activeFocusId && (
                  <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-500/40 bg-blue-950/30">
                    Investigating: {activeFocusId}
                  </Badge>
                )}
              </div>

              {/* Floating Canvas Zoom Toolbar */}
              <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setTransform((p) => ({ ...p, scale: Math.min(2.5, p.scale + 0.15) }))}
                  className="p-1 text-slate-400 hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] text-slate-400 px-1">{Math.round(transform.scale * 100)}%</span>
                <button
                  onClick={() => setTransform((p) => ({ ...p, scale: Math.max(0.35, p.scale - 0.15) }))}
                  className="p-1 text-slate-400 hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <div className="w-[1px] h-3 bg-slate-800 mx-1" />
                <button onClick={resetView} className="p-1 text-slate-400 hover:text-white" title="Reset View">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Interactive Graph Canvas Area */}
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onWheel={handleWheel}
              className={`flex-1 relative bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:24px_24px] min-h-[600px] overflow-hidden ${
                isPanning ? "cursor-grabbing" : "cursor-grab"
              }`}
            >
              {/* Instructions Overlay */}
              <div className="absolute top-3 left-3 pointer-events-none bg-slate-900/80 backdrop-blur border border-slate-800/80 rounded-md px-2.5 py-1.5 text-[10px] font-mono text-slate-400 z-10">
                <span>🖱️ Drag canvas to Pan • Scroll to Zoom • Click or Drag Nodes</span>
              </div>

              {/* World Transform Container */}
              <div
                style={{
                  transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                  transformOrigin: "center center",
                  width: "1050px",
                  height: "880px",
                  position: "relative"
                }}
              >
                {/* SVG Layer: Territories, Cluster Hulls, and Communication Edges */}
                <svg className="w-full h-full absolute inset-0 overflow-visible pointer-events-none">
                  <defs>
                    <linearGradient id="bridgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>

                  {/* Shaded Territory Clusters */}
                  {showSyndicateZones && layoutMode === "CLUSTERS" && (
                    <>
                      {Object.entries(SYNDICATES).map(([key, syn]) => (
                        <g key={key}>
                          <circle
                            cx={syn.center.x}
                            cy={syn.center.y}
                            r={170}
                            fill={syn.zoneBg}
                            stroke={syn.zoneBorder}
                            strokeWidth={1.5}
                            strokeDasharray="4 4"
                          />
                          <text
                            x={syn.center.x}
                            y={syn.center.y - 145}
                            fill={syn.hex}
                            fontSize="11"
                            fontWeight="bold"
                            fontFamily="monospace"
                            textAnchor="middle"
                            opacity={0.7}
                            letterSpacing="1.5"
                          >
                            {syn.short} // {syn.name.toUpperCase()}
                          </text>
                        </g>
                      ))}
                    </>
                  )}

                  {/* Render Call Edges */}
                  {filteredEdges.map((edge) => {
                    const p1 = nodePositions[edge.source];
                    const p2 = nodePositions[edge.target];
                    if (!p1 || !p2) return null;

                    const isConnectedToFocus =
                      activeFocusId && (edge.source === activeFocusId || edge.target === activeFocusId);
                    const isDimmed = activeFocusId && !isConnectedToFocus;

                    const sourceNode = graphData?.nodes.find((n) => n.id === edge.source);
                    const targetNode = graphData?.nodes.find((n) => n.id === edge.target);
                    const isInterGang = (sourceNode?.gang_id || "") !== (targetNode?.gang_id || "");

                    // Dynamic stroke styling based on call count
                    const strokeWidth = isConnectedToFocus
                      ? Math.min(5, 2.5 + edge.total_calls * 0.03)
                      : Math.min(3.5, 1 + edge.total_calls * 0.02);

                    const strokeColor = isConnectedToFocus
                      ? "#38bdf8"
                      : isInterGang
                      ? "url(#bridgeGrad)"
                      : edge.total_calls > 50
                      ? "#f59e0b"
                      : "#475569";

                    const opacity = isDimmed ? 0.12 : isConnectedToFocus ? 0.95 : 0.45;

                    const midX = (p1.x + p2.x) / 2;
                    const midY = (p1.y + p2.y) / 2;

                    return (
                      <g key={`${edge.source}-${edge.target}`}>
                        {/* Glow halo when focused */}
                        {isConnectedToFocus && (
                          <line
                            x1={p1.x}
                            y1={p1.y}
                            x2={p2.x}
                            y2={p2.y}
                            stroke="#38bdf8"
                            strokeWidth={strokeWidth + 4}
                            strokeOpacity={0.25}
                          />
                        )}

                        {/* Main Call Line */}
                        <line
                          x1={p1.x}
                          y1={p1.y}
                          x2={p2.x}
                          y2={p2.y}
                          stroke={strokeColor}
                          strokeWidth={strokeWidth}
                          strokeOpacity={opacity}
                          strokeDasharray={isInterGang ? "6 3" : undefined}
                        />

                        {/* Call Count Badge along edge */}
                        {showCallBadges && (!isDimmed || isConnectedToFocus) && (
                          <g transform={`translate(${midX}, ${midY})`}>
                            <rect
                              x={-22}
                              y={-9}
                              width={44}
                              height={18}
                              rx={4}
                              fill="#020617"
                              stroke={isConnectedToFocus ? "#38bdf8" : "#334155"}
                              strokeWidth={isConnectedToFocus ? 1.5 : 1}
                              opacity={opacity}
                            />
                            <text
                              x={0}
                              y={3.5}
                              fill={isConnectedToFocus ? "#38bdf8" : "#94a3b8"}
                              fontSize="9"
                              fontWeight="bold"
                              fontFamily="monospace"
                              textAnchor="middle"
                              opacity={opacity}
                            >
                              📞 {edge.total_calls}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* HTML Layer: Interactive Nodes with Rich Forensics */}
                {filteredNodes.map((node, idx) => {
                  const pos = nodePositions[node.id];
                  if (!pos) return null;

                  const isSelected = selectedNode?.id === node.id;
                  const isHovered = hoveredNode?.id === node.id;
                  const isNeighbor = directNeighborIds.has(node.id);
                  const isDimmed = activeFocusId && !isNeighbor;

                  const synKey = node.gang_id || (idx % 4 === 0 ? "GANG-01" : idx % 4 === 1 ? "GANG-02" : idx % 4 === 2 ? "GANG-03" : "GANG-04");
                  const syndicate = SYNDICATES[synKey] || SYNDICATES["GANG-01"];
                  const isKingpin = node.threat_score > 80 || idx === 0;
                  const isBridge = node.betweenness_centrality > 0.4;

                  return (
                    <div
                      key={node.id}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setDraggedNodeId(node.id);
                        setSelectedNode(node);
                      }}
                      onMouseEnter={() => setHoveredNode(node)}
                      onMouseLeave={() => setHoveredNode(null)}
                      style={{
                        left: `${pos.x}px`,
                        top: `${pos.y}px`,
                        transform: "translate(-50%, -50%)"
                      }}
                      className={`absolute cursor-pointer select-none transition-transform duration-150 flex flex-col items-center ${
                        isSelected ? "z-30 scale-125" : isHovered ? "z-20 scale-115" : "z-10"
                      } ${isDimmed ? "opacity-25" : "opacity-100"}`}
                    >
                      {/* Node Outer Container */}
                      <div className="relative flex items-center justify-center">
                        {/* Kingpin Outer Halo Crown */}
                        {isKingpin && (
                          <div
                            className="absolute -top-3.5 px-1.5 py-0.5 bg-amber-500 text-slate-950 text-[8px] font-extrabold font-mono rounded-full flex items-center gap-0.5 shadow-[0_0_10px_#f59e0b] z-20"
                          >
                            <Crown className="w-2.5 h-2.5 fill-slate-950" />
                            <span>KINGPIN</span>
                          </div>
                        )}

                        {/* Bridge Connector Badge */}
                        {isBridge && !isKingpin && (
                          <div
                            className="absolute -top-3 px-1.5 py-0.2 bg-blue-500 text-white text-[8px] font-bold font-mono rounded-full flex items-center gap-0.5 shadow-[0_0_8px_#3b82f6] z-20"
                          >
                            <GitCommit className="w-2.5 h-2.5" />
                            <span>BRIDGE</span>
                          </div>
                        )}

                        {/* Node Main Circle */}
                        <div
                          style={{
                            backgroundColor: syndicate.hex,
                            boxShadow: isSelected
                              ? `0 0 25px ${syndicate.hex}, 0 0 10px #ffffff`
                              : isHovered
                              ? `0 0 18px ${syndicate.hex}`
                              : `0 0 10px ${syndicate.glow}`
                          }}
                          className={`w-11 h-11 rounded-full flex flex-col items-center justify-center transition-all ${
                            isSelected
                              ? "ring-4 ring-white"
                              : isNeighbor && activeFocusId
                              ? "ring-2 ring-cyan-400"
                              : isKingpin
                              ? "ring-2 ring-amber-400"
                              : "ring-1 ring-slate-800"
                          }`}
                        >
                          <span className="text-white font-extrabold font-mono text-xs leading-none drop-shadow-md">
                            {node.threat_score.toFixed(0)}
                          </span>
                          <span className="text-[7.5px] text-white/80 font-mono tracking-tighter">
                            PTS
                          </span>
                        </div>
                      </div>

                      {/* Clean Suspect Label Pill Below Node */}
                      <div
                        className={`mt-1 px-2 py-0.5 rounded-md border font-mono text-center shadow-lg max-w-[120px] transition-all ${
                          isSelected
                            ? "bg-blue-950/95 border-blue-400 text-white font-bold"
                            : isHovered
                            ? "bg-slate-900/95 border-slate-700 text-white font-bold"
                            : "bg-slate-950/90 border-slate-800/80 text-slate-300"
                        }`}
                      >
                        <p className="text-[10px] leading-tight truncate">{node.label}</p>
                        <p className="text-[8px] text-slate-400 truncate">{node.phone || "No Mobile"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: FORENSICS & CALL BREAKDOWN INSPECTOR (Cols 3) */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="bg-slate-900 border-slate-800 text-white space-y-4 p-4 shadow-xl sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                SUSPECT FORENSICS
              </h3>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                ● LIVE GRAPH
              </span>
            </div>

            {selectedNode ? (
              <div className="space-y-4 font-mono">
                {/* Header Profile Info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-bold text-white tracking-tight leading-snug">{selectedNode.label}</h3>
                    <p className="text-[10px] text-blue-400">{selectedNode.phone || "No Mobile"}</p>
                    <Badge variant="outline" className="text-[9px] bg-slate-950 border-slate-800 text-slate-300">
                      {selectedNode.gang_name || selectedNode.gang_id || "Independent"}
                    </Badge>
                  </div>

                  {/* Threat Score Card */}
                  <div className="p-2 bg-red-950/80 border border-red-600/80 rounded-lg text-center min-w-[55px] shadow-[0_0_12px_rgba(239,68,68,0.25)_inset]">
                    <span className="text-lg font-extrabold text-red-400 block leading-none">
                      {selectedNode.threat_score.toFixed(0)}
                    </span>
                    <span className="text-[8px] text-red-300 uppercase tracking-widest block font-bold mt-0.5">
                      THREAT
                    </span>
                  </div>
                </div>

                {/* Graph Centrality & Traffic Metrics */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Degree Centrality</span>
                    <span className="font-bold text-blue-400">{selectedNode.degree_centrality.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Betweenness</span>
                    <span className="font-bold text-amber-400">{selectedNode.betweenness_centrality.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Total Calls</span>
                    <span className="font-bold text-emerald-400">{selectedNode.total_calls_count || 0} calls</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Nocturnal Calls</span>
                    <span className="font-bold text-purple-400">{selectedNode.nocturnal_calls_count || 0} calls</span>
                  </div>
                </div>

                {/* Communication Call Network Breakdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 border-b border-slate-800 pb-1">
                    <span className="flex items-center gap-1">
                      <PhoneCall className="w-3 h-3 text-emerald-400" />
                      CONNECTED CALL CONTACTS ({selectedSuspectCalls.length})
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {selectedSuspectCalls.length > 0 ? (
                      selectedSuspectCalls.map((call, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            const target = graphData?.nodes.find((n) => n.id === call.targetName);
                            if (target) setSelectedNode(target);
                          }}
                          className="p-2 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 rounded-lg cursor-pointer transition-all flex items-center justify-between text-xs"
                        >
                          <div className="space-y-0.5 truncate max-w-[150px]">
                            <p className="font-bold text-slate-200 text-[11px] truncate">{call.targetName}</p>
                            <p className="text-[9px] text-slate-400 flex items-center gap-1">
                              {call.isInterGang ? (
                                <span className="text-amber-400 font-bold">⚠️ Cross-Syndicate Link</span>
                              ) : (
                                <span className="text-slate-500">Intra-Gang</span>
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-emerald-400 text-xs">{call.calls} calls</span>
                            <span className="text-[9px] text-purple-400 block">🌙 {call.nocturnal} night</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-500 text-center py-4">No direct call records detected.</p>
                    )}
                  </div>
                </div>

                {/* Jump to Suspect Dossier Button */}
                <Link href={`/dossiers?suspect=${encodeURIComponent(selectedNode.label)}`}>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold py-2.5 rounded-lg shadow-lg flex items-center justify-center gap-1.5">
                    <span>Inspect Case Dossier</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center p-8 text-xs font-mono text-slate-500 space-y-2">
                <Users className="w-8 h-8 mx-auto text-slate-600" />
                <p>Click any suspect node on the graph canvas to inspect communication breakdown and forensic metrics.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
