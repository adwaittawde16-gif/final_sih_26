"""
app_backend/services/surveillance_service.py
"""

from intelligence_engine import IntelligenceEngine
from app_backend.schemas.surveillance import SurveillanceHeatmapResponse, SurveillanceReportRecord

def get_surveillance_heatmap(engine: IntelligenceEngine) -> SurveillanceHeatmapResponse:
    surv_df = engine.surv_df.copy()
    records = surv_df.to_dict(orient='records')
    reports = [SurveillanceReportRecord(**r) for r in records]
    
    return SurveillanceHeatmapResponse(
        total_observations=len(reports),
        reports=reports
    )
