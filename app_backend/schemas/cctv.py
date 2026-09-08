from pydantic import BaseModel
from typing import List, Optional

class CCTVMeetingRecord(BaseModel):
    suspect_1: str
    suspect_2: str
    cdr_call_count: Optional[int] = 1
    camera_id: Optional[str] = "CAM-01"
    camera_location: str
    sighting_time_s1: Optional[str] = None
    sighting_time_s2: Optional[str] = None
    time_delta_minutes: Optional[float] = 0.0
    avg_distance_meters: float
    avg_match_confidence: float
    sighting_status: Optional[str] = "Verified Match"

class CCTVMeetingsResponse(BaseModel):
    total_encounters: int
    avg_confidence_pct: float
    mean_distance_meters: float
    meetings: List[CCTVMeetingRecord]
