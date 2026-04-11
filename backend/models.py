from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from database import Base

class ScanLog(Base):
    __tablename__ = "scan_logs"

    id = Column(Integer, primary_key=True, index=True)
    event_hash = Column(String(64), unique=True, index=True, nullable=False) # SHA-256 Hash
    prompt = Column(Text, nullable=False)
    session_id = Column(String, index=True, nullable=True)
    user_id = Column(String, index=True, nullable=True)
    risk_score = Column(Float, nullable=False)
    severity_level = Column(String, nullable=False) # LOW, MEDIUM, HIGH
    decision = Column(String, nullable=False)  # ALLOW, WARN, BLOCK
    threat_types = Column(Text, nullable=False)  # Comma separated
    reason = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
