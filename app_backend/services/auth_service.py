"""
app_backend/services/auth_service.py
------------------------------------
Role-Based Access Control (RBAC) & Forensic Audit Logging Service.

Roles:
- SUPER_ADMIN (Joint Commissioner / Special CP): Full system access, wiretap decrypt, export raw evidence.
- LEAD_INVESTIGATOR (Senior Police Inspector / IO): Create dossiers, initiate warrants, view financial trails.
- INTELLIGENCE_ANALYST (Crime Intelligence Unit): Run NLP, Graph Analytics, Anomaly detection, View summaries.
- FIELD_OFFICER (Sub-Inspector / Surveillance): Read-only maps, field alerts, live CCTV sightings.
"""

from datetime import datetime
from typing import Dict, Any, List, Optional
import hashlib
import time

# Pre-configured demo users for judging presentation
OFFICIAL_USERS = {
    "joint_cp": {
        "username": "joint_cp",
        "name": "Dr. Vivek Phansalkar, IPS",
        "badge_id": "MUM-IPS-001",
        "designation": "Joint Commissioner of Police (Crime)",
        "role": "SUPER_ADMIN",
        "permissions": ["ALL_PERMISSIONS", "DECRYPT_WIRETAPS", "EXPORT_EVIDENCE_DOCX", "AUDIT_LOG_VIEW", "MANAGE_USERS"]
    },
    "senior_pi": {
        "username": "senior_pi",
        "name": "Inspector Sanjay Deshmukh",
        "badge_id": "MUM-PI-409",
        "designation": "Senior Police Inspector, Anti-Extortion Cell",
        "role": "LEAD_INVESTIGATOR",
        "permissions": ["VIEW_ALL_DOSSIERS", "RUN_NLP_INGESTION", "VIEW_FINANCIAL_TRAIL", "CREATE_ARREST_ALERT"]
    },
    "analyst_mehta": {
        "username": "analyst_mehta",
        "name": "Sub-Inspector Ananya Mehta",
        "badge_id": "MUM-PSI-712",
        "designation": "Cyber & Telecom Intelligence Analyst",
        "role": "INTELLIGENCE_ANALYST",
        "permissions": ["RUN_GRAPH_ANALYTICS", "RUN_NLP_EXTRACTION", "VIEW_CDR_SUMMARY", "VIEW_ANOMALY_ENGINE"]
    },
    "field_patil": {
        "username": "field_patil",
        "name": "Assistant Sub-Inspector Ramesh Patil",
        "badge_id": "MUM-ASI-883",
        "designation": "Field Surveillance & Quick Response Team",
        "role": "FIELD_OFFICER",
        "permissions": ["VIEW_LIVE_MAPS", "VIEW_CCTV_FEED", "VIEW_ALERT_STREAM"]
    }
}

# In-memory forensic audit trail
FORENSIC_AUDIT_LOGS: List[Dict[str, Any]] = [
    {
        "timestamp": "2026-09-08 14:15:02",
        "username": "joint_cp",
        "officer_name": "Dr. Vivek Phansalkar, IPS",
        "action": "AUTHORIZE_INTERCEPTION_WARRANT",
        "resource": "SUSPECT_Md._Ranbir_Bhalla",
        "ip_address": "10.0.4.12 (Police HQ LAN)",
        "security_level": "RESTRICTED / TOP SECRET"
    },
    {
        "timestamp": "2026-09-08 15:30:19",
        "username": "senior_pi",
        "officer_name": "Inspector Sanjay Deshmukh",
        "action": "NLP_FIR_INGESTION",
        "resource": "FIR-2026-MUM-4091",
        "ip_address": "10.0.4.55",
        "security_level": "CONFIDENTIAL"
    },
    {
        "timestamp": "2026-09-08 16:45:00",
        "username": "analyst_mehta",
        "officer_name": "Sub-Inspector Ananya Mehta",
        "action": "GRAPH_COMMUNITY_DETECTION_RUN",
        "resource": "SYNDICATE_RING_01",
        "ip_address": "10.0.4.88",
        "security_level": "INTERNAL"
    }
]

class AuthService:
    @staticmethod
    def get_users_list() -> List[Dict[str, Any]]:
        return list(OFFICIAL_USERS.values())

    @staticmethod
    def authenticate_officer(username: str) -> Optional[Dict[str, Any]]:
        user = OFFICIAL_USERS.get(username.lower())
        if not user:
            return None
        
        # Generate cryptographic session token
        token_src = f"{username}-{time.time()}-MUMBAI-POLICE"
        session_token = "BP-" + hashlib.sha256(token_src.encode()).hexdigest()[:24].upper()
        
        # Log auth event in audit trail
        FORENSIC_AUDIT_LOGS.insert(0, {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "username": user["username"],
            "officer_name": user["name"],
            "action": "OFFICER_AUTHENTICATION_SUCCESS",
            "resource": f"RBAC_ROLE_{user['role']}",
            "ip_address": "10.0.4.99 (Secure Police Terminal)",
            "security_level": "SYSTEM_AUTH"
        })

        return {
            **user,
            "session_token": session_token,
            "authenticated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

    @staticmethod
    def log_action(username: str, action: str, resource: str, security_level: str = "CONFIDENTIAL"):
        user = OFFICIAL_USERS.get(username.lower(), {
            "name": username,
            "role": "ANONYMOUS"
        })
        FORENSIC_AUDIT_LOGS.insert(0, {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "username": username,
            "officer_name": user.get("name", username),
            "action": action,
            "resource": resource,
            "ip_address": "10.0.4.99",
            "security_level": security_level
        })

    @staticmethod
    def get_audit_trail(limit: int = 50) -> List[Dict[str, Any]]:
        return FORENSIC_AUDIT_LOGS[:limit]
