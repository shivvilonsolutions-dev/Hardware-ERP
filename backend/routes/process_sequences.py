from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db, ProcessSequence
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class ProcessSequenceCreate(BaseModel):
    order_id: str
    process_name: str
    process_type: str
    sequence_number: int
    party_id: Optional[int] = None
    input_qty: Optional[float] = 0
    output_qty: Optional[float] = 0
    rejection: Optional[float] = 0
    extra: Optional[float] = 0
    size: Optional[str] = None
    rate: Optional[float] = 0
    total_cost: Optional[float] = 0
    total_boxes: Optional[float] = 0
    cutting: Optional[float] = 0
    hole: Optional[float] = 0
    finishing: Optional[str] = None
    pieces_per_box: Optional[float] = 0
    status: Optional[str] = "pending"

class ProcessSequenceUpdate(BaseModel):
    process_name: Optional[str] = None
    process_type: Optional[str] = None
    sequence_number: Optional[int] = None
    party_id: Optional[int] = None
    input_qty: Optional[float] = None
    output_qty: Optional[float] = None
    rejection: Optional[float] = None
    extra: Optional[float] = None
    size: Optional[str] = None
    rate: Optional[float] = None
    total_cost: Optional[float] = None
    total_boxes: Optional[float] = None
    cutting: Optional[float] = None
    hole: Optional[float] = None
    finishing: Optional[str] = None
    pieces_per_box: Optional[float] = None
    status: Optional[str] = None

@router.get("/")
async def get_process_sequences(db: Session = Depends(get_db)):
    sequences = db.query(ProcessSequence).order_by(ProcessSequence.sequence_number).all()
    return {"success": True, "data": sequences}

@router.get("/order/{order_id}")
async def get_process_sequences_by_order(order_id: str, db: Session = Depends(get_db)):
    sequences = db.query(ProcessSequence).filter(
        ProcessSequence.order_id == order_id
    ).order_by(ProcessSequence.sequence_number).all()
    return {"success": True, "data": sequences}

@router.get("/{sequence_id}")
async def get_process_sequence(sequence_id: int, db: Session = Depends(get_db)):
    sequence = db.query(ProcessSequence).filter(ProcessSequence.id == sequence_id).first()
    if not sequence:
        raise HTTPException(status_code=404, detail="Process sequence not found")
    return {"success": True, "data": sequence}

@router.post("/")
async def create_process_sequence(sequence: ProcessSequenceCreate, db: Session = Depends(get_db)):
    db_sequence = ProcessSequence(
        order_id=sequence.order_id,
        process_name=sequence.process_name,
        process_type=sequence.process_type,
        sequence_number=sequence.sequence_number,
        party_id=sequence.party_id,
        input_qty=sequence.input_qty,
        output_qty=sequence.output_qty,
        rejection=sequence.rejection,
        extra=sequence.extra,
        size=sequence.size,
        rate=sequence.rate,
        total_cost=sequence.total_cost,
        total_boxes=sequence.total_boxes,
        cutting=sequence.cutting,
        hole=sequence.hole,
        finishing=sequence.finishing,
        pieces_per_box=sequence.pieces_per_box,
        status=sequence.status
    )
    db.add(db_sequence)
    db.commit()
    db.refresh(db_sequence)
    return {"success": True, "data": db_sequence}

@router.put("/{sequence_id}")
async def update_process_sequence(sequence_id: int, sequence: ProcessSequenceUpdate, db: Session = Depends(get_db)):
    db_sequence = db.query(ProcessSequence).filter(ProcessSequence.id == sequence_id).first()
    if not db_sequence:
        raise HTTPException(status_code=404, detail="Process sequence not found")
    
    for key, value in sequence.model_dump(exclude_unset=True).items():
        setattr(db_sequence, key, value)
    
    db.commit()
    db.refresh(db_sequence)
    return {"success": True, "data": db_sequence}

@router.delete("/{sequence_id}")
async def delete_process_sequence(sequence_id: int, db: Session = Depends(get_db)):
    db_sequence = db.query(ProcessSequence).filter(ProcessSequence.id == sequence_id).first()
    if not db_sequence:
        raise HTTPException(status_code=404, detail="Process sequence not found")
    
    db.delete(db_sequence)
    db.commit()
    return {"success": True, "message": "Process sequence deleted successfully"}

@router.delete("/order/{order_id}")
async def delete_process_sequences_by_order(order_id: str, db: Session = Depends(get_db)):
    db.query(ProcessSequence).filter(ProcessSequence.order_id == order_id).delete()
    db.commit()
    return {"success": True, "message": "Process sequences deleted successfully"}
