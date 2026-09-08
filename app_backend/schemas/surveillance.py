from pydantic import BaseModel
from typing import List, Optional

class SurveillanceReportRecord(BaseModel):
    report_id: str
    fir_number: Optional[str] = ""
    spot_location: str
    patrol_officer_1: Optional[str] = ""
    patrol_officer_2: Optional[str] = ""
    patrol_officer_3: Optional[str] = ""
    observation_details: str
    panchnama_conducted: Optional[bool] = False
    witness_count: Optional[int] = 0

class SurveillanceHeatmapResponse(BaseModel):
    total_observations: int
    reports: List[SurveillanceReportRecord]
