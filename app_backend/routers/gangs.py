"""
app_backend/routers/gangs.py
-----------------------------
APIRouter for Module 4 / Gang Detection & Investigator Lifecycle Operations.
"""

from fastapi import APIRouter, Depends, HTTPException
from intelligence_engine import IntelligenceEngine
from app_backend.dependencies import get_engine
from app_backend.schemas.gangs import (
    GangListResponse,
    GangSubGraphResponse,
    RenameGangRequest,
    MergeGangsRequest,
    TagEntityGangRequest
)
from app_backend.services import gang_service

router = APIRouter(prefix="/api/gangs", tags=["Module 4 — Gang & Syndicate Detection"])

@router.get("/list", response_model=GangListResponse, summary="Get list of all candidate & confirmed gangs")
def get_gangs_list(engine: IntelligenceEngine = Depends(get_engine)):
    return gang_service.get_all_gangs(engine)

@router.get("/{gang_id}/subgraph", response_model=GangSubGraphResponse, summary="Get internal network sub-graph for a specific gang")
def get_gang_subgraph_route(gang_id: str, engine: IntelligenceEngine = Depends(get_engine)):
    return gang_service.get_gang_subgraph(engine, gang_id)

@router.post("/{gang_id}/confirm", summary="Confirm candidate gang")
def confirm_gang_route(gang_id: str):
    gang_service.confirm_gang(gang_id)
    return {"status": "SUCCESS", "message": f"Gang {gang_id} confirmed."}

@router.post("/{gang_id}/rename", summary="Rename gang")
def rename_gang_route(gang_id: str, req: RenameGangRequest):
    gang_service.rename_gang(gang_id, req.new_name)
    return {"status": "SUCCESS", "message": f"Gang {gang_id} renamed to '{req.new_name}'."}

@router.post("/merge", summary="Merge two candidate gangs")
def merge_gangs_route(req: MergeGangsRequest):
    gang_service.merge_gangs(req.primary_gang_id, req.secondary_gang_id)
    return {"status": "SUCCESS", "message": f"Gang {req.secondary_gang_id} merged into {req.primary_gang_id}."}

@router.post("/{gang_id}/dismiss", summary="Dismiss candidate gang")
def dismiss_gang_route(gang_id: str):
    gang_service.dismiss_gang(gang_id)
    return {"status": "SUCCESS", "message": f"Gang {gang_id} dismissed."}

@router.post("/tag-entity", summary="Manually tag suspect entity with gang (Ground Truth Override)")
def tag_entity_route(req: TagEntityGangRequest):
    gang_service.tag_entity_gang(req.entity_name, req.target_gang_id)
    return {"status": "SUCCESS", "message": f"Entity '{req.entity_name}' assigned to Gang {req.target_gang_id}."}
