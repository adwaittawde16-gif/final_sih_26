from pydantic import BaseModel
from typing import List, Optional

class NocturnalCallRecord(BaseModel):
    caller_name: str
    receiver_name: str
    call_type: str
    duration_seconds: int
    cell_tower_location: str
    timestamp: str

class CellTowerHotspot(BaseModel):
    cell_tower_location: str
    nocturnal_call_count: int

class NocturnalAnomaliesResponse(BaseModel):
    total_anomalies: int
    hotspots_count: int
    calls: List[NocturnalCallRecord]
    towers: List[CellTowerHotspot]
