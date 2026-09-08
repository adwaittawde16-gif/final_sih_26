from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class AlertItem(BaseModel):
    id: str
    severity: str
    title: str
    message: str
    timestamp: str

class AlertsResponse(BaseModel):
    total_alerts: int
    alerts: List[AlertItem]

class SuspectDossierDetails(BaseModel):
    suspect_name: str
    phone_number: str
    threat_score: float
    cctv_meetings_count: int
    fir_matches_count: int
    cdr_calls_count: int
    dossier_markdown: str

class SearchResultResponse(BaseModel):
    query: str
    total_matches: int
    fir_matches: List[Dict[str, Any]]
    cdr_matches: List[Dict[str, Any]]
    cctv_matches: List[Dict[str, Any]]

class ExecutiveSummaryResponse(BaseModel):
    summary_markdown: str

class TimelineEvent(BaseModel):
    event_id: str
    timestamp: str
    source_module: str  # FIR, CDR, CCTV, FINANCIAL, SURVEILLANCE
    color: str
    title: str
    description: str
    metadata: Dict[str, Any]

class TimelineResponse(BaseModel):
    suspect_name: str
    phone_number: str
    total_events: int
    events: List[TimelineEvent]
