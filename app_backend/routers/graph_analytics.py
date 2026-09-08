"""
app_backend/routers/graph_analytics.py
--------------------------------------
APIRouter for Live Graph Mathematical Proofs, Centrality Metrics & Community Detection
"""

from fastapi import APIRouter, Depends, Query
from typing import Dict, Any, Optional
from intelligence_engine import IntelligenceEngine
from app_backend.dependencies import get_engine
from app_backend.services.graph_analytics import GraphAnalyticsEngine

router = APIRouter(prefix="/api/graph-proof", tags=["Graph Mathematical Proofs & Community Detection"])

@router.get("/metrics", summary="Execute and return live NetworkX graph algorithms with modularity and centrality proofs")
def get_live_graph_metrics(
    louvain_resolution: float = Query(1.0, ge=0.1, le=5.0, description="Louvain modularity resolution parameter gamma"),
    pagerank_alpha: float = Query(0.85, ge=0.5, le=0.99, description="PageRank damping factor alpha"),
    engine: IntelligenceEngine = Depends(get_engine)
) -> Dict[str, Any]:
    analytics = GraphAnalyticsEngine(engine)
    return analytics.compute_all_metrics(louvain_resolution=louvain_resolution, pagerank_alpha=pagerank_alpha)

@router.get("/shortest-path", summary="Compute shortest path & conspiracy hops between two suspects")
def get_shortest_path(
    source: str = Query(..., description="Source suspect name"),
    target: str = Query(..., description="Target suspect name"),
    engine: IntelligenceEngine = Depends(get_engine)
) -> Dict[str, Any]:
    analytics = GraphAnalyticsEngine(engine)
    return analytics.compute_shortest_path(source, target)
