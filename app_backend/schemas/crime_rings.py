from pydantic import BaseModel
from typing import List, Optional

class CrimeRingRecord(BaseModel):
    syndicate_id: str
    ring_leader: str
    leader_phone: Optional[str] = ""
    member_count: int
    members: List[str]
    threat_level: str
    primary_hub: Optional[str] = "Mumbai Central"

class CrimeRingsResponse(BaseModel):
    total_rings: int
    priority_ring: Optional[str] = "RING-01"
    rings: List[CrimeRingRecord]
