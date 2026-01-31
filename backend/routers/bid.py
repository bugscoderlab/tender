from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.connection import get_db
from database.models.bid import Bid
from database.models.tender import Tender
from database.schemas.bid import BidCreateRequest, BidResponse, BidStatusUpdate
from database.models.user import User
from dependencies import get_current_user
from typing import List, Optional

router = APIRouter()

@router.post("/", response_model=BidResponse)
def create_bid(
    bid_data: BidCreateRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    # Verify tender exists
    tender = session.query(Tender).filter(Tender.id == bid_data.tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found"
        )
    
    # Check if user already bid on this tender
    existing_bid = session.query(Bid).filter(
        Bid.tender_id == bid_data.tender_id,
        Bid.user_id == current_user.id
    ).first()
    
    if existing_bid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted a bid for this tender"
        )
    
    # Create new bid
    new_bid = Bid(
        tender_id=bid_data.tender_id,
        user_id=current_user.id,
        proposed_amount=bid_data.proposed_amount,
        proposal_document=bid_data.proposal_document,
        cover_letter=bid_data.cover_letter,
        company_name=bid_data.company_name,
        company_registration=bid_data.company_registration,
        years_of_experience=bid_data.years_of_experience,
    )
    
    session.add(new_bid)
    session.commit()
    session.refresh(new_bid)
    
    return new_bid

@router.get("/tender/{tender_id}", response_model=List[BidResponse])
def get_bids_by_tender(
    tender_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    # Verify tender exists and user owns it
    tender = session.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found"
        )
    
    # Only tender creator can view all bids
    if tender.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view bids for this tender"
        )
    
    bids = session.query(Bid).filter(Bid.tender_id == tender_id).all()
    return bids

@router.get("/my-bids", response_model=List[BidResponse])
def get_my_bids(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    bids = session.query(Bid).filter(Bid.user_id == current_user.id).all()
    # Eager load tender information
    for bid in bids:
        bid.tender  # This triggers the relationship loading
    return bids

@router.put("/{bid_id}/status", response_model=BidResponse)
def update_bid_status(
    bid_id: int,
    status_update: BidStatusUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    bid = session.query(Bid).filter(Bid.id == bid_id).first()
    if not bid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bid not found"
        )
    
    # Verify user owns the tender
    tender = session.query(Tender).filter(Tender.id == bid.tender_id).first()
    if tender.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this bid"
        )
    
    # Validate status
    if status_update.status not in ["pending", "approved", "rejected"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Must be 'pending', 'approved', or 'rejected'"
        )
    
    bid.status = status_update.status
    session.commit()
    session.refresh(bid)
    
    return bid

@router.get("/{bid_id}", response_model=BidResponse)
def get_bid(
    bid_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    bid = session.query(Bid).filter(Bid.id == bid_id).first()
    if not bid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bid not found"
        )
    
    # User must be bid owner or tender owner
    tender = session.query(Tender).filter(Tender.id == bid.tender_id).first()
    if bid.user_id != current_user.id and tender.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this bid"
        )
    
    return bid
