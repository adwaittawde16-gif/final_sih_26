from pydantic import BaseModel
from typing import List, Optional

class NocturnalTowerSchema(BaseModel):
    cell_tower_location: str
    night_call_count: int

class NocturnalAnomaliesResponse(BaseModel):
    total_anomalies: int
    towers_count: int
    towers: List[dict]
    anomalous_calls: List[dict]
