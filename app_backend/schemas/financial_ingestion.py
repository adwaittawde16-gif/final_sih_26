"""
app_backend/schemas/financial_ingestion.py
-----------------------------------------
Pydantic schemas for financial data ingestion responses.
"""

from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime


class IngestionEntity(BaseModel):
    """Entity extracted during financial data ingestion."""
    type: str  # person, account, bank, location, etc.
    value: str
    confidence: Optional[float] = 1.0
    metadata: Optional[Dict[str, Any]] = None


class IngestionRelationship(BaseModel):
    """Relationship extracted during financial data ingestion."""
    source: str
    target: str
    relationship_type: str
    confidence: Optional[float] = 1.0
    metadata: Optional[Dict[str, Any]] = None


class SuspiciousPattern(BaseModel):
    """Suspicious pattern detected during ingestion."""
    pattern_type: str
    description: str
    risk_score: float
    count: int
    entities_involved: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


class FinancialIngestionResponse(BaseModel):
    """Response model for financial data ingestion operations."""
    success: bool
    source_type: str
    records_ingested: int
    entities_extracted: List[IngestionEntity]
    relationships_mapped: List[IngestionRelationship]
    suspicious_patterns_detected: List[SuspiciousPattern]
    processing_time_ms: Optional[float] = None
    error_message: Optional[str] = None
    graph_impact: Optional[Dict[str, Any]] = None
    timestamp: str = datetime.now().isoformat()


class BankStatementIngestionRequest(BaseModel):
    """Request model for bank statement ingestion."""
    bank_type: str = "generic"  # sbi, hdfc, icici, axis, etc.
    fir_link: Optional[str] = None  # FIR number to link transactions to
    is_csv: bool = True


class PaymentLogIngestionRequest(BaseModel):
    """Request model for UPI/IMPS/NEFT/RTGS log ingestion."""
    payment_type: str  # upi, imps, neft, rtgs
    fir_link: Optional[str] = None
    is_csv: bool = True


class PaymentGatewayIngestionRequest(BaseModel):
    """Request model for payment gateway report ingestion."""
    gateway: str  # razorpay, payu, phonepe, etc.
    fir_link: Optional[str] = None
    is_csv: bool = True


class CashRecordIngestionRequest(BaseModel):
    """Request model for cash withdrawal/deposit record ingestion."""
    record_type: str  # withdrawal or deposit
    fir_link: str  # FIR number is required for cash records
    is_csv: bool = True


# Response models for specific ingestion types
class BankStatementIngestionResponse(FinancialIngestionResponse):
    bank_type: str


class PaymentLogIngestionResponse(FinancialIngestionResponse):
    payment_type: str


class PaymentGatewayIngestionResponse(FinancialIngestionResponse):
    gateway: str


class CashRecordIngestionResponse(FinancialIngestionResponse):
    record_type: str