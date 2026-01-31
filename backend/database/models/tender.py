from sqlalchemy import Column, String, Integer, Float, Date, Time, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from database.connection import Base

class Tender(Base):
    __tablename__ = "tenders"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Basic Information
    title = Column(String, nullable=False)
    service_type = Column(String, nullable=False)
    
    # Property Details
    property_name = Column(String, nullable=True)
    property_address = Column(String, nullable=True)
    
    # Scope & Duration
    scope_of_work = Column(Text, nullable=False)
    contract_period_months = Column(Integer, nullable=False)
    
    # Budget Range
    min_budget = Column(Float, nullable=True)
    max_budget = Column(Float, nullable=True)
    
    # Timeline
    closing_date = Column(Date, nullable=False)
    closing_time = Column(Time, nullable=False)
    site_visit_date = Column(Date, nullable=True)
    site_visit_time = Column(Time, nullable=True)
    
    # Contact Information
    contact_person = Column(String, nullable=False)
    contact_email = Column(String, nullable=False)
    contact_phone = Column(String, nullable=False)
    
    # Required Licenses (JSON array of strings)
    required_licenses = Column(JSON, nullable=True)
    
    # Evaluation Criteria (JSON array of objects)
    evaluation_criteria = Column(JSON, nullable=True)
    
    # Tender Fee
    tender_fee = Column(Float, nullable=True)
    
    # Tender Documents (JSON list of paths/urls)
    tender_documents = Column(JSON, nullable=True)
    
    status = Column(String, default="open") # open, closed, awarded
    approval_status = Column(String, default="pending") # pending, approved, rejected
    
    # Relationships
    creator = relationship("User")
    bids = relationship("Bid", back_populates="tender", cascade="all, delete-orphan") 
