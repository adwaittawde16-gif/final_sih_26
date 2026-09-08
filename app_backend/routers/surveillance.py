"""
app_backend/routers/surveillance.py
------------------------------------
APIRouter for Module 7: Field Surveillance Observations & Density Heatmaps
"""

from fastapi import APIRouter, Depends
from intelligence_engine import IntelligenceEngine
from app_backend.dependencies import get_engine
from app_backend.schemas.surveillance import SurveillanceHeatmapResponse
from app_backend.services import surveillance_service

router = APIRouter(prefix="/api/surveillance", tags=["Module 7 — Field Surveillance"])

@router.get("/reports", response_model=SurveillanceHeatmapResponse, summary="Get field observation logs and heatmap coordinate density")
def get_reports(engine: IntelligenceEngine = Depends(get_engine)):
    return surveillance_service.get_surveillance_heatmap(engine)
