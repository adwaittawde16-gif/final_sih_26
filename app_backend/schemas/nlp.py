from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class FIRNLPRequest(BaseModel):
    fir_text: str
    fir_number: Optional[str] = ""

class ExtractedEntity(BaseModel):
    text: str
    category: str  # PERSON, LOCATION, CRIME_TYPE, IPC_SECTION, PHONE
    confidence: float

class ExtractedRelationship(BaseModel):
    source: str
    target: str
    relation_type: str  # CO_ACCUSED, OPERATED_AT, CHARGED_UNDER

class FIRNLPResponse(BaseModel):
    fir_id: str
    fir_number: str
    raw_text: str
    entities: List[ExtractedEntity]
    suspects: List[str]
    co_accused: List[str]
    locations: List[str]
    crime_types: List[str]
    relationships: List[ExtractedRelationship]
