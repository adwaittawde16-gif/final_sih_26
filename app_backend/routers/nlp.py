"""
app_backend/routers/nlp.py
--------------------------
APIRouter for NLP FIR Entity & Co-Accused Extractor
"""

from fastapi import APIRouter, Depends
from intelligence_engine import IntelligenceEngine
from app_backend.dependencies import get_engine
from app_backend.schemas.nlp import FIRNLPRequest, FIRNLPResponse
from app_backend.services import nlp_service

router = APIRouter(prefix="/api/fir", tags=["NLP FIR Entity Extractor"])

@router.post("/extract", response_model=FIRNLPResponse, summary="Extract entities, co-accused, locations & M.O. from FIR text narrative")
def extract_fir_nlp(req: FIRNLPRequest, engine: IntelligenceEngine = Depends(get_engine)):
    return nlp_service.parse_fir_narrative(engine, req)
