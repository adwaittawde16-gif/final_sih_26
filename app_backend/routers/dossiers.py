"""
app_backend/routers/dossiers.py
-------------------------------
APIRouter for Module 8: 360° Suspect Dossiers, Alert Feeds & Executive Reports
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from intelligence_engine import IntelligenceEngine
from app_backend.dependencies import get_engine
from app_backend.schemas.dossiers import (
    AlertsResponse,
    SuspectDossierDetails,
    SearchResultResponse,
    ExecutiveSummaryResponse,
    TimelineResponse
)
from app_backend.services import dossier_service

router = APIRouter(prefix="/api/dossiers", tags=["Module 8 — Dossiers & Executive Intelligence"])

@router.get("/alerts", response_model=AlertsResponse, summary="Get real-time police alert notification feed")
def get_alerts():
    return dossier_service.get_alerts()

@router.get("/suspect", response_model=SuspectDossierDetails, summary="Get comprehensive 360° suspect dossier markdown & stats")
def get_dossier(name: str = Query(..., description="Full suspect name e.g. Md. Ranbir Bhalla"), engine: IntelligenceEngine = Depends(get_engine)):
    try:
        return dossier_service.get_suspect_dossier(engine, name)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/timeline", response_model=TimelineResponse, summary="Get compiled multi-source forensic timeline for suspect")
def get_timeline(name: str = Query(..., description="Full suspect name e.g. Md. Ranbir Bhalla"), engine: IntelligenceEngine = Depends(get_engine)):
    return dossier_service.get_suspect_timeline(engine, name)

@router.get("/search", response_model=SearchResultResponse, summary="Multi-source search across FIRs, CDRs, and CCTV sightings")
def search(q: str = Query(..., description="Query string e.g. Byculla"), engine: IntelligenceEngine = Depends(get_engine)):
    return dossier_service.search_intelligence(engine, q)

@router.get("/executive-summary", response_model=ExecutiveSummaryResponse, summary="Get high-level executive intelligence summary")
def get_exec_summary():
    return dossier_service.get_executive_summary()

