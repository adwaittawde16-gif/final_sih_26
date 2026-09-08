"""
app_backend/routers/nocturnal.py
--------------------------------
APIRouter for Module 6: Nocturnal Call Anomaly Detection & Cell Tower Hotspots
"""

from fastapi import APIRouter, Depends
from intelligence_engine import IntelligenceEngine
from app_backend.dependencies import get_engine
from app_backend.schemas.nocturnal import NocturnalAnomaliesResponse
from app_backend.services import nocturnal_service

router = APIRouter(prefix="/api/nocturnal", tags=["Module 6 — Nocturnal Anomalies"])

@router.get("/anomalies", response_model=NocturnalAnomaliesResponse, summary="Get midnight calls (00:00-06:00 IST) and cell tower handover hotspots")
def get_anomalies(engine: IntelligenceEngine = Depends(get_engine)):
    return nocturnal_service.get_nocturnal_anomalies(engine)
