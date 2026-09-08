"""
app_backend/services/dossier_service.py
"""

import os
from intelligence_engine import IntelligenceEngine
from alert_notifier import generate_police_alerts
from query_engine import IntelligenceQueryEngine
from generate_dossier import generate_suspect_dossier
from executive_report_generator import generate_executive_report
from app_backend.schemas.dossiers import (
    AlertsResponse,
    AlertItem,
    SuspectDossierDetails,
    SearchResultResponse,
    ExecutiveSummaryResponse,
    TimelineEvent,
    TimelineResponse
)

def get_alerts() -> AlertsResponse:
    alert_list, _ = generate_police_alerts()
    alerts = [
        AlertItem(
            id=str(idx + 1),
            severity=str(a.get("severity", "HIGH")),
            title=str(a.get("title", "Police Notification")),
            message=str(a.get("message", "")),
            timestamp=str(a.get("timestamp", "07 SEP 2026 18:42 IST"))
        )
        for idx, a in enumerate(alert_list)
    ]
    return AlertsResponse(total_alerts=len(alerts), alerts=alerts)

def get_suspect_dossier(engine: IntelligenceEngine, name: str) -> SuspectDossierDetails:
    scores = engine.calculate_threat_scores()
    sub = scores[scores['suspect_name'].str.strip().str.lower() == name.strip().lower()]
    if sub.empty:
        raise ValueError(f"Suspect '{name}' not found.")
        
    row = sub.iloc[0]
    q_engine = IntelligenceQueryEngine(engine)
    res = q_engine.search_suspect(name)
    
    # Generate markdown string
    dossier_md = generate_suspect_dossier(name, output_folder=".")
    if os.path.exists(dossier_md):
        with open(dossier_md, encoding="utf-8") as f:
            content = f.read()
    else:
        content = f"# Dossier: {name}\n\nThreat score: {row['total_threat_score']:.1f}/100"
        
    return SuspectDossierDetails(
        suspect_name=str(row['suspect_name']),
        phone_number=str(row['phone_number']),
        threat_score=float(row['total_threat_score']),
        cctv_meetings_count=len(res['cctv_matches']),
        fir_matches_count=len(res['fir_matches']),
        cdr_calls_count=len(res['cdr_matches']),
        dossier_markdown=content
    )

def search_intelligence(engine: IntelligenceEngine, query: str) -> SearchResultResponse:
    q_engine = IntelligenceQueryEngine(engine)
    res = q_engine.search_suspect(query)
    
    fir_m = res['fir_matches'].to_dict(orient='records') if not res['fir_matches'].empty else []
    cdr_m = res['cdr_matches'].to_dict(orient='records') if not res['cdr_matches'].empty else []
    cctv_m = res['cctv_matches'].to_dict(orient='records') if not res['cctv_matches'].empty else []
    
    total = len(fir_m) + len(cdr_m) + len(cctv_m)
    
    return SearchResultResponse(
        query=query,
        total_matches=total,
        fir_matches=fir_m,
        cdr_matches=cdr_m,
        cctv_matches=cctv_m
    )

def get_executive_summary() -> ExecutiveSummaryResponse:
    file_path = generate_executive_report("Executive_Intelligence_Summary.md")
    if os.path.exists(file_path):
        with open(file_path, encoding="utf-8") as f:
            content = f.read()
    else:
        content = "# Executive Intelligence Summary\n\nAll intelligence feeds operational."
    return ExecutiveSummaryResponse(summary_markdown=content)

def get_suspect_timeline(engine: IntelligenceEngine, name: str) -> TimelineResponse:
    phone = engine.name_to_phone.get(name, "")
    events = []
    evt_counter = 1

    # 1. FIR Events
    firs = engine.firs_df[engine.firs_df['accused_name'].str.strip().str.lower() == name.strip().lower()] if not engine.firs_df.empty else []
    if not isinstance(firs, list) and not firs.empty:
        for _, f in firs.iterrows():
            events.append(TimelineEvent(
                event_id=f"evt-{evt_counter}",
                timestamp=str(f.get('date_time_fir', '01 SEP 2026 10:00')),
                source_module="FIR",
                color="#ef4444",
                title=f"FIR #{f.get('fir_number', 'N/A')} Registered",
                description=f"Police Station: {f.get('police_station', 'N/A')} | Act/Sec: {f.get('act_and_sections', 'N/A')}",
                metadata={"fir_number": str(f.get('fir_number', '')), "police_station": str(f.get('police_station', '')), "officer": str(f.get('investigating_officer', ''))}
            ))
            evt_counter += 1

    # 2. CDR Calls
    if phone:
        cdrs = engine.cdrs_df[(engine.cdrs_df['caller_number'] == phone) | (engine.cdrs_df['receiver_number'] == phone)] if not engine.cdrs_df.empty else []
        if not isinstance(cdrs, list) and not cdrs.empty:
            for _, c in cdrs.iterrows():
                other_p = c['receiver_number'] if c['caller_number'] == phone else c['caller_number']
                other_n = engine.phone_to_name.get(other_p, other_p)
                events.append(TimelineEvent(
                    event_id=f"evt-{evt_counter}",
                    timestamp=str(c.get('timestamp', '02 SEP 2026 14:00')),
                    source_module="CDR",
                    color="#38bdf8",
                    title=f"Call/SMS with {other_n}",
                    description=f"Type: {c.get('call_type', 'Call')} | Duration: {c.get('duration_seconds', 0)}s | Tower: {c.get('cell_tower_location', 'N/A')}",
                    metadata={"other_party": other_n, "phone": other_p, "duration_sec": int(c.get('duration_seconds', 0))}
                ))
                evt_counter += 1

    # 3. CCTV Sightings
    cctv = engine.cctv_df[engine.cctv_df['suspect_name'].str.strip().str.lower() == name.strip().lower()] if not engine.cctv_df.empty else []
    if not isinstance(cctv, list) and not cctv.empty:
        for _, v in cctv.iterrows():
            events.append(TimelineEvent(
                event_id=f"evt-{evt_counter}",
                timestamp=str(v.get('sighting_timestamp', '03 SEP 2026 16:30')),
                source_module="CCTV",
                color="#f59e0b",
                title=f"CCTV Camera {v.get('camera_id', 'N/A')} Sighting",
                description=f"Location: {v.get('camera_location', 'N/A')} | Confidence: {float(v.get('match_confidence', 0.9))*100:.0f}%",
                metadata={"camera_id": str(v.get('camera_id', '')), "location": str(v.get('camera_location', '')), "status": str(v.get('sighting_status', ''))}
            ))
            evt_counter += 1

    # 4. Financial Transactions
    fin = engine.fin_df[engine.fin_df['account_holder'].str.strip().str.lower() == name.strip().lower()] if not engine.fin_df.empty else []
    if not isinstance(fin, list) and not fin.empty:
        for _, t in fin.iterrows():
            events.append(TimelineEvent(
                event_id=f"evt-{evt_counter}",
                timestamp=str(t.get('timestamp', '04 SEP 2026 11:15')),
                source_module="FINANCIAL",
                color="#10b981",
                title=f"UPI Transfer: INR {t.get('amount_inr', 0):,} ({t.get('status', 'SUCCESS')})",
                description=f"Mode: {t.get('payment_mode', 'UPI')} | Payee: {t.get('merchant_or_payee', 'N/A')}",
                metadata={"amount_inr": float(t.get('amount_inr', 0)), "payee": str(t.get('merchant_or_payee', '')), "status": str(t.get('status', ''))}
            ))
            evt_counter += 1

    events.sort(key=lambda e: e.timestamp)
    return TimelineResponse(
        suspect_name=name,
        phone_number=phone,
        total_events=len(events),
        events=events
    )
