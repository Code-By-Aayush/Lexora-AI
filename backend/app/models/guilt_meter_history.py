from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class GuiltMeterHistory(Base):
    __tablename__ = "guilt_meter_history"
    
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    
    # Meter State
    complainant_score = Column(Float, nullable=False)
    accused_score = Column(Float, nullable=False)
    
    # What caused the change
    trigger_event = Column(String, nullable=False)  # e.g., "Evidence #5 submitted by accused"
    evidence_id = Column(Integer, ForeignKey("evidence.id"), nullable=True)
    
    # Explanation
    reasoning = Column(Text)
    
    # Timestamp
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    case = relationship("Case", back_populates="guilt_meter_history")