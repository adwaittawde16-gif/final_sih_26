"""
app_backend/routers/social_media.py
----------------------------------
APIRouter for Module 9: Digital Footprint & Social Media Intelligence
"""

from fastapi import APIRouter, Depends
from intelligence_engine import IntelligenceEngine
from app_backend.dependencies import get_engine
from app_backend.schemas.social_media import SocialMediaResponse
from app_backend.services import social_media_service

router = APIRouter(prefix="/api/social-analytics", tags=["Module 9 — Digital Footprint & Social Media"])

@router.get("/footprint", response_model=SocialMediaResponse, summary="Get cross-platform digital footprint & social media analytics")
def get_footprint(engine: IntelligenceEngine = Depends(get_engine)):
    return social_media_service.get_social_media_analytics(engine)
