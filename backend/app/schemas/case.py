from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class CaseBase(BaseModel):
    case_type: str = Field(..., description="Type of case (Civil/Criminal/etc)")
    category: Optional[str] = Field(None, description="Case category")
    description: str = Field(..., min_length=10)
    fir_text: Optional[str] = Field(None, description="FIR text if criminal case")
    legal_sections: Optional[List[str]] = Field(default_factory=list)
    punishment_range: Optional[str] = None

class CaseCreate(CaseBase):
    complainant_id: int
    accused_id: int
    citizen_choice: Optional[str] = Field(None, pattern="^(ai|court|either)$")

class CaseUpdate(BaseModel):
    status: Optional[str] = None
    assigned_judge_id: Optional[int] = None
    human_decision: Optional[str] = None
    human_notes: Optional[str] = None
    judge_signature: Optional[str] = None

class CaseResponse(BaseModel):
    id: int
    case_number: str
    case_type: str
    category: Optional[str]
    complainant_id: int
    accused_id: int
    assigned_judge_id: Optional[int]
    ai_eligibility_score: Optional[float]
    decision_readiness_score: Optional[float]
    guilt_meter_complainant: float
    guilt_meter_accused: float
    assigned_tier: Optional[int]
    citizen_choice: Optional[str]
    status: str
    legal_sections: Optional[List[str]]
    punishment_range: Optional[str]
    description: str
    fir_text: Optional[str]
    ai_recommendation: Optional[str]
    ai_reasoning: Optional[Dict[str, Any]]
    human_decision: Optional[str]
    human_notes: Optional[str]
    judge_signature: Optional[str]
    filed_date: datetime
    decision_date: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class GuiltMeterUpdate(BaseModel):
    case_id: int
    complainant_score: float = Field(..., ge=0, le=100)
    accused_score: float = Field(..., ge=0, le=100)
    trigger_event: str
    evidence_id: Optional[int] = None
    reasoning: Optional[str] = None

class GuiltMeterHistoryResponse(BaseModel):
    id: int
    case_id: int
    complainant_score: float
    accused_score: float
    trigger_event: str
    evidence_id: Optional[int]
    reasoning: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True

class EvidenceBase(BaseModel):
    evidence_type: str = Field(..., description="Type: document/image/video/audio/witness")
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    file_url: Optional[str] = None
    file_type: Optional[str] = None
    submitted_by: str = Field(..., pattern="^(complainant|accused|court)$")

class EvidenceCreate(EvidenceBase):
    case_id: int
    submitted_by_user_id: int

class EvidenceResponse(BaseModel):
    id: int
    case_id: int
    evidence_type: str
    title: str
    description: Optional[str]
    file_url: Optional[str]
    file_type: Optional[str]
    submitted_by: str
    submitted_by_user_id: Optional[int]
    weight_impact: Optional[float]
    ai_analysis: Optional[Dict[str, Any]]
    credibility_score: Optional[float]
    submitted_at: datetime

    class Config:
        from_attributes = True