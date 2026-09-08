from pydantic import BaseModel
from typing import List, Optional

class FinancialSuspectSummary(BaseModel):
    suspect_name: str
    threat_score: Optional[float] = 0.0
    total_transactions: int
    total_volume_inr: float
    failed_withdrawals: Optional[int] = 0
    wine_shop_spent_inr: Optional[float] = 0.0
    peer_transfer_count: Optional[int] = 0

class FinancialRawRecord(BaseModel):
    transaction_id: str
    fir_number: Optional[str] = ""
    account_holder: Optional[str] = ""
    payment_mode: Optional[str] = "UPI"
    amount_inr: float
    timestamp: str
    merchant_or_payee: Optional[str] = ""
    status: Optional[str] = "Success"

class FinancialIntelligenceResponse(BaseModel):
    total_transactions: int
    total_volume_inr: float
    high_risk_suspects_count: int
    summaries: List[FinancialSuspectSummary]
    transactions: List[FinancialRawRecord]
