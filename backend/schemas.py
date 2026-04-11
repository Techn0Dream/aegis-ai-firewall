from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ScanRequest(BaseModel):
    prompt: str = Field(..., description="The user prompt to scan")
    session_id: Optional[str] = Field(None, description="Optional session ID for context tracking")
    user_id: Optional[str] = Field(None, description="Optional user ID for logging rate limits")

class ThreatIntelligence(BaseModel):
    signature_id: str
    attack_class: str
    frequency: str

class ThreatDetail(BaseModel):
    threat_type: str
    score: float
    description: str
    intelligence: Optional[ThreatIntelligence] = None

class ScanResponse(BaseModel):
    event_id: str
    decision: str  # ALLOW, WARN, BLOCK
    severity_level: str # LOW, MEDIUM, HIGH
    risk_score: float
    threats: List[ThreatDetail]
    reason: str

class ScanLogResponse(BaseModel):
    id: int
    event_hash: str
    prompt: str
    session_id: Optional[str]
    user_id: Optional[str]
    risk_score: float
    severity_level: str
    decision: str
    threat_types: str
    reason: str
    created_at: datetime

    class Config:
        from_attributes = True
