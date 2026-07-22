from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db, Material
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class MaterialCreate(BaseModel):
    material_name: str
    stock_quantity: int
    unit: str
    reserved_stock: Optional[int] = 0
    total_stock: Optional[int] = 0
    status: Optional[str] = "In Stock"

class MaterialUpdate(BaseModel):
    material_name: Optional[str] = None
    stock_quantity: Optional[int] = None
    unit: Optional[str] = None
    reserved_stock: Optional[int] = None
    total_stock: Optional[int] = None
    status: Optional[str] = None

@router.get("/")
async def get_materials(db: Session = Depends(get_db)):
    materials = db.query(Material).order_by(Material.created_at.desc()).all()
    return {"success": True, "data": materials}

@router.get("/{material_id}")
async def get_material(material_id: int, db: Session = Depends(get_db)):
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    return {"success": True, "data": material}

@router.post("/")
async def create_material(material: MaterialCreate, db: Session = Depends(get_db)):
    # Calculate total stock if not provided
    total_stock = material.total_stock if material.total_stock else (material.stock_quantity + material.reserved_stock)
    
    db_material = Material(
        material_name=material.material_name,
        stock_quantity=material.stock_quantity,
        unit=material.unit,
        reserved_stock=material.reserved_stock,
        total_stock=total_stock,
        status=material.status
    )
    db.add(db_material)
    db.commit()
    db.refresh(db_material)
    return {"success": True, "data": db_material}

@router.put("/{material_id}")
async def update_material(material_id: int, material: MaterialUpdate, db: Session = Depends(get_db)):
    db_material = db.query(Material).filter(Material.id == material_id).first()
    if not db_material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    for key, value in material.model_dump(exclude_unset=True).items():
        setattr(db_material, key, value)
    
    # Recalculate total stock if stock_quantity or reserved_stock changed
    if material.stock_quantity is not None or material.reserved_stock is not None:
        db_material.total_stock = db_material.stock_quantity + db_material.reserved_stock
    
    db.commit()
    db.refresh(db_material)
    return {"success": True, "data": db_material}

@router.delete("/{material_id}")
async def delete_material(material_id: int, db: Session = Depends(get_db)):
    db_material = db.query(Material).filter(Material.id == material_id).first()
    if not db_material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    db.delete(db_material)
    db.commit()
    return {"success": True, "message": "Material deleted successfully"}
