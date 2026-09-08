"""
app_backend/routers/cctv.py
---------------------------
APIRouter for Module 3: CCTV Physical Co-Location & Meeting Encounters
"""

from fastapi import APIRouter, Depends
from intelligence_engine import IntelligenceEngine
from app_backend.dependencies import get_engine
from app_backend.schemas.cctv import CCTVMeetingsResponse
from app_backend.services import cctv_service

router = APIRouter(prefix="/api/cctv", tags=["Module 3 — CCTV Co-Location"])

@router.get("/meetings", response_model=CCTVMeetingsResponse, summary="Get physical encounters detected by CCTV cameras")
def get_meetings(engine: IntelligenceEngine = Depends(get_engine)):
    return cctv_service.get_cctv_meetings(engine)
