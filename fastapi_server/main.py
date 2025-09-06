from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import uvicorn
import os
from dotenv import load_dotenv

# Importar módulos locais
from database import engine, Base
from routers import auth, patients, doctors, appointments, clinic_rooms, appointment_types, insurance_plans
from auth import get_current_user

load_dotenv()

# Criar tabelas no banco de dados
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown
    pass

app = FastAPI(
    title="OrthoFlow API",
    description="Sistema de gestão para clínicas ortopédicas",
    version="1.0.0",
    lifespan=lifespan
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # URLs do frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(patients.router, prefix="/api/patients", tags=["patients"])
app.include_router(doctors.router, prefix="/api/doctors", tags=["doctors"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["appointments"])
app.include_router(clinic_rooms.router, prefix="/api/clinic-rooms", tags=["clinic-rooms"])
app.include_router(appointment_types.router, prefix="/api/appointment-types", tags=["appointment-types"])
app.include_router(insurance_plans.router, prefix="/api/insurance-plans", tags=["insurance-plans"])

@app.get("/")
async def root():
    return {"message": "OrthoFlow API está funcionando!"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "OrthoFlow API"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True if os.getenv("NODE_ENV") == "development" else False
    )