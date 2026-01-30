from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.connection import get_db
from database.models.tender import Tender
from database.schemas.tender import TenderCreateRequest, TenderResponse
from database.models.user import User
from dependencies import get_current_user
from typing import List, Optional

router = APIRouter()

@router.post("/create", response_model=TenderResponse)
def create_tender(
    tender_data: TenderCreateRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    
    new_tender = Tender(
        user_id=current_user.id,
        title=tender_data.title,
        service_type=tender_data.service_type,
        property_name=tender_data.property_name,
        property_address=tender_data.property_address,
        scope_of_work=tender_data.scope_of_work,
        contract_period_months=tender_data.contract_period_months,
        min_budget=tender_data.min_budget,
        max_budget=tender_data.max_budget,
        closing_date=tender_data.closing_date,
        closing_time=tender_data.closing_time,
        site_visit_date=tender_data.site_visit_date,
        site_visit_time=tender_data.site_visit_time,
        contact_person=tender_data.contact_person,
        contact_email=tender_data.contact_email,
        contact_phone=tender_data.contact_phone,
        required_licenses=tender_data.required_licenses,
        evaluation_criteria=[criteria.model_dump() for criteria in tender_data.evaluation_criteria],
        tender_fee=tender_data.tender_fee,
        tender_documents=tender_data.tender_documents
    )
    
    session.add(new_tender)
    session.commit()
    session.refresh(new_tender)
    
    return new_tender

@router.get("/", response_model=List[TenderResponse])
def list_tenders(
    user_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    query = session.query(Tender)
    
    if user_id:
        query = query.filter(Tender.user_id == user_id)
        
    tenders = query.all()
    return tenders

@router.get("/{tender_id}", response_model=TenderResponse)
def get_tender(
    tender_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    tender = session.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found"
        )
    return tender
