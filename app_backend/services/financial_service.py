"""
app_backend/services/financial_service.py
"""

from intelligence_engine import IntelligenceEngine
from financial_analyzer import FinancialAnalyzer
from app_backend.schemas.financial import (
    FinancialIntelligenceResponse,
    FinancialSuspectSummary,
    FinancialRawRecord
)

def get_financial_intelligence(engine: IntelligenceEngine) -> FinancialIntelligenceResponse:
    analyzer = FinancialAnalyzer(engine)
    summary_df, raw_df = analyzer.analyze_financial_trails()
    
    summary_records = summary_df.to_dict(orient='records')
    summaries = [FinancialSuspectSummary(**r) for r in summary_records]
    
    raw_records = raw_df.to_dict(orient='records')
    transactions = [FinancialRawRecord(**r) for r in raw_records]
    
    total_vol = float(raw_df['amount_inr'].sum()) if 'amount_inr' in raw_df else 0.0
    high_risk_count = len([s for s in summaries if (s.wine_shop_spent_inr or 0) > 10000])
    
    return FinancialIntelligenceResponse(
        total_transactions=len(transactions),
        total_volume_inr=round(total_vol, 2),
        high_risk_suspects_count=high_risk_count,
        summaries=summaries,
        transactions=transactions
    )
