from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class GeoPoint(BaseModel):
    id: str
    lat: float
    lng: float
    title: str
    category: str  # CCTV, NOCTURNAL_TOWER, SURVEILLANCE_SPOT
    timestamp: str
    details: str
    color: str

class GeoPointsResponse(BaseModel):
    total_points: int
    points: List[GeoPoint]
