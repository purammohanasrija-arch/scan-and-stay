import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.session import engine, Base, SessionLocal
from app.database.seed_data import seed_database
from app.routes import (
    auth, hotels, rooms, bookings, payments, qr_service, notifications, ai_assistant, admin
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize SQLite Database Tables
    print("Initializing Database tables...")
    Base.metadata.create_all(bind=engine)
    
    # 2. Seed default data if database is fresh
    db = SessionLocal()
    try:
        seed_database(db)
    except Exception as e:
        print(f"Error during database seeding: {e}")
    finally:
        db.close()
        
    yield
    print("Shutting down Scan & Stay server...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Secure Smart Hotel Reservation & QR-Based Management System API",
    lifespan=lifespan
)

# Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(hotels.router, prefix=settings.API_V1_STR)
app.include_router(rooms.router, prefix=settings.API_V1_STR)
app.include_router(bookings.router, prefix=settings.API_V1_STR)
app.include_router(payments.router, prefix=settings.API_V1_STR)
app.include_router(qr_service.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(ai_assistant.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "system": "Scan & Stay Smart Hotel System",
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs",
        "security_level": "Cryptographic HMAC-SHA256 + JWT RBAC"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "scan-and-stay-backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
