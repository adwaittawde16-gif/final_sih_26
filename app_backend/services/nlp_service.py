"""
app_backend/services/nlp_service.py
----------------------------------
NLP & Co-Accused Entity Extraction Service using AdvancedNLPEngine.
"""

from intelligence_engine import IntelligenceEngine
from app_backend.services.nlp_engine import AdvancedNLPEngine
from app_backend.schemas.nlp import (
    FIRNLPRequest,
    ExtractedEntity,
    ExtractedRelationship,
    SuspectDetail,
    LegalStatuteDetail,
    ModusOperandiDetail,
    FIRNLPResponse
)

def parse_fir_narrative(engine: IntelligenceEngine, req: FIRNLPRequest) -> FIRNLPResponse:
    text = req.fir_text or ""
    fir_num = req.fir_number or "FIR-DRAFT-2026"

    # Initialize advanced NLP engine with master intelligence suspect registry
    nlp_engine = AdvancedNLPEngine(
        master_suspects=engine.all_suspects,
        master_phones=engine.name_to_phone
    )

    extraction = nlp_engine.extract_entities(text)

    # Format into Pydantic models
    entities = [
        ExtractedEntity(text=e["text"], category=e["category"], confidence=e["confidence"])
        for e in extraction["entities"]
    ]

    suspect_details = [
        SuspectDetail(
            name=s["name"],
            raw_mention=s["raw_mention"],
            matched_in_database=s["matched_in_database"],
            confidence=s["confidence"],
            phone_number=s["phone_number"],
            inferred_role=s["inferred_role"]
        )
        for s in extraction["suspects"]
    ]

    suspect_names = [s["name"] for s in extraction["suspects"]]
    co_accused_list = suspect_names[1:] if len(suspect_names) > 1 else []

    statutes = [
        LegalStatuteDetail(
            raw_section=st["raw_section"],
            code=st["code"],
            title=st["title"],
            bns_equivalent=st["bns_equivalent"],
            severity_score=st["severity_score"],
            category=st["category"],
            bailable=st["bailable"],
            confidence=st["confidence"]
        )
        for st in extraction["statutes"]
    ]

    modus_operandi = [
        ModusOperandiDetail(
            crime_category=mo["crime_category"],
            confidence=mo["confidence"],
            matched_indicators=mo["matched_indicators"],
            count=mo["count"]
        )
        for mo in extraction["modus_operandi"]
    ]

    relationships = [
        ExtractedRelationship(
            source=rel["source"],
            target=rel["target"],
            relation_type=rel["relation_type"],
            evidence=rel.get("evidence", ""),
            confidence=rel.get("confidence", 0.9)
        )
        for rel in extraction["relationships"]
    ]

    crime_types = [mo.crime_category for mo in modus_operandi]

    return FIRNLPResponse(
        fir_id=f"NLP-EXT-{len(text)}-{hash(text) & 0xffff}",
        fir_number=fir_num,
        raw_text=text,
        entities=entities,
        suspects=suspect_names,
        suspect_details=suspect_details,
        co_accused=co_accused_list,
        locations=extraction["locations"],
        weapons=extraction["weapons"],
        vehicles=extraction["vehicles"],
        aliases=extraction["aliases"],
        statutes=statutes,
        modus_operandi=modus_operandi,
        financial_amounts=extraction["financial_amounts"],
        crime_types=crime_types,
        relationships=relationships,
        case_severity_score=extraction["case_severity_score"],
        summary_verdict=extraction["summary_verdict"]
    )
