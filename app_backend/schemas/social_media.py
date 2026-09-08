from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class PlatformProfile(BaseModel):
    platform: str
    handle: str
    followers_count: int
    following_count: int
    is_verified: bool
    status_flag: str
    profile_url: str

class SocialPost(BaseModel):
    post_id: str
    platform: str
    timestamp: str
    content: str
    sentiment: str
    risk_level: str
    likes: int
    shares: int
    hashtags: List[str]
    tagged_users: List[str]
    location_checkin: str

class DigitalLocationCluster(BaseModel):
    approximate_location: str
    suspect_count: int
    platforms_used: str
    devices_used: str
    suspects: List[str]

class SuspectSocialFootprint(BaseModel):
    suspect_name: str
    phone_number: str
    total_platforms: int
    total_posts: int
    overall_sentiment: str
    risk_score: float
    profiles: List[PlatformProfile]
    recent_posts: List[SocialPost]

class SocialMediaResponse(BaseModel):
    total_monitored_suspects: int
    total_flagged_posts: int
    total_location_clusters: int
    location_clusters: List[DigitalLocationCluster]
    suspects: List[SuspectSocialFootprint]
