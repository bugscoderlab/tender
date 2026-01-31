from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database.connection import Base
from datetime import datetime

class Bid(Base):
    __tablename__ = "bids"

    id = Column(Integer, primary_key=True, index=True)
    tender_id = Column(Integer, ForeignKey("tenders.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Bid details
    proposed_amount = Column(Float, nullable=False)
    proposal_document = Column(String, nullable=True)  # URL or path to uploaded document
    cover_letter = Column(Text, nullable=True)
    
    # Company information
    company_name = Column(String, nullable=False)
    company_registration = Column(String, nullable=True)
    years_of_experience = Column(Integer, nullable=True)
    
    # Status
    status = Column(String, default="pending")  # pending, approved, rejected
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tender = relationship("Tender", back_populates="bids")
    user = relationship("User")
