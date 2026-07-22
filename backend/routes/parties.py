from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db, Party
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class PartyCreate(BaseModel):
    party_name: str
    process_type: str
    current_order: str
    current_process: str
    quantity_pcs: int
    status: Optional[str] = "active"
    size: str

class PartyUpdate(BaseModel):
    party_name: Optional[str] = None
    process_type: Optional[str] = None
    current_order: Optional[str] = None
    current_process: Optional[str] = None
    quantity_pcs: Optional[int] = None
    status: Optional[str] = None
    size: Optional[str] = None

@router.get("/")
async def get_parties(db: Session = Depends(get_db)):
    parties = db.query(Party).order_by(Party.created_at.desc()).all()
    return {"success": True, "data": parties}

@router.get("/{party_id}")
async def get_party(party_id: int, db: Session = Depends(get_db)):
    party = db.query(Party).filter(Party.id == party_id).first()
    if not party:
        raise HTTPException(status_code=404, detail="Party not found")
    return {"success": True, "data": party}

@router.post("/")
async def create_party(party: PartyCreate, db: Session = Depends(get_db)):
    # Generate custom party ID
    last_party = db.query(Party).order_by(Party.id.desc()).first()
    last_id = last_party.id if last_party else 0
    party_id_custom = f"PTY-{100 + last_id + 1}"
    
    db_party = Party(
        party_name=party.party_name,
        process_type=party.process_type,
        current_order=party.current_order,
        current_process=party.current_process,
        quantity_pcs=party.quantity_pcs,
        status=party.status,
        size=party.size,
        party_id_custom=party_id_custom
    )
    db.add(db_party)
    db.commit()
    db.refresh(db_party)
    return {"success": True, "data": db_party}

@router.put("/{party_id}")
async def update_party(party_id: int, party: PartyUpdate, db: Session = Depends(get_db)):
    db_party = db.query(Party).filter(Party.id == party_id).first()
    if not db_party:
        raise HTTPException(status_code=404, detail="Party not found")
    
    for key, value in party.model_dump(exclude_unset=True).items():
        setattr(db_party, key, value)
    
    db.commit()
    db.refresh(db_party)
    return {"success": True, "data": db_party}

@router.delete("/{party_id}")
async def delete_party(party_id: int, db: Session = Depends(get_db)):
    db_party = db.query(Party).filter(Party.id == party_id).first()
    if not db_party:
        raise HTTPException(status_code=404, detail="Party not found")
    
    db.delete(db_party)
    db.commit()
    return {"success": True, "message": "Party deleted successfully"}
