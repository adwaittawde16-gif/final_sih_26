/**
 * Fallback Demonstration Intelligence Data for Vercel Cloud Deployments
 * Used automatically when local FastAPI backend is unreachable.
 */

import {
  ThreatLeaderboardResponse,
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
  GangSubGraphResponse,
  TimelineResponse,
  SocialMediaResponse,
  FIRNLPResponse,
  GeoPointsResponse
} from "../types";

export const fallbackLeaderboard: ThreatLeaderboardResponse = {
  total_suspects: 10,
  critical_count: 3,
  high_count: 4,
  moderate_count: 2,
  low_count: 1,
  leaderboard: [
    {
      suspect_name: "Md. Ranbir Bhalla",
      phone_number: "+91-2236381844",
      total_threat_score: 94.2,
      cctv_meeting_score: 90.0,
      cdr_network_score: 95.0,
      fir_severity_score: 92.0,
      criminal_history_score: 98.0,
      financial_risk_score: 88.0,
      surveillance_score: 95.0
    },
    {
      suspect_name: "Md. Teerth Bhargava",
      phone_number: "+91-7611970993",
      total_threat_score: 88.5,
      cctv_meeting_score: 85.0,
      cdr_network_score: 90.0,
      fir_severity_score: 89.0,
      criminal_history_score: 86.0,
      financial_risk_score: 91.0,
      surveillance_score: 88.0
    },
    {
      suspect_name: "Md. Vedant Padmanabhan",
      phone_number: "+91-2530358841",
      total_threat_score: 84.1,
      cctv_meeting_score: 80.0,
      cdr_network_score: 88.0,
      fir_severity_score: 82.0,
      criminal_history_score: 85.0,
      financial_risk_score: 84.0,
      surveillance_score: 86.0
    },
    {
      suspect_name: "Md. Pranit Arya",
      phone_number: "+91-7774789752",
      total_threat_score: 79.6,
      cctv_meeting_score: 75.0,
      cdr_network_score: 82.0,
      fir_severity_score: 78.0,
      criminal_history_score: 80.0,
      financial_risk_score: 81.0,
      surveillance_score: 79.0
    },
    {
      suspect_name: "Md. Hardik Kant",
      phone_number: "+91-8482336846",
      total_threat_score: 73.4,
      cctv_meeting_score: 70.0,
      cdr_network_score: 76.0,
      fir_severity_score: 71.0,
      criminal_history_score: 74.0,
      financial_risk_score: 72.0,
      surveillance_score: 75.0
    }
  ]
};

export const fallbackCDRPairs: CDRSummaryResponse = {
  total_cdr_logs: 1420,
  total_interaction_pairs: 48,
  frequent_pairs_count: 12,
  pairs: [
    {
      suspect_1: "Md. Ranbir Bhalla",
      suspect_2: "Md. Teerth Bhargava",
      total_calls: 142,
      total_duration_min: 384,
      nocturnal_calls: 38,
      sms_count: 64,
      incoming_count: 72,
      outgoing_count: 70
    },
    {
      suspect_1: "Md. Ranbir Bhalla",
      suspect_2: "Md. Vedant Padmanabhan",
      total_calls: 98,
      total_duration_min: 245,
      nocturnal_calls: 24,
      sms_count: 42,
      incoming_count: 48,
      outgoing_count: 50
    },
    {
      suspect_1: "Md. Teerth Bhargava",
      suspect_2: "Md. Pranit Arya",
      total_calls: 86,
      total_duration_min: 210,
      nocturnal_calls: 19,
      sms_count: 31,
      incoming_count: 40,
      outgoing_count: 46
    }
  ]
};

export const fallbackCDRGraph: NetworkGraphResponse = {
  total_nodes: 20,
  total_edges: 28,
  top_key_influencers: [
    {
      id: "Md. Ranbir Bhalla",
      label: "Md. Ranbir Bhalla",
      phone: "+91-2236381844",
      threat_score: 94.2,
      degree_centrality: 0.85,
      betweenness_centrality: 0.78,
      total_calls_count: 240,
      connected_entities_count: 7,
      nocturnal_calls_count: 62,
      risk_tier: "CRITICAL",
      gang_id: "GANG-01",
      gang_name: "Gang 1 — Byculla Syndicate"
    },
    {
      id: "Md. Advik Golla",
      label: "Md. Advik Golla",
      phone: "+91-0751400478",
      threat_score: 91.0,
      degree_centrality: 0.76,
      betweenness_centrality: 0.71,
      total_calls_count: 195,
      connected_entities_count: 6,
      nocturnal_calls_count: 48,
      risk_tier: "CRITICAL",
      gang_id: "GANG-02",
      gang_name: "Gang 2 — Lower Parel Ring"
    },
    {
      id: "Md. Azad Mannan",
      label: "Md. Azad Mannan",
      phone: "+91-8472516266",
      threat_score: 87.4,
      degree_centrality: 0.69,
      betweenness_centrality: 0.64,
      total_calls_count: 172,
      connected_entities_count: 5,
      nocturnal_calls_count: 39,
      risk_tier: "CRITICAL",
      gang_id: "GANG-03",
      gang_name: "Gang 3 — Kurla Mule Network"
    },
    {
      id: "Md. Maanav Tailor",
      label: "Md. Maanav Tailor",
      phone: "+91-5405416287",
      threat_score: 84.8,
      degree_centrality: 0.65,
      betweenness_centrality: 0.58,
      total_calls_count: 160,
      connected_entities_count: 5,
      nocturnal_calls_count: 34,
      risk_tier: "HIGH",
      gang_id: "GANG-04",
      gang_name: "Gang 4 — Dharavi Extortion Group"
    },
    {
      id: "Md. Teerth Bhargava",
      label: "Md. Teerth Bhargava",
      phone: "+91-7611970993",
      threat_score: 88.5,
      degree_centrality: 0.72,
      betweenness_centrality: 0.65,
      total_calls_count: 180,
      connected_entities_count: 5,
      nocturnal_calls_count: 41,
      risk_tier: "CRITICAL",
      gang_id: "GANG-01",
      gang_name: "Gang 1 — Byculla Syndicate"
    }
  ],
  nodes: [
    // GANG-01 (Byculla / Alpha)
    { id: "Md. Ranbir Bhalla", label: "Md. Ranbir Bhalla", phone: "+91-2236381844", threat_score: 94.2, degree_centrality: 0.85, betweenness_centrality: 0.78, total_calls_count: 240, connected_entities_count: 7, nocturnal_calls_count: 62, risk_tier: "CRITICAL", gang_id: "GANG-01", gang_name: "Gang 1 — Byculla Syndicate" },
    { id: "Md. Teerth Bhargava", label: "Md. Teerth Bhargava", phone: "+91-7611970993", threat_score: 88.5, degree_centrality: 0.72, betweenness_centrality: 0.65, total_calls_count: 180, connected_entities_count: 5, nocturnal_calls_count: 41, risk_tier: "CRITICAL", gang_id: "GANG-01", gang_name: "Gang 1 — Byculla Syndicate" },
    { id: "Md. Vedant Padmanabhan", label: "Md. Vedant Padmanabhan", phone: "+91-2530358841", threat_score: 84.1, degree_centrality: 0.68, betweenness_centrality: 0.54, total_calls_count: 150, connected_entities_count: 4, nocturnal_calls_count: 35, risk_tier: "HIGH", gang_id: "GANG-01", gang_name: "Gang 1 — Byculla Syndicate" },
    { id: "Md. Zashil Mistry", label: "Md. Zashil Mistry", phone: "+91-9820145612", threat_score: 68.2, degree_centrality: 0.45, betweenness_centrality: 0.28, total_calls_count: 85, connected_entities_count: 3, nocturnal_calls_count: 18, risk_tier: "MODERATE", gang_id: "GANG-01", gang_name: "Gang 1 — Byculla Syndicate" },
    { id: "Md. Samar Nagar", label: "Md. Samar Nagar", phone: "+91-9123847560", threat_score: 62.0, degree_centrality: 0.38, betweenness_centrality: 0.19, total_calls_count: 70, connected_entities_count: 3, nocturnal_calls_count: 14, risk_tier: "MODERATE", gang_id: "GANG-01", gang_name: "Gang 1 — Byculla Syndicate" },

    // GANG-02 (Lower Parel / Beta)
    { id: "Md. Advik Golla", label: "Md. Advik Golla", phone: "+91-0751400478", threat_score: 91.0, degree_centrality: 0.76, betweenness_centrality: 0.71, total_calls_count: 195, connected_entities_count: 6, nocturnal_calls_count: 48, risk_tier: "CRITICAL", gang_id: "GANG-02", gang_name: "Gang 2 — Lower Parel Ring" },
    { id: "Md. Darsh Sampath", label: "Md. Darsh Sampath", phone: "+91-7458410398", threat_score: 78.4, degree_centrality: 0.55, betweenness_centrality: 0.38, total_calls_count: 110, connected_entities_count: 4, nocturnal_calls_count: 24, risk_tier: "HIGH", gang_id: "GANG-02", gang_name: "Gang 2 — Lower Parel Ring" },
    { id: "Md. Pranit Arya", label: "Md. Pranit Arya", phone: "+91-7774789752", threat_score: 79.6, degree_centrality: 0.58, betweenness_centrality: 0.42, total_calls_count: 120, connected_entities_count: 4, nocturnal_calls_count: 28, risk_tier: "HIGH", gang_id: "GANG-02", gang_name: "Gang 2 — Lower Parel Ring" },
    { id: "Md. Hardik Kant", label: "Md. Hardik Kant", phone: "+91-8482336846", threat_score: 73.4, degree_centrality: 0.45, betweenness_centrality: 0.30, total_calls_count: 90, connected_entities_count: 3, nocturnal_calls_count: 15, risk_tier: "MODERATE", gang_id: "GANG-02", gang_name: "Gang 2 — Lower Parel Ring" },
    { id: "Md. Christopher Pillai", label: "Md. Christopher Pillai", phone: "+91-4293362242", threat_score: 65.1, degree_centrality: 0.40, betweenness_centrality: 0.22, total_calls_count: 75, connected_entities_count: 3, nocturnal_calls_count: 12, risk_tier: "MODERATE", gang_id: "GANG-02", gang_name: "Gang 2 — Lower Parel Ring" },

    // GANG-03 (Kurla / Gamma)
    { id: "Md. Azad Mannan", label: "Md. Azad Mannan", phone: "+91-8472516266", threat_score: 87.4, degree_centrality: 0.69, betweenness_centrality: 0.64, total_calls_count: 172, connected_entities_count: 5, nocturnal_calls_count: 39, risk_tier: "CRITICAL", gang_id: "GANG-03", gang_name: "Gang 3 — Kurla Mule Network" },
    { id: "Md. Indrajit Kunda", label: "Md. Indrajit Kunda", phone: "+91-9876543210", threat_score: 76.5, degree_centrality: 0.52, betweenness_centrality: 0.35, total_calls_count: 105, connected_entities_count: 4, nocturnal_calls_count: 22, risk_tier: "HIGH", gang_id: "GANG-03", gang_name: "Gang 3 — Kurla Mule Network" },
    { id: "Md. Harish Bali", label: "Md. Harish Bali", phone: "+91-9456123789", threat_score: 71.0, degree_centrality: 0.48, betweenness_centrality: 0.29, total_calls_count: 95, connected_entities_count: 3, nocturnal_calls_count: 18, risk_tier: "MODERATE", gang_id: "GANG-03", gang_name: "Gang 3 — Kurla Mule Network" },
    { id: "Md. Harrison Sarna", label: "Md. Harrison Sarna", phone: "+91-9123456780", threat_score: 64.2, degree_centrality: 0.39, betweenness_centrality: 0.18, total_calls_count: 68, connected_entities_count: 3, nocturnal_calls_count: 11, risk_tier: "MODERATE", gang_id: "GANG-03", gang_name: "Gang 3 — Kurla Mule Network" },
    { id: "Md. Tanveer Choudhary", label: "Md. Tanveer Choudhary", phone: "+91-3531160657", threat_score: 58.0, degree_centrality: 0.32, betweenness_centrality: 0.14, total_calls_count: 52, connected_entities_count: 2, nocturnal_calls_count: 8, risk_tier: "MODERATE", gang_id: "GANG-03", gang_name: "Gang 3 — Kurla Mule Network" },

    // GANG-04 (Dharavi / Delta)
    { id: "Md. Maanav Tailor", label: "Md. Maanav Tailor", phone: "+91-5405416287", threat_score: 84.8, degree_centrality: 0.65, betweenness_centrality: 0.58, total_calls_count: 160, connected_entities_count: 5, nocturnal_calls_count: 34, risk_tier: "HIGH", gang_id: "GANG-04", gang_name: "Gang 4 — Dharavi Extortion Group" },
    { id: "Md. Umang Mody", label: "Md. Umang Mody", phone: "+91-9321456789", threat_score: 77.2, degree_centrality: 0.54, betweenness_centrality: 0.36, total_calls_count: 112, connected_entities_count: 4, nocturnal_calls_count: 25, risk_tier: "HIGH", gang_id: "GANG-04", gang_name: "Gang 4 — Dharavi Extortion Group" },
    { id: "Md. George Ramaswamy", label: "Md. George Ramaswamy", phone: "+91-9456781234", threat_score: 69.8, degree_centrality: 0.44, betweenness_centrality: 0.25, total_calls_count: 84, connected_entities_count: 3, nocturnal_calls_count: 16, risk_tier: "MODERATE", gang_id: "GANG-04", gang_name: "Gang 4 — Dharavi Extortion Group" },
    { id: "Md. Balendra Nayak", label: "Md. Balendra Nayak", phone: "+91-9937146397", threat_score: 63.5, degree_centrality: 0.37, betweenness_centrality: 0.17, total_calls_count: 65, connected_entities_count: 3, nocturnal_calls_count: 10, risk_tier: "MODERATE", gang_id: "GANG-04", gang_name: "Gang 4 — Dharavi Extortion Group" },
    { id: "Md. Tarak Sahni", label: "Md. Tarak Sahni", phone: "+91-8535218781", threat_score: 55.0, degree_centrality: 0.30, betweenness_centrality: 0.12, total_calls_count: 45, connected_entities_count: 2, nocturnal_calls_count: 6, risk_tier: "LOW", gang_id: "GANG-04", gang_name: "Gang 4 — Dharavi Extortion Group" }
  ],
  edges: [
    // Intra-gang GANG-01
    { source: "Md. Ranbir Bhalla", target: "Md. Teerth Bhargava", total_calls: 142, weight: 14.2 },
    { source: "Md. Ranbir Bhalla", target: "Md. Vedant Padmanabhan", total_calls: 98, weight: 9.8 },
    { source: "Md. Teerth Bhargava", target: "Md. Zashil Mistry", total_calls: 48, weight: 4.8 },
    { source: "Md. Vedant Padmanabhan", target: "Md. Samar Nagar", total_calls: 42, weight: 4.2 },
    { source: "Md. Ranbir Bhalla", target: "Md. Samar Nagar", total_calls: 36, weight: 3.6 },

    // Intra-gang GANG-02
    { source: "Md. Advik Golla", target: "Md. Darsh Sampath", total_calls: 88, weight: 8.8 },
    { source: "Md. Advik Golla", target: "Md. Pranit Arya", total_calls: 76, weight: 7.6 },
    { source: "Md. Darsh Sampath", target: "Md. Hardik Kant", total_calls: 54, weight: 5.4 },
    { source: "Md. Pranit Arya", target: "Md. Christopher Pillai", total_calls: 45, weight: 4.5 },
    { source: "Md. Advik Golla", target: "Md. Christopher Pillai", total_calls: 38, weight: 3.8 },

    // Intra-gang GANG-03
    { source: "Md. Azad Mannan", target: "Md. Indrajit Kunda", total_calls: 92, weight: 9.2 },
    { source: "Md. Azad Mannan", target: "Md. Harish Bali", total_calls: 64, weight: 6.4 },
    { source: "Md. Indrajit Kunda", target: "Md. Harrison Sarna", total_calls: 46, weight: 4.6 },
    { source: "Md. Harish Bali", target: "Md. Tanveer Choudhary", total_calls: 35, weight: 3.5 },
    { source: "Md. Azad Mannan", target: "Md. Harrison Sarna", total_calls: 30, weight: 3.0 },

    // Intra-gang GANG-04
    { source: "Md. Maanav Tailor", target: "Md. Umang Mody", total_calls: 82, weight: 8.2 },
    { source: "Md. Maanav Tailor", target: "Md. George Ramaswamy", total_calls: 60, weight: 6.0 },
    { source: "Md. Umang Mody", target: "Md. Balendra Nayak", total_calls: 44, weight: 4.4 },
    { source: "Md. George Ramaswamy", target: "Md. Tarak Sahni", total_calls: 32, weight: 3.2 },
    { source: "Md. Balendra Nayak", target: "Md. Tarak Sahni", total_calls: 28, weight: 2.8 },

    // Inter-gang Cross-Links (Bridges & Syndicates)
    { source: "Md. Ranbir Bhalla", target: "Md. Advik Golla", total_calls: 24, weight: 2.4 }, // Kingpin to Kingpin
    { source: "Md. Teerth Bhargava", target: "Md. Pranit Arya", total_calls: 86, weight: 8.6 }, // Major Cross-Gang Bridge
    { source: "Md. Vedant Padmanabhan", target: "Md. Hardik Kant", total_calls: 54, weight: 5.4 }, // Secondary Bridge
    { source: "Md. Advik Golla", target: "Md. Azad Mannan", total_calls: 18, weight: 1.8 }, // Beta to Gamma Kingpin
    { source: "Md. Darsh Sampath", target: "Md. Indrajit Kunda", total_calls: 32, weight: 3.2 }, // Logistics to Mule Bridge
    { source: "Md. Azad Mannan", target: "Md. Maanav Tailor", total_calls: 22, weight: 2.2 }, // Gamma to Delta Kingpin
    { source: "Md. Harish Bali", target: "Md. Umang Mody", total_calls: 28, weight: 2.8 }, // Mule to Extortion Bridge
    { source: "Md. Ranbir Bhalla", target: "Md. Maanav Tailor", total_calls: 15, weight: 1.5 } // Alpha to Delta
  ]
};

export const fallbackCCTVMeetings: CCTVMeetingsResponse = {
  total_encounters: 28,
  avg_confidence_pct: 87.5,
  mean_distance_meters: 4.2,
  meetings: [
    {
      suspect_1: "Md. Ranbir Bhalla",
      suspect_2: "Md. Teerth Bhargava",
      camera_id: "MH-CCTV-9890",
      camera_location: "Metro Access Road, Byculla West, Mumbai",
      cdr_call_count: 14,
      avg_distance_meters: 3.5,
      avg_match_confidence: 0.92,
      sighting_status: "Verified Match",
      encounter_time: "2026-08-25 18:15:00"
    },
    {
      suspect_1: "Md. Ranbir Bhalla",
      suspect_2: "Md. Vedant Padmanabhan",
      camera_id: "MH-CCTV-9173",
      camera_location: "Public Footpath Corner, Lower Parel, Mumbai",
      cdr_call_count: 9,
      avg_distance_meters: 4.8,
      avg_match_confidence: 0.88,
      sighting_status: "Verified Match",
      encounter_time: "2026-08-24 11:30:00"
    }
  ]
};

export const fallbackGangs: GangListResponse = {
  total_gangs: 2,
  confirmed_count: 1,
  candidate_count: 1,
  dismissed_count: 0,
  gangs: [
    {
      gang_id: "GANG-01",
      name: "Gang 1 — Byculla Extortion Syndicate",
      status: "CONFIRMED",
      member_count: 3,
      members: ["Md. Ranbir Bhalla", "Md. Teerth Bhargava", "Md. Vedant Padmanabhan"],
      ring_leader: "Md. Ranbir Bhalla",
      leader_phone: "+91-2236381844",
      aggregate_threat_score: 88.9,
      primary_locations: ["Byculla West", "Station Road Footpath", "Venus Wine Shop"],
      date_first_detected: "01 AUG 2026"
    },
    {
      gang_id: "GANG-02",
      name: "Gang 2 — Lower Parel Contraband Group",
      status: "CANDIDATE",
      member_count: 2,
      members: ["Md. Pranit Arya", "Md. Hardik Kant"],
      ring_leader: "Md. Pranit Arya",
      leader_phone: "+91-7774789752",
      aggregate_threat_score: 76.5,
      primary_locations: ["Lower Parel", "Bhadakamkar Marg"],
      date_first_detected: "05 AUG 2026"
    }
  ]
};

export const fallbackFinancial: FinancialIntelligenceResponse = {
  total_transactions: 340,
  total_volume_inr: 4850000,
  high_risk_suspects_count: 4,
  summaries: [
    {
      suspect_name: "Md. Ranbir Bhalla",
      threat_score: 94.2,
      total_transactions: 85,
      total_volume_inr: 1850000,
      failed_withdrawals: 12,
      wine_shop_spent_inr: 45000,
      peer_transfer_count: 34
    },
    {
      suspect_name: "Md. Teerth Bhargava",
      threat_score: 88.5,
      total_transactions: 62,
      total_volume_inr: 1240000,
      failed_withdrawals: 8,
      wine_shop_spent_inr: 28000,
      peer_transfer_count: 22
    }
  ],
  transactions: [
    {
      transaction_id: "TXN-99812",
      sender_name: "Md. Ranbir Bhalla",
      receiver_name: "Md. Teerth Bhargava",
      merchant_category: "Peer Transfer (Hawala)",
      amount_inr: 150000,
      timestamp: "2026-08-25 14:20:00"
    },
    {
      transaction_id: "TXN-88124",
      sender_name: "Md. Ranbir Bhalla",
      receiver_name: "Venus Wine Shop",
      merchant_category: "Liquor Outlet",
      amount_inr: 8500,
      timestamp: "2026-08-24 23:45:00"
    }
  ]
};

export const fallbackNocturnal: NocturnalAnomaliesResponse = {
  total_anomalies: 142,
  hotspots_count: 4,
  calls: [
    {
      caller_name: "Md. Ranbir Bhalla",
      receiver_name: "Md. Teerth Bhargava",
      call_type: "Outgoing Call",
      duration_seconds: 480,
      cell_tower_location: "Venus Wine Shop, N.M. Joshi Marg, Byculla (W)",
      timestamp: "2026-08-25 02:45:00"
    },
    {
      caller_name: "Md. Teerth Bhargava",
      receiver_name: "Md. Vedant Padmanabhan",
      call_type: "Incoming Call",
      duration_seconds: 320,
      cell_tower_location: "Station Road Footpath, Agripada, Mumbai",
      timestamp: "2026-08-24 03:15:00"
    }
  ],
  towers: [
    { cell_tower_location: "Venus Wine Shop, Byculla (W)", nocturnal_call_count: 48 },
    { cell_tower_location: "Station Road Footpath, Agripada", nocturnal_call_count: 36 },
    { cell_tower_location: "Bhadakamkar Marg, Grant Road", nocturnal_call_count: 29 },
    { cell_tower_location: "Senapati Bapat Marg, Lower Parel", nocturnal_call_count: 22 }
  ]
};

export const fallbackSurveillance: SurveillanceHeatmapResponse = {
  total_observations: 54,
  reports: [
    {
      report_id: "SR-2026-9901",
      fir_number: "0254/2026",
      spot_location: "Venus Wine Shop, N.M. Joshi Marg, Byculla (W)",
      patrol_officer_1: "Inspector R. Patil",
      patrol_officer_2: "Sub-Inspector V. Kadam",
      observation_details: "Suspect Md. Ranbir Bhalla observed exchanging illegal consignment cash parcel with co-accused.",
      panchnama_conducted: true,
      witness_count: 2
    }
  ]
};

export const fallbackAlerts: AlertsResponse = {
  total_alerts: 4,
  alerts: [
    {
      id: "1",
      severity: "CRITICAL",
      title: "Co-Location Alert: Md. Ranbir Bhalla & Md. Teerth Bhargava",
      message: "Both suspects sighted simultaneously at Byculla Metro Access CCTV zone.",
      timestamp: "07 SEP 2026 18:40 IST"
    },
    {
      id: "2",
      severity: "HIGH",
      title: "Nocturnal Spike: 38 Calls Detected",
      message: "Unusual surge in midnight communications between Gang 1 members.",
      timestamp: "07 SEP 2026 18:15 IST"
    }
  ]
};

export const fallbackDossier: SuspectDossierDetails = {
  suspect_name: "Md. Ranbir Bhalla",
  phone_number: "+91-2236381844",
  threat_score: 94.2,
  cctv_meetings_count: 14,
  fir_matches_count: 3,
  cdr_calls_count: 240,
  dossier_markdown: `# Confidential Police Dossier: Md. Ranbir Bhalla\n\n**Threat Score**: 94.2/100 (CRITICAL RISK)\n**Primary Area**: Byculla West, Mumbai\n\n### Summary\nKey leader of Gang 1 — Byculla Syndicate. Active in extortion, Hawala money transfers, and illegal contraband distribution.`
};

export const fallbackTimeline: TimelineResponse = {
  suspect_name: "Md. Ranbir Bhalla",
  phone_number: "+91-2236381844",
  total_events: 4,
  events: [
    {
      event_id: "evt-1",
      timestamp: "2026-08-25 18:15:00",
      source_module: "CCTV",
      color: "#f59e0b",
      title: "CCTV Camera MH-CCTV-9890 Sighting",
      description: "Location: Metro Access Road, Byculla West | Facial Match Confidence: 92%",
      metadata: { camera_id: "MH-CCTV-9890", confidence: 0.92 }
    },
    {
      event_id: "evt-2",
      timestamp: "2026-08-25 14:20:00",
      source_module: "FINANCIAL",
      color: "#10b981",
      title: "UPI Hawala Transfer: INR 150,000",
      description: "Payee: Md. Teerth Bhargava (SUCCESS)",
      metadata: { amount: 150000, payee: "Md. Teerth Bhargava" }
    },
    {
      event_id: "evt-3",
      timestamp: "2026-08-25 02:45:00",
      source_module: "CDR",
      color: "#38bdf8",
      title: "Midnight Call with Md. Teerth Bhargava",
      description: "Duration: 480s | Cell Tower: Venus Wine Shop, Byculla",
      metadata: { duration_sec: 480 }
    },
    {
      event_id: "evt-4",
      timestamp: "2026-08-20 10:00:00",
      source_module: "FIR",
      color: "#ef4444",
      title: "FIR #0254/2026 Registered",
      description: "Police Station: Byculla PS | IPC Sections: 384 (Extortion), 307 (Attempt to Murder)",
      metadata: { fir_number: "0254/2026", police_station: "Byculla" }
    }
  ]
};

export const fallbackSocial: SocialMediaResponse = {
  total_monitored_suspects: 5,
  total_flagged_posts: 18,
  total_location_clusters: 3,
  location_clusters: [
    {
      approximate_location: "Byculla West, Mumbai",
      suspect_count: 3,
      platforms_used: "WhatsApp, Instagram",
      devices_used: "Android Mobile, Desktop Browser",
      suspects: ["Md. Ranbir Bhalla", "Md. Teerth Bhargava", "Md. Vedant Padmanabhan"]
    },
    {
      approximate_location: "Lower Parel, Mumbai",
      suspect_count: 2,
      platforms_used: "WhatsApp, X / Twitter",
      devices_used: "iPhone",
      suspects: ["Md. Pranit Arya", "Md. Hardik Kant"]
    }
  ],
  suspects: [
    {
      suspect_name: "Md. Ranbir Bhalla",
      phone_number: "+91-2236381844",
      total_platforms: 2,
      total_posts: 6,
      overall_sentiment: "SUSPICIOUS",
      risk_score: 94.2,
      profiles: [
        {
          platform: "Instagram",
          handle: "@md_ranbir_bhalla",
          followers_count: 4200,
          following_count: 350,
          is_verified: false,
          status_flag: "MONITORED",
          profile_url: "https://instagram.com/@md_ranbir_bhalla"
        }
      ],
      recent_posts: [
        {
          post_id: "SM-41280",
          platform: "Instagram",
          timestamp: "2026-08-25 18:20:00",
          content: "Late night operations near Byculla West. Ready for the next consignment.",
          sentiment: "SUSPICIOUS",
          risk_level: "HIGH",
          likes: 340,
          shares: 45,
          hashtags: ["#MumbaiUnderworld", "#NightPatrol"],
          tagged_users: ["@md_teerth_bhargava"],
          location_checkin: "Station Road Footpath, Byculla"
        }
      ]
    }
  ]
};

export const fallbackGeo: GeoPointsResponse = {
  total_points: 6,
  points: [
    { id: "pt-1", lat: 18.9780, lng: 72.8300, title: "CCTV Camera MH-CCTV-9890", category: "CCTV", timestamp: "2026-08-25 18:15", details: "Suspect: Md. Ranbir Bhalla | Match Confidence: 92%", color: "#f59e0b" },
    { id: "pt-2", lat: 18.9750, lng: 72.8250, title: "Nocturnal Tower: Agripada", category: "NOCTURNAL", timestamp: "2026-08-25 02:45", details: "38 Midnight Call Handovers Detected", color: "#38bdf8" },
    { id: "pt-3", lat: 18.9950, lng: 72.8300, title: "Field Patrol Spot: SR-2026-9901", category: "SURVEILLANCE", timestamp: "2026-08-25 14:00", details: "Special Branch Panchnama Conducted", color: "#ef4444" }
  ]
};

export const fallbackExplanation = {
  suspect_name: "Md. Ranbir Bhalla",
  phone_number: "+91-2236381844",
  total_threat_score: 94.2,
  threat_tier: "CRITICAL / LEVEL-1 RED",
  primary_verdict: "Subject flagged with Threat Score 94.2/100 based on multi-source intelligence correlation across CCTV, CDR, and prior FIR records.",
  feature_attribution: [
    {
      feature_name: "Physical CCTV Sighting & Co-Location",
      score_contribution: 28.6,
      percentage_influence: 30.4,
      max_possible: 30.0,
      risk_signal: "CRITICAL"
    },
    {
      feature_name: "Telecom Call Degree & Nocturnal Interceptions",
      score_contribution: 20.0,
      percentage_influence: 21.2,
      max_possible: 20.0,
      risk_signal: "HIGH"
    },
    {
      feature_name: "FIR & Police Complaint Severity",
      score_contribution: 15.0,
      percentage_influence: 15.9,
      max_possible: 15.0,
      risk_signal: "HIGH"
    },
    {
      feature_name: "Prior Criminal Convictions & Case Status",
      score_contribution: 12.0,
      percentage_influence: 12.7,
      max_possible: 15.0,
      risk_signal: "HIGH"
    },
    {
      feature_name: "Financial Transactions & Merchant Risk",
      score_contribution: 9.6,
      percentage_influence: 10.2,
      max_possible: 10.0,
      risk_signal: "HIGH"
    },
    {
      feature_name: "Field Surveillance & Panchnama Reports",
      score_contribution: 9.0,
      percentage_influence: 9.6,
      max_possible: 10.0,
      risk_signal: "MODERATE"
    }
  ],
  counterfactual_analysis: [
    {
      hypothesis: "What if Nocturnal Calls were 0?",
      simulated_score: 86.2,
      verdict_change: "Threat tier drops significantly"
    },
    {
      hypothesis: "What if Physical CCTV Meeting was an innocent coincidence?",
      simulated_score: 71.3,
      verdict_change: "Eliminates physical conspiracy link"
    }
  ],
  forensic_evidence_trail: [
    {
      source_modality: "TELECOM_CDR",
      timestamp: "2026-09-04 02:15:00",
      summary: "Intercepted Outgoing call (240s) with Md. Teerth Bhargava (+91-7611970993)",
      location: "Byculla Sector 4 Tower",
      flag: "NOCTURNAL_ALERT"
    },
    {
      source_modality: "CCTV_SURVEILLANCE",
      timestamp: "2026-09-05 18:30:00",
      summary: "Optical facial recognition capture at Venus Wine Shop, Byculla West (97% Match)",
      location: "MH-CCTV-9890 (Byculla West)",
      flag: "PHYSICAL_CO_LOCATION"
    },
    {
      source_modality: "POLICE_FIR_RECORD",
      timestamp: "2026-08-12",
      summary: "Registered under IPC 384/120B at Byculla PS. FIR #0254/2026",
      location: "Byculla Police Station",
      flag: "CRIMINAL_CHARGES_ACTIVE"
    }
  ],
  statutory_chargeability: "Prosecutable under MCOCA / IPC Sec 120B based on multi-source conspiracy matrix."
};

