"""
app_backend/services/cctv_service.py
"""

from intelligence_engine import IntelligenceEngine
from app_backend.schemas.cctv import CCTVMeetingsResponse, CCTVMeetingRecord

def get_cctv_meetings(engine: IntelligenceEngine) -> CCTVMeetingsResponse:
    meetings_df = engine.get_cctv_meetings()
    if meetings_df.empty:
        return CCTVMeetingsResponse(
            total_encounters=0,
            avg_confidence_pct=0.0,
            mean_distance_meters=0.0,
            meetings=[]
        )
        
    records = meetings_df.to_dict(orient='records')
    meetings = [CCTVMeetingRecord(**r) for r in records]
    
    avg_conf = float(meetings_df['avg_match_confidence'].mean() * 100.0) if 'avg_match_confidence' in meetings_df else 0.0
    mean_dist = float(meetings_df['avg_distance_meters'].mean()) if 'avg_distance_meters' in meetings_df else 0.0
    
    return CCTVMeetingsResponse(
        total_encounters=len(meetings),
        avg_confidence_pct=round(avg_conf, 1),
        mean_distance_meters=round(mean_dist, 1),
        meetings=meetings
    )
