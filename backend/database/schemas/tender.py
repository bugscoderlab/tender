from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import date, time

class EvaluationCriteria(BaseModel):
    criteria: str
    weight: float

class TenderCreateRequest(BaseModel):
    title: str
    service_type: str
    
    property_name: Optional[str] = None
    property_address: Optional[str] = None
    
    scope_of_work: str
    contract_period_months: int
    
    min_budget: Optional[float] = None
    max_budget: Optional[float] = None
    
    closing_date: date
    closing_time: time
    site_visit_date: Optional[date] = None
    site_visit_time: Optional[time] = None
    
    contact_person: str
    contact_email: str
    contact_phone: str
    
    required_licenses: List[str] = []
    evaluation_criteria: List[EvaluationCriteria] = []
    
    tender_fee: Optional[float] = None
    
    tender_documents: Optional[List[str]] = []

class TenderResponse(TenderCreateRequest):
    id: int
    user_id: int
    status: str
    
    class Config:
        from_attributes = True
