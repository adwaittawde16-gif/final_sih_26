"""
app_backend/routers/geo.py
--------------------------
APIRouter for Leaflet GPS Map Points
"""

from fastapi import APIRouter, Depends, Query
from intelligence_engine import IntelligenceEngine
from app_backend.dependencies import get_engine
from app_backend.schemas.geo import GeoPointsResponse
from app_backend.services import geo_service

router = APIRouter(prefix="/api/geo", tags=["GPS Map Visualizer"])

@router.get("/points", response_model=GeoPointsResponse, summary="Get GPS coordinate map markers across CCTV, Nocturnal & Surveillance")
def get_points(category: str = Query("", description="Optional category filter: CCTV, NOCTURNAL, SURVEILLANCE"), engine: IntelligenceEngine = Depends(get_engine)):
    return geo_service.get_geo_points(engine, category)
