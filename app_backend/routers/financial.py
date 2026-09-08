"""
app_backend/routers/financial.py
--------------------------------
APIRouter for Module 5: Financial Intelligence & Money Trail Analysis
"""

from fastapi import APIRouter, Depends
from intelligence_engine import IntelligenceEngine
from app_backend.dependencies import get_engine
from app_backend.schemas.financial import FinancialIntelligenceResponse
from app_backend.services import financial_service

router = APIRouter(prefix="/api/financial", tags=["Module 5 — Financial Intelligence"])

@router.get("/summary", response_model=FinancialIntelligenceResponse, summary="Get suspicious financial transactions & money trail analysis")
def get_summary(engine: IntelligenceEngine = Depends(get_engine)):
    return financial_service.get_financial_intelligence(engine)
