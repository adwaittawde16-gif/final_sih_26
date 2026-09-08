"""
app_backend/services/threat_service.py
"""

from intelligence_engine import IntelligenceEngine
from threat_classifier import ThreatClassifier
from score_simulator import CustomScoreSimulator
from app_backend.schemas.threat import (
    ThreatLeaderboardResponse,
    SuspectThreatScore,
    SimulationWeightsRequest,
    SimulationResponse
)

def get_threat_leaderboard(engine: IntelligenceEngine) -> ThreatLeaderboardResponse:
    classifier = ThreatClassifier(engine)
    tier_df = classifier.classify_suspect_risks()
    scores_df = engine.calculate_threat_scores()
    
    merged = scores_df.to_dict(orient='records')
    
    crit = len(tier_df[tier_df['risk_tier'] == 'CRITICAL'])
    high = len(tier_df[tier_df['risk_tier'] == 'HIGH'])
    mod = len(tier_df[tier_df['risk_tier'] == 'MODERATE'])
    low = len(tier_df[tier_df['risk_tier'] == 'LOW'])
    
    leaderboard = [SuspectThreatScore(**item) for item in merged]
    
    return ThreatLeaderboardResponse(
        total_suspects=len(leaderboard),
        critical_count=crit,
        high_count=high,
        moderate_count=mod,
        low_count=low,
        leaderboard=leaderboard
    )

def simulate_threat_weights(engine: IntelligenceEngine, req: SimulationWeightsRequest) -> SimulationResponse:
    sim = CustomScoreSimulator(engine)
    weights = {
        'cctv_max': req.cctv_weight,
        'cdr_max': req.cdr_weight,
        'fir_max': req.fir_weight,
        'crim_max': req.criminal_weight,
        'fin_max': req.financial_weight,
        'surv_max': req.surveillance_weight
    }
    sim_df = sim.simulate_scores(weights=weights)
    records = sim_df.to_dict(orient='records')
    leaderboard = [SuspectThreatScore(**r) for r in records]
    total_w = req.cctv_weight + req.cdr_weight + req.fir_weight + req.criminal_weight + req.financial_weight + req.surveillance_weight
    return SimulationResponse(total_weight=total_w, simulated_leaderboard=leaderboard)
