"""
app_backend/routers/audit.py
-----------------------------
REST API Endpoints for SHA-256 Audit Log Verification & Forensic Inspection.
Provides audit log fetching and automated cryptographic hash chain verification.

NOTE: Access control (RBAC) on these endpoints will be integrated when the authentication
module is hooked up.
For: Brihanmumbai Police Department — SIH 26
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Dict, Any, List
from app_backend.services.audit_logger import audit_logger

router = APIRouter(prefix="/api/audit", tags=["Cryptographic Audit Log"])

@router.get("/verify", summary="Verify SHA-256 Audit Chain Integrity")
def verify_audit_chain() -> Dict[str, Any]:
    """
    Walks the entire audit log database sequentially and re-evaluates
    every SHA-256 hash link from Genesis block (ID #1) to the latest entry.
    Returns proof of cryptographic integrity or pinpoints exact tampered entry.
    """
    return audit_logger.verify_audit_chain()

@router.get("/logs", summary="Retrieve Recent Audit Logs")
def get_audit_logs(limit: int = Query(default=50, ge=1, le=500)) -> List[Dict[str, Any]]:
    """
    Retrieves the most recent audit log entries containing timestamps, endpoints,
    request parameters, source IPs, and SHA-256 hash chains.
    """
    return audit_logger.get_recent_logs(limit=limit)
