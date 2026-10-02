from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    phone = Column(String)
    
    # Role: citizen, police, lawyer, judge, admin
    role = Column(String, nullable=False, default="citizen")
    
    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    cases_as_complainant = relationship(
        "Case", 
        foreign_keys="Case.complainant_id",
        back_populates="complainant"
    )
    cases_as_accused = relationship(
        "Case", 
        foreign_keys="Case.accused_id",
        back_populates="accused"
    )
    cases_as_judge = relationship(
        "Case", 
        foreign_keys="Case.assigned_judge_id",
        back_populates="assigned_judge"
    )