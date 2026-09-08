"""
app_backend/routers/crime_rings.py
----------------------------------
APIRouter for Module 4: Crime Rings & Syndicate Cell Detection
"""

from fastapi import APIRouter, Depends
from intelligence_engine import IntelligenceEngine
from app_backend.dependencies import get_engine
from app_backend.schemas.crime_rings import CrimeRingsResponse
from app_backend.services import crime_ring_service

router = APIRouter(prefix="/api/crime-rings", tags=["Module 4 — Crime Rings & Syndicates"])

@router.get("/list", response_model=CrimeRingsResponse, summary="Get detected organized crime rings and syndicate rosters")
def get_rings(engine: IntelligenceEngine = Depends(get_engine)):
    return crime_ring_service.get_crime_rings(engine)
