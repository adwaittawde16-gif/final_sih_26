"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/shared/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { api } from "@/lib/api";
import { Network, Activity, GitFork, ShieldAlert, Cpu, RefreshCw, Zap, Layers, Share2, Compass, AlertOctagon, Download } from "lucide-react";

export default function GraphAlgorithmsProofPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [louvainRes, setLouvainRes] = useState(1.0);
  const [pagerankAlpha, setPagerankAlpha] = useState(0.85);

  // Shortest path calculator
  const [sourceSuspect, setSourceSuspect] = useState("Md. Ranbir Bhalla");
  const [targetSuspect, setTargetSuspect] = useState("Md Hardik Kant");
  const [pathResult, setPathResult] = useState<any>(null);
  const [pathLoading, setPathLoading] = useState(false);

  const handleExportGEXF = () => {
    if (!data?.nodes || !data?.edges) return;
    const nodes = data.nodes
      .map((n: any) =>
        `    <node id="${n.node_id}" label="${n.node_id}">
      <attvalues>
        <attvalue for="threat_score" value="${n.threat_score ?? n.pagerank ?? 0}" />
        <attvalue for="community" value="${n.community ?? 0}" />
        <attvalue for="pagerank" value="${n.pagerank ?? 0}" />
      </attvalues>
    </node>`
      )
      .join("\n");
    const edges = data.edges
      .map((e: any, i: number) =>
        `    <edge id="${i}" source="${e.source}" target="${e.target}" weight="${e.weight ?? 1}" />`
      )
      .join("\n");
    const gexf = `<?xml version="1.0" encoding="UTF-8"?>
<gexf xmlns="http://gexf.net/1.3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://gexf.net/1.3 http://gexf.net/1.3/gexf.xsd" version="1.3">
  <meta lastmodifieddate="${new Date().toISOString().split("T")[0]}">
    <creator>Brihanmumbai Police - Criminal Intelligence System</creator>
    <description>Criminal Network Graph — Louvain Community Detection</description>
  </meta>
  <graph defaultedgetype="undirected">
    <attributes class="node">
      <attribute id="threat_score" title="Threat Score" type="float" />
      <attribute id="community" title="Community" type="integer" />
      <attribute id="pagerank" title="PageRank" type="float" />
    </attributes>
    <nodes>
${nodes}
    </nodes>
    <edges>
${edges}
    </edges>
  </graph>
</gexf>`;
    const blob = new Blob([gexf], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `criminal_network_${new Date().toISOString().split("T")[0]}.gexf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fetchGraphProof = async (resVal = louvainRes, alphaVal = pagerankAlpha) => {
    setLoading(true);
    try {
      const res = await api.getGraphProofs(resVal, alphaVal);
      setData(res);
      if (res?.nodes?.length >= 2) {
        setSourceSuspect(res.nodes[0].node_id);
        setTargetSuspect(res.nodes[1].node_id);
      }
    } catch (err) {
      console.error("Failed to load graph proofs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphProof();
  }, []);

  const handleComputePath = async () => {
    if (!sourceSuspect || !targetSuspect) return;
    setPathLoading(true);
    try {
      const res = await api.getShortestPath(sourceSuspect, targetSuspect);
      setPathResult(res);
    } catch (err) {
      console.error("Shortest path error:", err);
    } finally {
      setPathLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header
        title="Mathematical Graph Algorithms & Network Proof Engine"
        description="Live execution of Louvain Modularity, PageRank, Betweenness Centrality, Articulation Points & Dijkstra Routing."
      />

      {/* Control & Hyperparameter Bar */}
      <Card className="border-slate-800 bg-slate-900/90 text-white">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Louvain Modularity Resolution (γ = {louvainRes})
              </label>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={louvainRes}
                onChange={(e) => setLouvainRes(parseFloat(e.target.value))}
                className="mt-1 w-44 accent-blue-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                PageRank Damping Factor (α = {pagerankAlpha})
              </label>
              <input
                type="range"
                min="0.5"
                max="0.99"
                step="0.05"
                value={pagerankAlpha}
                onChange={(e) => setPagerankAlpha(parseFloat(e.target.value))}
                className="mt-1 w-44 accent-indigo-500"
              />
            </div>
          </div>

          <Button
            onClick={() => fetchGraphProof(louvainRes, pagerankAlpha)}
            className="bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500"
          >
            <RefreshCw className="mr-2 size-3.5" /> Re-Compute Live Algorithms
          </Button>
        </CardContent>
      </Card>

      {loading && <Loading message="Computing Live NetworkX Centralities & Louvain Community Partitions..." />}

      {!loading && data && (
        <>
          {/* Mathematical Proof KPIs */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Modularity Score Q</p>
              <p className="mt-1 text-2xl font-black text-emerald-400">{data.summary.modularity_score_q}</p>
              <p className="mt-0.5 text-[10px] text-slate-500">Newman-Girvan Q &gt; 0.3</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Detected Syndicates</p>
              <p className="mt-1 text-2xl font-black text-blue-400">{data.summary.num_communities}</p>
              <p className="mt-0.5 text-[10px] text-slate-500">Louvain partitions</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Articulation Points</p>
              <p className="mt-1 text-2xl font-black text-rose-400">{data.summary.articulation_point_count}</p>
              <p className="mt-0.5 text-[10px] text-slate-500">Cut-vertices (bottlenecks)</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Network Diameter</p>
              <p className="mt-1 text-2xl font-black text-amber-400">{data.summary.network_diameter} hops</p>
              <p className="mt-0.5 text-[10px] text-slate-500">Max geodesic distance</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg Shortest Path</p>
              <p className="mt-1 text-2xl font-black text-purple-400">{data.summary.avg_shortest_path_length}</p>
              <p className="mt-0.5 text-[10px] text-slate-500">Characteristic path length</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Graph Density</p>
              <p className="mt-1 text-2xl font-black text-cyan-400">{data.summary.network_density}</p>
              <p className="mt-0.5 text-[10px] text-slate-500">Total edges: {data.summary.total_edges}</p>
            </div>
          </div>

          {/* Mathematical Formulas Transparency Box */}
          <Card className="border-blue-900/40 bg-blue-950/20 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                <Cpu className="size-4" /> Mathematical Formulations Executed Live
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4 font-mono text-[11px]">
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <p className="font-bold text-slate-400">Louvain Modularity (Q)</p>
                <p className="mt-1 text-blue-300">{data.mathematical_formulas?.modularity}</p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <p className="font-bold text-slate-400">Betweenness Centrality (C_B)</p>
                <p className="mt-1 text-emerald-300">{data.mathematical_formulas?.betweenness}</p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <p className="font-bold text-slate-400">PageRank Centrality (PR)</p>
                <p className="mt-1 text-amber-300">{data.mathematical_formulas?.pagerank}</p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <p className="font-bold text-slate-400">Closeness Centrality (C_C)</p>
                <p className="mt-1 text-purple-300">{data.mathematical_formulas?.closeness}</p>
              </div>
            </CardContent>
          </Card>

          {/* Shortest Path Concurrency Inspector */}
          <Card className="border-slate-800 bg-slate-900/90 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Compass className="size-4 text-emerald-400" /> Dijkstra Multi-Hop Conspiracy Path Inspector
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={sourceSuspect}
                  onChange={(e) => setSourceSuspect(e.target.value)}
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
                >
                  {data.nodes.map((n: any) => (
                    <option key={n.node_id} value={n.node_id}>{n.node_id}</option>
                  ))}
                </select>
                <span className="text-xs text-slate-500 font-bold">TO</span>
                <select
                  value={targetSuspect}
                  onChange={(e) => setTargetSuspect(e.target.value)}
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
                >
                  {data.nodes.map((n: any) => (
                    <option key={n.node_id} value={n.node_id}>{n.node_id}</option>
                  ))}
                </select>
                <Button
                  onClick={handleComputePath}
                  disabled={pathLoading}
                  className="bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  {pathLoading ? "Calculating Shortest Path..." : "Find Shortest Conspiratorial Hop"}
                </Button>
              </div>

              {pathResult && (
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                  {pathResult.connected ? (
                    <div>
                      <p className="text-xs font-bold text-emerald-400">
                        Shortest Path Found: {pathResult.hop_count} Hops
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {pathResult.path?.map((p: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 font-mono text-xs font-bold text-white">
                              {p}
                            </span>
                            {idx < pathResult.path.length - 1 && (
                              <span className="text-xs text-slate-500">→</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-rose-400">No direct or indirect communication path between selected nodes.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Visual Network Topology Sandbox */}
          <Card className="border-slate-800 bg-slate-900/90 text-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                  <Share2 className="size-4 text-cyan-400" /> Interactive Mathematical Graph Topology Canvas
                </CardTitle>
                <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-amber-400 animate-ping" /> Top-Threat Kingpin</span>
                  <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-rose-500 animate-ping" /> Articulation Cut-Vertex</span>
                  <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-blue-500" /> Syndicate Cluster 1</span>
                  <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-500" /> Syndicate Cluster 2</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative h-80 w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                <svg className="h-full w-full" viewBox="0 0 800 320">
                  <defs>
                    <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>

                  {/* Render Edges */}
                  {data.nodes.slice(0, 16).map((n: any, idx: number) => {
                    const total = Math.min(data.nodes.length, 16);
                    const angle1 = (idx / total) * 2 * Math.PI;
                    const r1 = 110;
                    const x1 = 400 + r1 * Math.cos(angle1);
                    const y1 = 160 + r1 * Math.sin(angle1);

                    const targetIdx = (idx * 3 + 1) % total;
                    const angle2 = (targetIdx / total) * 2 * Math.PI;
                    const x2 = 400 + r1 * Math.cos(angle2);
                    const y2 = 160 + r1 * Math.sin(angle2);

                    const isPathEdge = pathResult?.path && pathResult.path.includes(n.node_id);

                    return (
                      <line
                        key={`edge-${idx}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={isPathEdge ? "#10b981" : "#334155"}
                        strokeWidth={isPathEdge ? "2.5" : "1"}
                        strokeDasharray={isPathEdge ? "4 2" : "none"}
                        className={isPathEdge ? "animate-pulse" : ""}
                      />
                    );
                  })}

                  {/* Render Nodes */}
                  {(() => {
                    const visibleNodes = data.nodes.slice(0, 16);
                    const topNode = visibleNodes.reduce((best: any, curr: any) =>
                      ((curr.threat_score || curr.pagerank || 0) > (best?.threat_score || best?.pagerank || 0) ? curr : best), visibleNodes[0]
                    );

                    return visibleNodes.map((node: any, idx: number) => {
                      const total = visibleNodes.length;
                      const angle = (idx / total) * 2 * Math.PI;
                      const r = 110;
                      const cx = 400 + r * Math.cos(angle);
                      const cy = 160 + r * Math.sin(angle);
                      const nodeRadius = Math.max(6, Math.min(18, node.pagerank * 1500));
                      const isArt = node.is_articulation_point;
                      const isTopThreat = node.node_id === topNode?.node_id;
                      const isSelected = node.node_id === sourceSuspect || node.node_id === targetSuspect;

                      const colors = ["#3b82f6", "#10b981", "#f59e0b", "#a855f7", "#06b6d4", "#ec4899"];
                      const commNum = parseInt(node.community_id.replace("RING-", "")) || 1;
                      const color = colors[(commNum - 1) % colors.length];

                      return (
                        <g key={node.node_id} className="cursor-pointer transition-transform hover:scale-125">
                          {/* Animated Pulse Ring for Top Threat Kingpin */}
                          {isTopThreat && (
                            <>
                              <circle
                                cx={cx}
                                cy={cy}
                                r={nodeRadius + 14}
                                fill="none"
                                stroke="#f59e0b"
                                strokeWidth="2"
                                className="animate-ping"
                                opacity="0.6"
                              />
                              <circle
                                cx={cx}
                                cy={cy}
                                r={nodeRadius + 8}
                                fill="none"
                                stroke="#ef4444"
                                strokeWidth="1.5"
                                strokeDasharray="3 3"
                                opacity="0.9"
                              />
                            </>
                          )}

                          {/* Articulation Point Ring */}
                          {isArt && !isTopThreat && (
                            <circle
                              cx={cx}
                              cy={cy}
                              r={nodeRadius + 6}
                              fill="none"
                              stroke="#f43f5e"
                              strokeWidth="2"
                              className="animate-ping"
                              opacity="0.7"
                            />
                          )}

                          {/* Core Node Circle */}
                          <circle
                            cx={cx}
                            cy={cy}
                            r={nodeRadius}
                            fill={isTopThreat ? "#ef4444" : color}
                            stroke={isSelected ? "#ffffff" : isTopThreat ? "#fbbf24" : isArt ? "#f43f5e" : "#0f172a"}
                            strokeWidth={isSelected || isTopThreat ? "3" : isArt ? "2" : "1.5"}
                          />
                          <text
                            x={cx}
                            y={cy + nodeRadius + 11}
                            textAnchor="middle"
                            fill={isTopThreat ? "#fbbf24" : "#cbd5e1"}
                            fontSize="9"
                            fontFamily="sans-serif"
                            fontWeight={isSelected || isTopThreat ? "bold" : "normal"}
                          >
                            {node.node_id.split(" ").slice(-1)[0]}
                            {isTopThreat ? " ★" : ""}
                          </text>
                        </g>
                      );
                    });
                  })()}
                </svg>
                <div className="absolute bottom-2 left-3 font-mono text-[10px] text-slate-500">
                  Node Size ∝ PageRank PR(u) · Ring Color ∝ Louvain Partition
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Node Centrality Table */}
          <Card className="border-slate-800 bg-slate-900/90 text-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                  <Activity className="size-4 text-blue-400" /> Algorithmic Node Centrality Table ({data.nodes.length} Suspect Nodes)
                </CardTitle>
                <Badge className="bg-slate-800 text-[10px] text-slate-400">
                  Computed via NetworkX C-Extension
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="border-b border-slate-800 bg-slate-950/60 font-mono text-[10px] uppercase text-slate-400">
                    <tr>
                      <th className="p-3">Suspect Name</th>
                      <th className="p-3">Syndicate Ring</th>
                      <th className="p-3">PageRank (PR)</th>
                      <th className="p-3">Betweenness (C_B)</th>
                      <th className="p-3">Degree (k)</th>
                      <th className="p-3">Cut-Vertex (Bottleneck)</th>
                      <th className="p-3">Strategic Role Verdict</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {data.nodes.slice(0, 15).map((node: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="p-3 font-sans font-bold text-white">{node.node_id}</td>
                        <td className="p-3 text-blue-400">{node.community_id}</td>
                        <td className="p-3 text-emerald-400">{node.pagerank}</td>
                        <td className="p-3 text-amber-400">{node.betweenness_centrality}</td>
                        <td className="p-3">{node.degree}</td>
                        <td className="p-3">
                          {node.is_articulation_point ? (
                            <Badge className="bg-rose-950 text-[9px] text-rose-400 border border-rose-800">
                              <AlertOctagon className="mr-1 size-2.5" /> ARTICULATION POINT
                            </Badge>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                        <td className="p-3 font-sans text-xs text-slate-300">{node.strategic_role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
