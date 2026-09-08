"""
app_backend/services/crime_ring_service.py
"""

from intelligence_engine import IntelligenceEngine
from crime_ring_detector import CrimeRingDetector
from app_backend.schemas.crime_rings import CrimeRingsResponse, CrimeRingRecord

def get_crime_rings(engine: IntelligenceEngine) -> CrimeRingsResponse:
    detector = CrimeRingDetector(engine)
    syndicates_df = detector.detect_syndicates()
    records = syndicates_df.to_dict(orient='records')
    
    rings = []
    for r in records:
        members_val = r.get('members', [])
        if isinstance(members_val, str):
            members_list = [m.strip() for m in members_val.split(',')]
        else:
            members_list = list(members_val)
            
        rings.append(CrimeRingRecord(
            syndicate_id=str(r.get('syndicate_id', '')),
            ring_leader=str(r.get('ring_leader', '')),
            leader_phone=str(r.get('leader_phone', '')),
            member_count=int(r.get('member_count', len(members_list))),
            members=members_list,
            threat_level=str(r.get('threat_level', 'CRITICAL')),
            primary_hub=str(r.get('primary_hub', 'Mumbai Central'))
        ))
        
    return CrimeRingsResponse(
        total_rings=len(rings),
        priority_ring="RING-01",
        rings=rings
    )
