"""
app_backend/schemas/gangs.py
----------------------------
Pydantic schemas for Gang/Group Detection and investigator management.
"""

from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app_backend.schemas.cdr import NetworkNode, NetworkEdge

class GangRecord(BaseModel):
    gang_id: str
    name: str
    status: str  # CANDIDATE, CONFIRMED, DISMISSED
    member_count: int
    members: List[str]
    ring_leader: str
    leader_phone: str
    aggregate_threat_score: float
    primary_locations: List[str]
    date_first_detected: str

class GangListResponse(BaseModel):
    total_gangs: int
    confirmed_count: int
    candidate_count: int
    dismissed_count: int
    gangs: List[GangRecord]

class GangSubGraphResponse(BaseModel):
    gang_id: str
    gang_name: str
    total_nodes: int
    total_edges: int
    nodes: List[NetworkNode]
    edges: List[NetworkEdge]

class RenameGangRequest(BaseModel):
    new_name: str

class MergeGangsRequest(BaseModel):
    primary_gang_id: str
    secondary_gang_id: str

class TagEntityGangRequest(BaseModel):
    entity_name: str
    target_gang_id: str
