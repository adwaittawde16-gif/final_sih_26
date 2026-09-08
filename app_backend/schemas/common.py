from pydantic import BaseModel
from typing import Optional, Any

class HealthResponse(BaseModel):
    status: str
    system: str
    version: str
    total_suspects: int

class ErrorResponse(BaseModel):
    error: str
    status: int

class APIStatusResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None
