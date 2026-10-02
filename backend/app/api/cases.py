from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime

from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.case import Case
from app.models.guilt_meter_history import GuiltMeterHistory
from app.schemas.case import CaseCreate, CaseResponse, GuiltMeterUpdate

router = APIRouter(prefix="/api/cases", tags=["Case Management"])

def generate_case_number():
    """Generate unique case number"""
    return f"LEX-{datetime.now().year}-{str(uuid.uuid4())[:8].upper()}"

@router.post("/", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
async def create_case(
    case_data: CaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new case (FIR filing)"""
    
    # Only citizens and police can file cases
    if current_user.role not in ["citizen", "police"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only citizens and police can file cases"
        )
    
    # Verify accused exists
    accused = db.query(User).filter(User.id == case_data.accused_id).first()
    if not accused:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Accused user not found"
        )
    
    # Create new case
    new_case = Case(
        case_number=generate_case_number(),
        case_type=case_data.case_type,
        category=case_data.category,
        description=case_data.description,
        fir_text=case_data.fir_text,
        complainant_id=current_user.id,
        accused_id=case_data.accused_id,
        legal_sections=case_data.legal_sections,
        status="filed",
        guilt_meter_complainant=50.0,  # Start at neutral
        guilt_meter_accused=50.0,
        ai_eligibility_score=0.0,
        decision_readiness_score=0.0
    )
    
    db.add(new_case)
    db.commit()
    db.refresh(new_case)
    
    # Create initial guilt meter history entry
    initial_history = GuiltMeterHistory(
        case_id=new_case.id,
        complainant_score=50.0,
        accused_score=50.0,
        trigger_event="Case filed - Initial state",
        reasoning="Case starts with neutral 50-50 meter"
    )
    
    db.add(initial_history)
    db.commit()
    
    return new_case

@router.get("/", response_model=List[CaseResponse])
async def list_cases(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List cases based on user role"""
    
    if current_user.role == "citizen":
        # Citizens see only their own cases
        cases = db.query(Case).filter(
            (Case.complainant_id == current_user.id) | 
            (Case.accused_id == current_user.id)
        ).offset(skip).limit(limit).all()
    
    elif current_user.role in ["judge", "admin", "police"]:
        # Judges, admins, and police see all cases
        cases = db.query(Case).offset(skip).limit(limit).all()
    
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view cases"
        )
    
    return cases

@router.get("/{case_id}", response_model=CaseResponse)
async def get_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get case details by ID"""
    
    case = db.query(Case).filter(Case.id == case_id).first()
    
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )
    
    # Check permissions
    if current_user.role == "citizen":
        if case.complainant_id != current_user.id and case.accused_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own cases"
            )
    
    return case

@router.patch("/{case_id}/guilt-meter", response_model=CaseResponse)
async def update_guilt_meter(
    case_id: int,
    meter_update: GuiltMeterUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update guilt meter (AI or Judge only)"""
    
    # Only judges and AI service can update guilt meter
    if current_user.role not in ["judge", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only judges can manually update guilt meter"
        )
    
    case = db.query(Case).filter(Case.id == case_id).first()
    
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )
    
    # Update guilt meter
    case.guilt_meter_complainant = meter_update.complainant_score
    case.guilt_meter_accused = meter_update.accused_score
    case.updated_at = datetime.utcnow()
    
    # Log the change in history
    history_entry = GuiltMeterHistory(
        case_id=case.id,
        complainant_score=meter_update.complainant_score,
        accused_score=meter_update.accused_score,
        trigger_event=meter_update.trigger_event,
        reasoning=meter_update.reasoning
    )
    
    db.add(history_entry)
    db.commit()
    db.refresh(case)
    
    return case

@router.get("/{case_id}/guilt-meter-history")
async def get_guilt_meter_history(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get guilt meter change history for a case"""
    
    case = db.query(Case).filter(Case.id == case_id).first()
    
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )
    
    # Check permissions
    if current_user.role == "citizen":
        if case.complainant_id != current_user.id and case.accused_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own cases"
            )
    
    history = db.query(GuiltMeterHistory).filter(
        GuiltMeterHistory.case_id == case_id
    ).order_by(GuiltMeterHistory.timestamp.desc()).all()
    
    return history