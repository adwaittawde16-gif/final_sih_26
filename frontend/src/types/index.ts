/**
 * Shared TypeScript interfaces matching FastAPI Pydantic schemas
 */

export interface SuspectThreatScore {
  suspect_name: string;
  phone_number: string;
  total_threat_score: number;
  cctv_meeting_score: number;
  cdr_network_score: number;
  fir_severity_score: number;
  criminal_history_score: number;
  financial_risk_score: number;
  surveillance_score: number;
}

export interface ThreatLeaderboardResponse {
  total_suspects: number;
  critical_count: number;
  high_count: number;
  moderate_count: number;
  low_count: number;
  leaderboard: SuspectThreatScore[];
}

export interface SimulationWeightsRequest {
  cctv_weight: number;
  cdr_weight: number;
  fir_weight: number;
  criminal_weight: number;
  financial_weight: number;
  surveillance_weight: number;
}

export interface SimulationResponse {
  total_weight: number;
  simulated_leaderboard: SuspectThreatScore[];
}

export interface CDRPairRecord {
  suspect_1: string;
  suspect_2: string;
  total_calls: number;
  total_duration_min: number;
  nocturnal_calls: number;
  sms_count: number;
  incoming_count: number;
  outgoing_count: number;
}

export interface CDRSummaryResponse {
  total_cdr_logs: number;
  total_interaction_pairs: number;
  frequent_pairs_count: number;
  pairs: CDRPairRecord[];
}

export interface NetworkNode {
  id: string;
  label: string;
  phone?: string;
  threat_score: number;
  degree_centrality: number;
  betweenness_centrality: number;
  total_calls_count: number;
  connected_entities_count: number;
  nocturnal_calls_count: number;
  risk_tier: string;
  gang_id?: string;
  gang_name?: string;
}

export interface NetworkEdge {
  source: string;
  target: string;
  total_calls: number;
  weight: number;
}

export interface NetworkGraphResponse {
  total_nodes: number;
  total_edges: number;
  top_key_influencers: NetworkNode[];
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export interface CCTVMeetingRecord {
  suspect_1: string;
  suspect_2: string;
  camera_id?: string;
  camera_location: string;
  cdr_call_count?: number;
  avg_distance_meters: number;
  avg_match_confidence: number;
  sighting_status?: string;
  encounter_time?: string;
}

export interface CCTVMeetingsResponse {
  total_encounters: number;
  avg_confidence_pct: number;
  mean_distance_meters: number;
  meetings: CCTVMeetingRecord[];
}

export interface CrimeRingRecord {
  syndicate_id: string;
  ring_leader: string;
  leader_phone?: string;
  member_count: number;
  members: string[];
  threat_level: string;
  primary_hub?: string;
}

export interface CrimeRingsResponse {
  total_rings: number;
  priority_ring?: string;
  rings: CrimeRingRecord[];
}

export interface FinancialSuspectSummary {
  suspect_name: string;
  threat_score?: number;
  total_transactions: number;
  total_volume_inr: number;
  failed_withdrawals?: number;
  wine_shop_spent_inr?: number;
  peer_transfer_count?: number;
}

export interface FinancialRawRecord {
  transaction_id: string;
  sender_name: string;
  receiver_name: string;
  merchant_category: string;
  amount_inr: number;
  timestamp: string;
}

export interface FinancialIntelligenceResponse {
  total_transactions: number;
  total_volume_inr: number;
  high_risk_suspects_count: number;
  summaries: FinancialSuspectSummary[];
  transactions: FinancialRawRecord[];
}

export interface NocturnalCallRecord {
  caller_name: string;
  receiver_name: string;
  call_type: string;
  duration_seconds: number;
  cell_tower_location: string;
  timestamp: string;
}

export interface CellTowerHotspot {
  cell_tower_location: string;
  nocturnal_call_count: number;
}

export interface NocturnalAnomaliesResponse {
  total_anomalies: number;
  hotspots_count: number;
  calls: NocturnalCallRecord[];
  towers: CellTowerHotspot[];
}

export interface SurveillanceReportRecord {
  report_id: string;
  fir_number?: string;
  spot_location: string;
  patrol_officer_1?: string;
  patrol_officer_2?: string;
  patrol_officer_3?: string;
  observation_details: string;
  panchnama_conducted?: boolean;
  witness_count?: number;
}

export interface SurveillanceHeatmapResponse {
  total_observations: number;
  reports: SurveillanceReportRecord[];
}

export interface AlertItem {
  id: string;
  severity: string;
  title: string;
  message: string;
  timestamp: string;
}

export interface AlertsResponse {
  total_alerts: number;
  alerts: AlertItem[];
}

export interface SuspectDossierDetails {
  suspect_name: string;
  phone_number: string;
  threat_score: number;
  cctv_meetings_count: number;
  fir_matches_count: number;
  cdr_calls_count: number;
  dossier_markdown: string;
}

export interface SearchResultResponse {
  query: string;
  total_matches: number;
  fir_matches: any[];
  cdr_matches: any[];
  cctv_matches: any[];
}

export interface GangRecord {
  gang_id: string;
  name: string;
  status: string;
  member_count: number;
  members: string[];
  ring_leader: string;
  leader_phone: string;
  aggregate_threat_score: number;
  primary_locations: string[];
  date_first_detected: string;
}

export interface GangListResponse {
  total_gangs: number;
  confirmed_count: number;
  candidate_count: number;
  dismissed_count: number;
  gangs: GangRecord[];
}

export interface GangSubGraphResponse {
  gang_id: string;
  gang_name: string;
  total_nodes: number;
  total_edges: number;
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export interface TimelineEvent {
  event_id: string;
  timestamp: string;
  source_module: string;
  color: string;
  title: string;
  description: string;
  metadata: Record<string, any>;
}

export interface TimelineResponse {
  suspect_name: string;
  phone_number: string;
  total_events: number;
  events: TimelineEvent[];
}

export interface PlatformProfile {
  platform: string;
  handle: string;
  followers_count: number;
  following_count: number;
  is_verified: boolean;
  status_flag: string;
  profile_url: string;
}

export interface SocialPost {
  post_id: string;
  platform: string;
  timestamp: string;
  content: string;
  sentiment: string;
  risk_level: string;
  likes: number;
  shares: number;
  hashtags: string[];
  tagged_users: string[];
  location_checkin: string;
}

export interface SuspectSocialFootprint {
  suspect_name: string;
  phone_number: string;
  total_platforms: number;
  total_posts: number;
  overall_sentiment: string;
  risk_score: number;
  profiles: PlatformProfile[];
  recent_posts: SocialPost[];
}

export interface DigitalLocationCluster {
  approximate_location: string;
  suspect_count: number;
  platforms_used: string;
  devices_used: string;
  suspects: string[];
}

export interface SocialMediaResponse {
  total_monitored_suspects: number;
  total_flagged_posts: number;
  total_location_clusters: number;
  location_clusters: DigitalLocationCluster[];
  suspects: SuspectSocialFootprint[];
}

export interface ExtractedEntity {
  text: string;
  category: string;
  confidence: number;
}

export interface ExtractedRelationship {
  source: string;
  target: string;
  relation_type: string;
}

export interface FIRNLPResponse {
  fir_id: string;
  fir_number: string;
  raw_text: string;
  entities: ExtractedEntity[];
  suspects: string[];
  co_accused: string[];
  locations: string[];
  crime_types: string[];
  relationships: ExtractedRelationship[];
}

export interface GeoPoint {
  id: string;
  lat: number;
  lng: number;
  title: string;
  category: string;
  timestamp: string;
  details: string;
  color: string;
}

export interface GeoPointsResponse {
  total_points: number;
  points: GeoPoint[];
}

