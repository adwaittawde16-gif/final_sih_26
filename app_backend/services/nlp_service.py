"""
app_backend/services/nlp_service.py
----------------------------------
NLP & Co-Accused Entity Extraction Service
"""

import re
from intelligence_engine import IntelligenceEngine
from nlp_fir_analyzer import MO_CATEGORIES
from co_accused_network import CoAccusedNetwork
from app_backend.schemas.nlp import (
    FIRNLPRequest,
    ExtractedEntity,
    ExtractedRelationship,
    FIRNLPResponse
)

KNOWN_LOCATIONS = [
    "Dadar", "Lower Parel", "Byculla", "Agripada", "Lamington Road",
    "Grant Road", "Station Road", "Madanpura", "Venus Wine Shop", "MIDC Road",
    "Worli", "Bandra", "Andheri", "Kurla", "Colaba"
]

def parse_fir_narrative(engine: IntelligenceEngine, req: FIRNLPRequest) -> FIRNLPResponse:
    text = req.fir_text or ""
    fir_num = req.fir_number or "FIR-DRAFT-2026"

    entities: list[ExtractedEntity] = []
    suspects_found: set[str] = set()
    locations_found: set[str] = set()
    crimes_found: set[str] = set()
    relationships: list[ExtractedRelationship] = []

    # 1. Extract Suspect Names matching intelligence engine database
    for name in engine.name_to_phone.keys():
        # Case-insensitive substring or name part search
        name_clean = str(name).strip()
        first_last = name_clean.split()
        if len(first_last) >= 2:
            short_name = f"{first_last[0]} {first_last[-1]}"
            if name_clean.lower() in text.lower() or short_name.lower() in text.lower():
                suspects_found.add(name_clean)
                entities.append(ExtractedEntity(text=name_clean, category="PERSON", confidence=0.95))

    # 2. Extract Locations
    for loc in KNOWN_LOCATIONS:
        if loc.lower() in text.lower():
            locations_found.add(loc)
            entities.append(ExtractedEntity(text=loc, category="LOCATION", confidence=0.90))

    # 3. Extract Crime Types (M.O.)
    for category, keywords in MO_CATEGORIES.items():
        for kw in keywords:
            if kw.lower() in text.lower():
                crimes_found.add(category)
                entities.append(ExtractedEntity(text=category, category="CRIME_TYPE", confidence=0.88))
                break

    # 4. Extract IPC Sections
    ipc_matches = re.findall(r'(?:IPC|Section|Sec\.?)\s*([0-9]{3}[A-Z]?)', text, re.IGNORECASE)
    for ipc in set(ipc_matches):
        entities.append(ExtractedEntity(text=f"IPC Section {ipc}", category="IPC_SECTION", confidence=0.98))

    # 5. Extract Phones
    phone_matches = re.findall(r'\+?91-?[0-9]{10}', text)
    for p in set(phone_matches):
        entities.append(ExtractedEntity(text=p, category="PHONE", confidence=0.99))

    # Build Relationships
    suspect_list = list(suspects_found)
    for i in range(len(suspect_list)):
        for j in range(i + 1, len(suspect_list)):
            relationships.append(ExtractedRelationship(
                source=suspect_list[i],
                target=suspect_list[j],
                relation_type="CO_ACCUSED"
            ))

    for s in suspect_list:
        for loc in locations_found:
            relationships.append(ExtractedRelationship(
                source=s,
                target=loc,
                relation_type="OPERATED_AT"
            ))

    co_accused_list = suspect_list[1:] if len(suspect_list) > 1 else []

    return FIRNLPResponse(
        fir_id=f"NLP-{len(text)}",
        fir_number=fir_num,
        raw_text=text,
        entities=entities,
        suspects=suspect_list,
        co_accused=co_accused_list,
        locations=list(locations_found),
        crime_types=list(crimes_found),
        relationships=relationships
    )
