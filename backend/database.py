from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./erp.db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String)
    brand_name = Column(String)
    product_name = Column(String)
    quantity = Column(Integer)
    delivery_location = Column(String)
    notes = Column(Text)
    status = Column(String, default="Pending")
    order_id_custom = Column(String, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Party(Base):
    __tablename__ = "parties"
    
    id = Column(Integer, primary_key=True, index=True)
    party_name = Column(String)
    process_type = Column(String)
    current_order = Column(String)
    current_process = Column(String)
    quantity_pcs = Column(Integer)
    status = Column(String, default="active")
    size = Column(String)
    party_id_custom = Column(String, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Material(Base):
    __tablename__ = "materials"
    
    id = Column(Integer, primary_key=True, index=True)
    material_name = Column(String)
    stock_quantity = Column(Integer, default=0)
    unit = Column(String)
    reserved_stock = Column(Integer, default=0)
    total_stock = Column(Integer, default=0)
    status = Column(String, default="In Stock")
    created_at = Column(DateTime, default=datetime.utcnow)

class ProcessSequence(Base):
    __tablename__ = "process_sequences"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String)
    process_name = Column(String)
    process_type = Column(String)
    sequence_number = Column(Integer)
    party_id = Column(Integer, nullable=True)
    input_qty = Column(Float, default=0)
    output_qty = Column(Float, default=0)
    rejection = Column(Float, default=0)
    extra = Column(Float, default=0)
    size = Column(String, nullable=True)
    rate = Column(Float, default=0)
    total_cost = Column(Float, default=0)
    total_boxes = Column(Float, default=0)
    cutting = Column(Float, default=0)
    hole = Column(Float, default=0)
    finishing = Column(String, nullable=True)
    pieces_per_box = Column(Float, default=0)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
