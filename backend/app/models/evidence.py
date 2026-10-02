from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class Evidence(Base):
    __tablename__ = "evidence"
    
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    
    # Evidence Details
    evidence_type = Column(String, nullable=False)  # digital, documentary, witness, expert
    title = Column(String, nullable=False)
    description = Column(Text)
    
    # File Information
    file_url = Column(String)  # Path to stored file
    file_type = Column(String)  # pdf, image, video, audio
    
    # Submission Info
    submitted_by = Column(String, nullable=False)  # complainant, accused, police
    submitted_by_user_id = Column(Integer, ForeignKey("users.id"))
    
    # AI Analysis
    weight_impact = Column(Float, default=0.0)  # -30 to +30
    ai_analysis = Column(JSON)  # AI's reasoning for weight
    credibility_score = Column(Float, default=0.0)  # 0-100
    
    # Timestamps
    submitted_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    case = relationship("Case", back_populates="evidence")