"""
app_backend/routers/cdr.py
--------------------------
APIRouter for Module 2: CDR Interaction Network & Call Pair Analysis
"""

from fastapi import APIRouter, Depends
from intelligence_engine import IntelligenceEngine
from app_backend.dependencies import get_engine
from app_backend.schemas.cdr import CDRSummaryResponse, NetworkGraphResponse
from app_backend.services import cdr_service

router = APIRouter(prefix="/api/cdr", tags=["Module 2 — CDR Interaction Network"])

@router.get("/pairs", response_model=CDRSummaryResponse, summary="Get CDR caller-receiver pair interaction stats")
def get_pairs(engine: IntelligenceEngine = Depends(get_engine)):
    return cdr_service.get_cdr_summary(engine)

@router.get("/graph", response_model=NetworkGraphResponse, summary="Get graph nodes and edges topology for D3/React Flow rendering")
def get_graph(engine: IntelligenceEngine = Depends(get_engine)):
    return cdr_service.get_network_graph(engine)
