from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class Case(Base):
    __tablename__ = "cases"
    
    id = Column(Integer, primary_key=True, index=True)
    case_number = Column(String, unique=True, index=True, nullable=False)
    
    # Case Classification
    case_type = Column(String, nullable=False)  # traffic, cheque_bounce, etc.
    category = Column(String)  # Criminal, Civil, etc.
    
    # Parties
    complainant_id = Column(Integer, ForeignKey("users.id"))
    accused_id = Column(Integer, ForeignKey("users.id"))
    assigned_judge_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # AI Scoring
    ai_eligibility_score = Column(Float, default=0.0)  # 0-100
    decision_readiness_score = Column(Float, default=0.0)  # 0-100
    
    # Guilt Meter (The Core Feature!)
    guilt_meter_complainant = Column(Float, default=50.0)  # 0-100
    guilt_meter_accused = Column(Float, default=50.0)      # 0-100
    
    # Tier Assignment
    assigned_tier = Column(Integer)  # 1, 2, or 3
    citizen_choice = Column(String)  # 'ai_judge' or 'human_judge'
    
    # Case Status
    status = Column(String, default="filed")  
    # Possible values: filed, investigation, evidence_submission, 
    # ai_analysis, human_review, final_decision, closed, appealed
    
    # Legal Information
    legal_sections = Column(JSON)  # List of BNS/BNSS sections
    punishment_range = Column(String)  # e.g., "0-6 months" or "Fine up to 5000"
    
    # Case Description
    description = Column(Text)
    fir_text = Column(Text)
    
    # AI Decision
    ai_recommendation = Column(Text, nullable=True)
    ai_reasoning = Column(JSON, nullable=True)  # Structured explanation
    
    # Human Review
    human_decision = Column(String, nullable=True)  # approved, modified, rejected
    human_notes = Column(Text, nullable=True)
    judge_signature = Column(String, nullable=True)  # Digital signature hash
    
    # Timestamps
    filed_date = Column(DateTime, default=datetime.utcnow)
    decision_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    complainant = relationship("User", foreign_keys=[complainant_id], back_populates="cases_as_complainant")
    accused = relationship("User", foreign_keys=[accused_id], back_populates="cases_as_accused")
    assigned_judge = relationship("User", foreign_keys=[assigned_judge_id], back_populates="cases_as_judge")
    
    evidence = relationship("Evidence", back_populates="case", cascade="all, delete-orphan")
    guilt_meter_history = relationship("GuiltMeterHistory", back_populates="case", cascade="all, delete-orphan")