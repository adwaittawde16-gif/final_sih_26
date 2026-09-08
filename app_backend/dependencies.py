"""
app_backend/dependencies.py
---------------------------
Provides singleton instances of core intelligence engines for FastAPI dependency injection.
"""

from intelligence_engine import IntelligenceEngine

_ENGINE_INSTANCE = None

def get_engine() -> IntelligenceEngine:
    global _ENGINE_INSTANCE
    if _ENGINE_INSTANCE is None:
        _ENGINE_INSTANCE = IntelligenceEngine()
    return _ENGINE_INSTANCE
