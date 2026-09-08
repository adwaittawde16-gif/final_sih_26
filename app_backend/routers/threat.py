"""
app_backend/routers/threat.py
-----------------------------
APIRouter for Module 1: Threat Leaderboard & Composite Risk Simulator
"""

from fastapi import APIRouter, Depends
from intelligence_engine import IntelligenceEngine
from app_backend.dependencies import get_engine
from app_backend.schemas.threat import (
    ThreatLeaderboardResponse,
    SimulationWeightsRequest,
    SimulationResponse
)
from app_backend.services import threat_service

router = APIRouter(prefix="/api/threat", tags=["Module 1 — Threat Leaderboard & Simulator"])

@router.get("/leaderboard", response_model=ThreatLeaderboardResponse, summary="Get suspect composite threat score leaderboard")
def get_leaderboard(engine: IntelligenceEngine = Depends(get_engine)):
    return threat_service.get_threat_leaderboard(engine)

@router.post("/simulate", response_model=SimulationResponse, summary="Simulate custom threat scores with dynamic parameter weights")
def simulate_weights(req: SimulationWeightsRequest, engine: IntelligenceEngine = Depends(get_engine)):
    return threat_service.simulate_threat_weights(engine, req)
