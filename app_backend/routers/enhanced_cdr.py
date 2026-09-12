"""
app_backend/routers/enhanced_cdr.py
----------------------------------
API Router for Enhanced CDR Analysis with advanced entity extraction,
relationship analysis, suspicious pattern detection, and cross-domain correlation.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Dict, Any, Optional
from intelligence_engine import IntelligenceEngine
from app_backend.dependencies import get_engine
from app_backend.services import enhanced_cdr_service
from app_backend.schemas.cdr import CDRSummaryResponse, NetworkGraphResponse

router = APIRouter(prefix="/api/enhanced-cdr", tags=["Enhanced CDR Analysis"])

@router.get("/summary", response_model=CDRSummaryResponse, summary="Get enhanced CDR caller-receiver pair interaction stats")
def get_enhanced_summary(engine: IntelligenceEngine = Depends(get_engine)):
    """Get CDR summary with enhanced metrics."""
    try:
        return enhanced_cdr_service.get_enhanced_cdr_summary(engine)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get enhanced CDR summary: {str(e)}")

@router.get("/suspicious-patterns", summary="Detect suspicious communication patterns in CDR data")
def get_suspicious_patterns(engine: IntelligenceEngine = Depends(get_engine)):
    """Detect burner numbers, rapid SIM changes, unusual timing patterns, etc."""
    try:
        return enhanced_cdr_service.detect_suspicious_patterns(engine)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to detect suspicious patterns: {str(e)}")

@router.get("/cell-tower-co-location", summary="Analyze co-location based on cell tower proximity")
def get_cell_tower_co_location(
    time_window_minutes: int = Query(30, ge=1, le=1440, description="Time window in minutes for co-location detection"),
    engine: IntelligenceEngine = Depends(get_engine)
):
    """Find suspects detected at same cell tower within specified time window."""
    try:
        events = enhanced_cdr_service.analyze_cell_tower_co_location(engine, time_window_minutes)
        return {
            "co_location_events": events,
            "time_window_minutes": time_window_minutes,
            "analysis_timestamp": __import__('datetime').datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze cell tower co-location: {str(e)}")

@router.get("/cross-domain-correlation", summary="Analyze correlation between CDR and financial transaction data")
def get_cross_domain_correlation(engine: IntelligenceEngine = Depends(get_engine)):
    """Find relationships between financial transactions and communications."""
    try:
        return enhanced_cdr_service.get_cross_domain_correlation(engine)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get cross-domain correlation: {str(e)}")

@router.get("/advanced-network-analysis", summary="Get advanced network analysis metrics")
def get_advanced_network_analysis(engine: IntelligenceEngine = Depends(get_engine)):
    """Get enhanced network analysis including centrality measures, clustering, etc."""
    try:
        return enhanced_cdr_service.get_advanced_network_analysis(engine)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get advanced network analysis: {str(e)}")

@router.get("/health", summary="Enhanced CDR service health check")
def health_check():
    """Health check endpoint for enhanced CDR service."""
    return {
        "status": "healthy",
        "service": "enhanced_cdr",
        "timestamp": __import__('datetime').datetime.now().isoformat()
    }