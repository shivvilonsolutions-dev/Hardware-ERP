from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="Hardware ERP API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hardware ERP API is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

# Import routes
from routes import orders, parties, materials, process_sequences

app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(parties.router, prefix="/api/parties", tags=["parties"])
app.include_router(materials.router, prefix="/api/materials", tags=["materials"])
app.include_router(process_sequences.router, prefix="/api/process-sequences", tags=["process-sequences"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
