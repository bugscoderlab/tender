from pydantic import BaseModel, field_serializer
from typing import Optional
from datetime import datetime, date

class BidCreateRequest(BaseModel):
    tender_id: int
    proposed_amount: float
    proposal_document: Optional[str] = None
    cover_letter: Optional[str] = None
    company_name: str
    company_registration: Optional[str] = None
    years_of_experience: Optional[int] = None

class TenderSummary(BaseModel):
    title: str
    service_type: str
    closing_date: date
    
    @field_serializer('closing_date')
    def serialize_date(self, dt: date, _info):
        return dt.isoformat()
    
    class Config:
        from_attributes = True

class BidResponse(BidCreateRequest):
    id: int
    user_id: int
    status: str
    created_at: datetime
    updated_at: datetime
    tender: Optional[TenderSummary] = None
    
    class Config:
        from_attributes = True

class BidStatusUpdate(BaseModel):
    status: str  # approved or rejected
