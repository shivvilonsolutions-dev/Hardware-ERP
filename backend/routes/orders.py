from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db, Order
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class OrderCreate(BaseModel):
    client_name: str
    brand_name: str
    product_name: str
    quantity: int
    delivery_location: str
    notes: Optional[str] = ""
    status: Optional[str] = "Pending"

class OrderUpdate(BaseModel):
    client_name: Optional[str] = None
    brand_name: Optional[str] = None
    product_name: Optional[str] = None
    quantity: Optional[int] = None
    delivery_location: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None

@router.get("/")
async def get_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    return {"success": True, "data": orders}

@router.get("/{order_id}")
async def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"success": True, "data": order}

@router.post("/")
async def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    # Generate custom order ID
    last_order = db.query(Order).order_by(Order.id.desc()).first()
    last_id = last_order.id if last_order else 0
    order_id_custom = f"ORD-{1000 + last_id + 1}"
    
    db_order = Order(
        client_name=order.client_name,
        brand_name=order.brand_name,
        product_name=order.product_name,
        quantity=order.quantity,
        delivery_location=order.delivery_location,
        notes=order.notes,
        status=order.status,
        order_id_custom=order_id_custom
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return {"success": True, "data": db_order}

@router.put("/{order_id}")
async def update_order(order_id: int, order: OrderUpdate, db: Session = Depends(get_db)):
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    for key, value in order.model_dump(exclude_unset=True).items():
        setattr(db_order, key, value)
    
    db.commit()
    db.refresh(db_order)
    return {"success": True, "data": db_order}

@router.delete("/{order_id}")
async def delete_order(order_id: int, db: Session = Depends(get_db)):
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    db.delete(db_order)
    db.commit()
    return {"success": True, "message": "Order deleted successfully"}
