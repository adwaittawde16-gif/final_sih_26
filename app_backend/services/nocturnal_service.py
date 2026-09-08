"""
app_backend/services/nocturnal_service.py
"""

from intelligence_engine import IntelligenceEngine
from nocturnal_call_analyzer import NocturnalCallAnalyzer
from app_backend.schemas.nocturnal import (
    NocturnalAnomaliesResponse,
    NocturnalCallRecord,
    CellTowerHotspot
)

def get_nocturnal_anomalies(engine: IntelligenceEngine) -> NocturnalAnomaliesResponse:
    analyzer = NocturnalCallAnalyzer(engine)
    noc_calls_df, towers_df = analyzer.analyze_nocturnal_patterns()
    
    call_records = noc_calls_df.to_dict(orient='records')
    calls = [NocturnalCallRecord(**r) for r in call_records]
    
    tower_records = towers_df.to_dict(orient='records')
    towers = [CellTowerHotspot(**r) for r in tower_records]
    
    return NocturnalAnomaliesResponse(
        total_anomalies=len(calls),
        hotspots_count=len(towers),
        calls=calls,
        towers=towers
    )
