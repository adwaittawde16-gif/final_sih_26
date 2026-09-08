"""
app_backend/services/geo_service.py
----------------------------------
Service for compiling GPS Leaflet Map points across CCTV, Nocturnal, and Surveillance modules.
"""

from intelligence_engine import IntelligenceEngine
from geo_map_generator import LOCATION_COORDS
from app_backend.schemas.geo import GeoPoint, GeoPointsResponse

# Fallback coordinates for cell towers / spots if exact string match is missing
DEFAULT_LAT_LNG = {
    "Venus Wine Shop": (18.9785, 72.8310),
    "Station Road Footpath": (18.9740, 72.8245),
    "MIDC Road": (19.1180, 72.8680),
    "Bhadakamkar Marg": (18.9625, 72.8155),
    "Madanpura": (18.9760, 72.8290)
}

def get_location_coordinates(loc_name: str, index: int = 0) -> tuple[float, float]:
    for key, coords in LOCATION_COORDS.items():
        if key.lower() in loc_name.lower() or loc_name.lower() in key.lower():
            return coords

    for key, coords in DEFAULT_LAT_LNG.items():
        if key.lower() in loc_name.lower():
            return coords

    # Generate slight deterministic offset around Mumbai center (18.9780, 72.8300)
    lat = 18.9780 + ((index % 12) * 0.003) - 0.015
    lng = 72.8300 + (((index * 3) % 15) * 0.003) - 0.020
    return (lat, lng)

def get_geo_points(engine: IntelligenceEngine, category_filter: str = "") -> GeoPointsResponse:
    points: list[GeoPoint] = []
    pt_id = 1

    # 1. CCTV Co-Locations
    if not category_filter or category_filter.upper() == "CCTV":
        if not engine.cctv_df.empty:
            for idx, r in engine.cctv_df.iterrows():
                loc = str(r.get('camera_location', 'Mumbai'))
                lat, lng = get_location_coordinates(loc, idx)
                points.append(GeoPoint(
                    id=f"pt-{pt_id}",
                    lat=lat,
                    lng=lng,
                    title=f"CCTV Camera {r.get('camera_id', 'N/A')}",
                    category="CCTV",
                    timestamp=str(r.get('sighting_timestamp', '')),
                    details=f"Suspect: {r.get('suspect_name', 'Unknown')} | Confidence: {float(r.get('match_confidence', 0.8))*100:.0f}%",
                    color="#f59e0b"
                ))
                pt_id += 1

    # 2. Nocturnal Cell Towers
    if not category_filter or category_filter.upper() == "NOCTURNAL":
        if not engine.cdrs_df.empty:
            nocturnal = engine.cdrs_df[engine.cdrs_df['is_nocturnal'] == True] if 'is_nocturnal' in engine.cdrs_df.columns else engine.cdrs_df
            for idx, r in nocturnal.head(25).iterrows():
                loc = str(r.get('cell_tower_location', 'Mumbai Tower'))
                lat, lng = get_location_coordinates(loc, idx + 30)
                points.append(GeoPoint(
                    id=f"pt-{pt_id}",
                    lat=lat,
                    lng=lng,
                    title=f"Nocturnal Tower: {loc}",
                    category="NOCTURNAL",
                    timestamp=str(r.get('timestamp', '')),
                    details=f"Caller: {r.get('caller_number')} -> Receiver: {r.get('receiver_number')} ({r.get('duration_seconds', 0)}s)",
                    color="#38bdf8"
                ))
                pt_id += 1

    # 3. Surveillance Hotspots
    if not category_filter or category_filter.upper() == "SURVEILLANCE":
        if not engine.surv_df.empty:
            for idx, r in engine.surv_df.iterrows():
                loc = str(r.get('spot_location', 'Surveillance Spot'))
                lat, lng = get_location_coordinates(loc, idx + 60)
                points.append(GeoPoint(
                    id=f"pt-{pt_id}",
                    lat=lat,
                    lng=lng,
                    title=f"Field Patrol Spot: {r.get('report_id', 'N/A')}",
                    category="SURVEILLANCE",
                    timestamp=str(r.get('timestamp', '07 SEP 2026')),
                    details=f"Location: {loc} | Details: {str(r.get('observation_details', ''))[:80]}",
                    color="#ef4444"
                ))
                pt_id += 1

    return GeoPointsResponse(total_points=len(points), points=points)
