import {
  ThreatLeaderboardResponse,
  SimulationWeightsRequest,
  SimulationResponse,
  CDRSummaryResponse,
  NetworkGraphResponse,
  CCTVMeetingsResponse,
  CrimeRingsResponse,
  FinancialIntelligenceResponse,
  NocturnalAnomaliesResponse,
  SurveillanceHeatmapResponse,
  AlertsResponse,
  SuspectDossierDetails,
  SearchResultResponse,
  GangListResponse,
  GangSubGraphResponse
} from "../types";

import {
  fallbackLeaderboard,
  fallbackCDRPairs,
  fallbackCDRGraph,
  fallbackCCTVMeetings,
  fallbackGangs,
  fallbackFinancial,
  fallbackNocturnal,
  fallbackSurveillance,
  fallbackAlerts,
  fallbackDossier,
  fallbackTimeline,
  fallbackSocial,
  fallbackGeo
} from "./mockData";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL !== undefined
  ? process.env.NEXT_PUBLIC_API_URL
  : (typeof window !== "undefined" ? "" : "http://127.0.0.1:8080");

async function fetchAPI<T>(endpoint: string, options?: RequestInit, fallbackData?: T): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      ...options,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(`API Error [${res.status}]: ${errorText || res.statusText}`);
    }

    return await res.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn(`Backend fetch failed for ${endpoint} (Using demo fallback intelligence data):`, err.message);

    if (fallbackData !== undefined) {
      return fallbackData;
    }
    throw err;
  }
}

export const api = {
  // Health Check
  getHealth: () =>
    fetchAPI<{ status: string; version: string; total_suspects: number }>(
      "/api/health",
      undefined,
      { status: "HEALTHY (DEMO MODE)", version: "2.0.0", total_suspects: 10 }
    ),

  // Module 1: Threat Leaderboard & Simulation
  getThreatLeaderboard: () =>
    fetchAPI<ThreatLeaderboardResponse>("/api/threat/leaderboard", undefined, fallbackLeaderboard),

  simulateThreatWeights: (weights: SimulationWeightsRequest) =>
    fetchAPI<SimulationResponse>("/api/threat/simulate", {
      method: "POST",
      body: JSON.stringify(weights),
    }, {
      total_weight: weights.cctv_weight + weights.cdr_weight + weights.fir_weight + weights.criminal_weight + weights.financial_weight + weights.surveillance_weight,
      simulated_leaderboard: fallbackLeaderboard.leaderboard
    }),

  // Module 2: CDR Interaction Network
  getCDRPairs: () =>
    fetchAPI<CDRSummaryResponse>("/api/cdr/pairs", undefined, fallbackCDRPairs),

  getCDRGraph: () =>
    fetchAPI<NetworkGraphResponse>("/api/cdr/graph", undefined, fallbackCDRGraph),

  // Module 3: CCTV Co-Location Encounters
  getCCTVMeetings: () =>
    fetchAPI<CCTVMeetingsResponse>("/api/cctv/meetings", undefined, fallbackCCTVMeetings),

  // Module 4: Crime Rings & Gangs
  getCrimeRings: () =>
    fetchAPI<CrimeRingsResponse>("/api/crime-rings/list", undefined, {
      total_rings: fallbackGangs.total_gangs,
      rings: fallbackGangs.gangs.map(g => ({
        syndicate_id: g.gang_id,
        ring_leader: g.ring_leader,
        leader_phone: g.leader_phone,
        member_count: g.member_count,
        members: g.members,
        threat_level: "HIGH"
      }))
    }),

  getGangs: () =>
    fetchAPI<GangListResponse>("/api/gangs/list", undefined, fallbackGangs),

  getGangSubGraph: (gangId: string) =>
    fetchAPI<GangSubGraphResponse>(`/api/gangs/${encodeURIComponent(gangId)}/subgraph`, undefined, {
      gang_id: gangId,
      gang_name: `Sub-Graph: ${gangId}`,
      total_nodes: fallbackCDRGraph.nodes.length,
      total_edges: fallbackCDRGraph.edges.length,
      nodes: fallbackCDRGraph.nodes,
      edges: fallbackCDRGraph.edges
    }),

  confirmGang: (gangId: string) =>
    fetchAPI<{ status: string; message: string }>(`/api/gangs/${encodeURIComponent(gangId)}/confirm`, { method: "POST" }, { status: "SUCCESS", message: "Gang confirmed" }),

  renameGang: (gangId: string, newName: string) =>
    fetchAPI<{ status: string; message: string }>(`/api/gangs/${encodeURIComponent(gangId)}/rename`, { method: "POST", body: JSON.stringify({ new_name: newName }) }, { status: "SUCCESS", message: "Gang renamed" }),

  mergeGangs: (primaryId: string, secondaryId: string) =>
    fetchAPI<{ status: string; message: string }>("/api/gangs/merge", { method: "POST", body: JSON.stringify({ primary_gang_id: primaryId, secondary_gang_id: secondaryId }) }, { status: "SUCCESS", message: "Gangs merged" }),

  dismissGang: (gangId: string) =>
    fetchAPI<{ status: string; message: string }>(`/api/gangs/${encodeURIComponent(gangId)}/dismiss`, { method: "POST" }, { status: "SUCCESS", message: "Gang dismissed" }),

  tagEntityGang: (entityName: string, targetGangId: string) =>
    fetchAPI<{ status: string; message: string }>("/api/gangs/tag-entity", { method: "POST", body: JSON.stringify({ entity_name: entityName, target_gang_id: targetGangId }) }, { status: "SUCCESS", message: "Entity tagged" }),

  // Module 5: Financial Intelligence & Money Trails
  getFinancialIntelligence: () =>
    fetchAPI<FinancialIntelligenceResponse>("/api/financial/summary", undefined, fallbackFinancial),

  // Module 6: Nocturnal Call Anomalies
  getNocturnalAnomalies: () =>
    fetchAPI<NocturnalAnomaliesResponse>("/api/nocturnal/anomalies", undefined, fallbackNocturnal),

  // Module 7: Surveillance Heatmap & Observations
  getSurveillanceHeatmap: () =>
    fetchAPI<SurveillanceHeatmapResponse>("/api/surveillance/reports", undefined, fallbackSurveillance),

  // Module 8: Dossiers, Alerts & Search
  getAlerts: () =>
    fetchAPI<AlertsResponse>("/api/dossiers/alerts", undefined, fallbackAlerts),

  getSuspectDossier: (name: string) =>
    fetchAPI<SuspectDossierDetails>(`/api/dossiers/suspect?name=${encodeURIComponent(name)}`, undefined, { ...fallbackDossier, suspect_name: name }),

  getSuspectTimeline: (name: string) =>
    fetchAPI<import("../types").TimelineResponse>(`/api/dossiers/timeline?name=${encodeURIComponent(name)}`, undefined, { ...fallbackTimeline, suspect_name: name }),

  searchIntelligence: (query: string) =>
    fetchAPI<SearchResultResponse>(`/api/dossiers/search?q=${encodeURIComponent(query)}`, undefined, {
      query,
      total_matches: 4,
      fir_matches: [{ fir_number: "0254/2026", accused_name: "Md. Ranbir Bhalla", location: "Byculla" }],
      cdr_matches: [{ caller: "Md. Ranbir Bhalla", receiver: "Md. Teerth Bhargava" }],
      cctv_matches: [{ camera_id: "MH-CCTV-9890", location: "Byculla" }]
    }),

  // Module 9: Social Media & Digital Footprint
  getSocialAnalytics: () =>
    fetchAPI<import("../types").SocialMediaResponse>("/api/social-analytics/footprint", undefined, fallbackSocial),

  // NLP FIR Parser
  extractFIRNLP: (firText: string, firNumber?: string) =>
    fetchAPI<import("../types").FIRNLPResponse>("/api/fir/extract", {
      method: "POST",
      body: JSON.stringify({ fir_text: firText, fir_number: firNumber || "" })
    }, {
      fir_id: "NLP-DEMO",
      fir_number: firNumber || "FIR-0254/2026",
      raw_text: firText,
      entities: [
        { text: "Md. Ranbir Bhalla", category: "PERSON", confidence: 0.95 },
        { text: "Md. Teerth Bhargava", category: "PERSON", confidence: 0.95 },
        { text: "Byculla", category: "LOCATION", confidence: 0.90 },
        { text: "IPC Section 384", category: "IPC_SECTION", confidence: 0.98 }
      ],
      suspects: ["Md. Ranbir Bhalla", "Md. Teerth Bhargava"],
      co_accused: ["Md. Teerth Bhargava"],
      locations: ["Byculla", "Venus Wine Shop"],
      crime_types: ["Extortion & Protection Racket"],
      relationships: [
        { source: "Md. Ranbir Bhalla", target: "Md. Teerth Bhargava", relation_type: "CO_ACCUSED" }
      ]
    }),

  // Shared Geo Points
  getGeoPoints: (category?: string) =>
    fetchAPI<import("../types").GeoPointsResponse>(`/api/geo/points${category ? `?category=${encodeURIComponent(category)}` : ""}`, undefined, fallbackGeo),

  // Core AI & ML Graph Proofs
  getGraphProofs: (louvainRes: number = 1.0, pagerankAlpha: number = 0.85) =>
    fetchAPI<any>(`/api/graph-proof/metrics?louvain_resolution=${louvainRes}&pagerank_alpha=${pagerankAlpha}`),

  getShortestPath: (source: string, target: string) =>
    fetchAPI<any>(`/api/graph-proof/shortest-path?source=${encodeURIComponent(source)}&target=${encodeURIComponent(target)}`),

  // FIR Samples
  getFIRSamples: () =>
    fetchAPI<any[]>("/api/fir/samples"),

  // Multi-Source Ingestion
  ingestCDR: (data: string, format: string = "csv") =>
    fetchAPI<any>("/api/core-ai/ingest/cdr", {
      method: "POST",
      body: JSON.stringify({ data, format })
    }),

  ingestFinancial: (data: string, format: string = "csv") =>
    fetchAPI<any>("/api/core-ai/ingest/financial", {
      method: "POST",
      body: JSON.stringify({ data, format })
    }),

  ingestFIR: (firText: string, firNumber?: string) =>
    fetchAPI<any>("/api/core-ai/ingest/fir", {
      method: "POST",
      body: JSON.stringify({ fir_text: firText, fir_number: firNumber || "FIR-LIVE-2026" })
    }),

  // Statistical Anomaly Detection
  getNocturnalZScore: (zThreshold: number = 2.0) =>
    fetchAPI<any>(`/api/core-ai/anomaly/nocturnal?z_threshold=${zThreshold}`),

  getFinancialIQR: () =>
    fetchAPI<any>("/api/core-ai/anomaly/financial"),

  getSpatioTemporalClusters: () =>
    fetchAPI<any>("/api/core-ai/anomaly/spatiotemporal"),

  // Role-Based Access Control & Audit
  getAuthUsers: () =>
    fetchAPI<any[]>("/api/core-ai/auth/users"),

  loginOfficer: (username: string) =>
    fetchAPI<any>("/api/core-ai/auth/login", {
      method: "POST",
      body: JSON.stringify({ username })
    }),

  getAuditTrail: (limit: number = 50) =>
    fetchAPI<any[]>(`/api/core-ai/auth/audit-trail?limit=${limit}`),

  // Explainable AI (XAI)
  explainSuspect: (suspect: string) =>
    fetchAPI<any>(`/api/core-ai/explain/suspect?suspect=${encodeURIComponent(suspect)}`),

  // Big Data Benchmark
  runStressTest: (records: number = 50000) =>
    fetchAPI<any>(`/api/core-ai/benchmark/stress-test?records=${records}`),

  // 360° Dossier helpers — convenience aliases
  getThreatIndex: () =>
    fetchAPI<any[]>("/api/threat/leaderboard", undefined, []).then((res: any) =>
      Array.isArray(res) ? res : (res?.leaderboard ?? [])
    ),

  getCDRSummary: () =>
    fetchAPI<any>("/api/cdr/pairs", undefined, { pair_summary: [] }).then((res: any) =>
      Array.isArray(res) ? res : (res?.pair_summary ?? res?.pairs ?? [])
    ),
};
