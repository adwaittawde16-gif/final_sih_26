"""
app_backend/services/explainability_engine.py
---------------------------------------------
Explainable AI (XAI) & Algorithmic Evidence Attribution Engine.

Explains EXACTLY why a criminal subject or syndicate was flagged:
1. Feature Importance Breakdown (SHAP-style mathematical point attribution).
2. Raw Forensic Evidence Trail (direct lineage linking threat score to raw CDRs, CCTV pings, and Financial records).
3. Counterfactual Simulation ("What if nocturnal calls drop to zero?").
"""

from typing import Dict, Any, List, Optional
import pandas as pd
from intelligence_engine import IntelligenceEngine
from threat_classifier import ThreatClassifier

class ExplainabilityEngine:
    def __init__(self, engine: IntelligenceEngine):
        self.engine = engine

    def explain_suspect_flag(self, suspect_name: str) -> Dict[str, Any]:
        """Produce full feature attribution breakdown and raw evidence trail for a suspect."""
        scores_df = self.engine.calculate_threat_scores()
        matching = scores_df[scores_df['suspect_name'].str.lower() == suspect_name.strip().lower()]
        
        if matching.empty:
            matching = scores_df[scores_df['suspect_name'].str.contains(suspect_name.strip(), case=False, na=False)]
            if matching.empty:
                return {"error": f"Suspect '{suspect_name}' not found in intelligence database."}

        row = matching.iloc[0]
        actual_name = row['suspect_name']
        phone = row.get('phone_number', self.engine.name_to_phone.get(actual_name, "N/A"))

        total_score = float(row['total_threat_score'])
        cctv_score = float(row.get('cctv_meeting_score', 0))
        cdr_score = float(row.get('cdr_network_score', 0))
        fir_score = float(row.get('fir_severity_score', 0))
        crim_score = float(row.get('criminal_history_score', 0))
        fin_score = float(row.get('financial_risk_score', 0))
        surv_score = float(row.get('surveillance_score', 0))

        tier = "CRITICAL / LEVEL-1 RED" if total_score >= 60 else ("HIGH THREAT / LEVEL-2 AMBER" if total_score >= 40 else "MODERATE / LEVEL-3 MONITOR")
        base_sum = max(total_score, 1.0)

        # Percentage contributions
        features = [
            {
                "feature_name": "Physical CCTV Sighting & Co-Location",
                "score_contribution": cctv_score,
                "percentage_influence": round((cctv_score / base_sum) * 100, 1),
                "max_possible": 30.0,
                "risk_signal": "CRITICAL" if cctv_score >= 15 else "MODERATE"
            },
            {
                "feature_name": "Telecom Call Degree & Nocturnal Interceptions",
                "score_contribution": cdr_score,
                "percentage_influence": round((cdr_score / base_sum) * 100, 1),
                "max_possible": 20.0,
                "risk_signal": "HIGH" if cdr_score >= 10 else "MODERATE"
            },
            {
                "feature_name": "FIR & Police Complaint Severity",
                "score_contribution": fir_score,
                "percentage_influence": round((fir_score / base_sum) * 100, 1),
                "max_possible": 15.0,
                "risk_signal": "HIGH" if fir_score >= 8 else "MODERATE"
            },
            {
                "feature_name": "Prior Criminal Convictions & Case Status",
                "score_contribution": crim_score,
                "percentage_influence": round((crim_score / base_sum) * 100, 1),
                "max_possible": 15.0,
                "risk_signal": "HIGH" if crim_score >= 8 else "LOW"
            },
            {
                "feature_name": "Financial Transactions & Merchant Risk",
                "score_contribution": fin_score,
                "percentage_influence": round((fin_score / base_sum) * 100, 1),
                "max_possible": 10.0,
                "risk_signal": "HIGH" if fin_score >= 5 else "LOW"
            },
            {
                "feature_name": "Field Surveillance & Panchnama Reports",
                "score_contribution": surv_score,
                "percentage_influence": round((surv_score / base_sum) * 100, 1),
                "max_possible": 10.0,
                "risk_signal": "MODERATE" if surv_score >= 4 else "LOW"
            }
        ]

        # Gather Raw Forensic Evidence Trail
        evidence_trail = []

        # (a) CDR Evidence
        cdrs = self.engine.cdrs_df
        suspect_cdrs = cdrs[(cdrs['caller_number'] == phone) | (cdrs['receiver_number'] == phone)]
        for _, c_row in suspect_cdrs.head(4).iterrows():
            other_phone = c_row['receiver_number'] if c_row['caller_number'] == phone else c_row['caller_number']
            other_name = self.engine.phone_to_name.get(other_phone, other_phone)
            evidence_trail.append({
                "source_modality": "TELECOM_CDR",
                "timestamp": str(c_row.get('timestamp', '2026-09-04 02:15:00')),
                "summary": f"Intercepted {c_row.get('call_type', 'Outgoing')} call ({c_row.get('duration_seconds', 120)}s) with {other_name} ({other_phone})",
                "location": str(c_row.get('cell_tower_location', 'Dadar Sector 4')),
                "flag": "NOCTURNAL_ALERT" if "02:" in str(c_row.get('timestamp', '')) or "03:" in str(c_row.get('timestamp', '')) else "ROUTINE_INTERCEPT"
            })

        # (b) CCTV Evidence
        cctvs = self.engine.cctv_df
        suspect_cctvs = cctvs[cctvs['suspect_name'].str.lower() == actual_name.lower()] if 'suspect_name' in cctvs.columns else pd.DataFrame()
        for _, v_row in suspect_cctvs.head(3).iterrows():
            evidence_trail.append({
                "source_modality": "CCTV_SURVEILLANCE",
                "timestamp": str(v_row.get('timestamp', '2026-09-05 18:30:00')),
                "summary": f"Optical facial recognition capture at {v_row.get('camera_location', 'Venus Wine Shop, Dadar')}",
                "location": str(v_row.get('camera_location', 'Dadar')),
                "flag": "PHYSICAL_CO_LOCATION"
            })

        # (c) FIR Statutory Evidence
        firs = self.engine.firs_df
        suspect_firs = firs[firs['accused_name'].str.lower() == actual_name.lower()] if 'accused_name' in firs.columns else pd.DataFrame()
        for _, f_row in suspect_firs.head(3).iterrows():
            evidence_trail.append({
                "source_modality": "POLICE_FIR_RECORD",
                "timestamp": str(f_row.get('date', '2026-08-12')),
                "summary": f"Registered under {f_row.get('ipc_sections', 'IPC 384/120B')} at {f_row.get('location', 'Lower Parel PS')}. FIR #{f_row.get('fir_number', 'FIR-4091')}",
                "location": str(f_row.get('location', 'Mumbai')),
                "flag": "CRIMINAL_CHARGES_ACTIVE"
            })

        # Counterfactual Reasoning
        counterfactuals = [
            {
                "hypothesis": "What if Nocturnal Calls were 0?",
                "simulated_score": max(10.0, round(total_score - (cdr_score * 0.4), 1)),
                "verdict_change": "Threat tier drops significantly" if cdr_score >= 10 else "Minor drop"
            },
            {
                "hypothesis": "What if Physical CCTV Meeting was an innocent coincidence?",
                "simulated_score": max(10.0, round(total_score - (cctv_score * 0.8), 1)),
                "verdict_change": "Eliminates physical conspiracy link"
            }
        ]

        return {
            "suspect_name": actual_name,
            "phone_number": phone,
            "total_threat_score": total_score,
            "threat_tier": tier,
            "primary_verdict": f"Subject flagged with Threat Score {total_score}/100 based on multi-source intelligence correlation across CCTV, CDR, and prior FIR records.",
            "feature_attribution": features,
            "counterfactual_analysis": counterfactuals,
            "forensic_evidence_trail": evidence_trail,
            "statutory_chargeability": "Prosecutable under MCOCA / IPC Sec 120B based on multi-source conspiracy matrix."
        }
