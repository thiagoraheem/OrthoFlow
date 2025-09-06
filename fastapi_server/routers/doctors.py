from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from database import get_db
from models import Doctor
from schemas import (
    Doctor as DoctorSchema,
    DoctorCreate,
    DoctorUpdate,
    User as UserSchema
)
from auth import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[DoctorSchema])
async def get_doctors(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None, description="Buscar por nome ou especialidade"),
    active_only: bool = Query(True, description="Apenas médicos ativos"),
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Listar médicos com paginação e busca."""
    
    query = db.query(Doctor)
    
    # Filtrar apenas médicos ativos se solicitado
    if active_only:
        query = query.filter(Doctor.is_active == True)
    
    # Aplicar filtro de busca se fornecido
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Doctor.first_name.ilike(search_term)) |
            (Doctor.last_name.ilike(search_term)) |
            (Doctor.specialty.ilike(search_term))
        )
    
    doctors = query.offset(skip).limit(limit).all()
    return doctors

@router.get("/{doctor_id}", response_model=DoctorSchema)
async def get_doctor(
    doctor_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Obter médico por ID."""
    
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )
    
    return doctor

@router.post("/", response_model=DoctorSchema, status_code=status.HTTP_201_CREATED)
async def create_doctor(
    doctor_data: DoctorCreate,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Criar novo médico."""
    
    # Verificar se número de licença já existe
    existing_doctor = db.query(Doctor).filter(
        Doctor.license_number == doctor_data.license_number
    ).first()
    if existing_doctor:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Doctor with this license number already exists"
        )
    
    # Verificar se email já existe
    existing_email = db.query(Doctor).filter(Doctor.email == doctor_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Doctor with this email already exists"
        )
    
    # Criar médico
    try:
        db_doctor = Doctor(**doctor_data.dict())
        db.add(db_doctor)
        db.commit()
        db.refresh(db_doctor)
        return db_doctor
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating doctor"
        )

@router.put("/{doctor_id}", response_model=DoctorSchema)
async def update_doctor(
    doctor_id: uuid.UUID,
    doctor_data: DoctorUpdate,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Atualizar médico."""
    
    # Buscar médico
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )
    
    # Verificar se número de licença já existe em outro médico (se foi alterado)
    if doctor_data.license_number and doctor_data.license_number != doctor.license_number:
        existing_doctor = db.query(Doctor).filter(
            Doctor.license_number == doctor_data.license_number,
            Doctor.id != doctor_id
        ).first()
        if existing_doctor:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Doctor with this license number already exists"
            )
    
    # Verificar se email já existe em outro médico (se foi alterado)
    if doctor_data.email and doctor_data.email != doctor.email:
        existing_email = db.query(Doctor).filter(
            Doctor.email == doctor_data.email,
            Doctor.id != doctor_id
        ).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Doctor with this email already exists"
            )
    
    # Atualizar campos
    try:
        update_data = doctor_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(doctor, field, value)
        
        db.commit()
        db.refresh(doctor)
        return doctor
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating doctor"
        )

@router.delete("/{doctor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_doctor(
    doctor_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Deletar médico (soft delete - marca como inativo)."""
    
    # Buscar médico
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )
    
    # Marcar como inativo em vez de deletar
    try:
        doctor.is_active = False
        db.commit()
        db.refresh(doctor)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deactivating doctor"
        )

@router.get("/search/license/{license_number}", response_model=DoctorSchema)
async def search_doctor_by_license(
    license_number: str,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Buscar médico por número de licença."""
    
    doctor = db.query(Doctor).filter(Doctor.license_number == license_number).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )
    
    return doctor

@router.get("/specialty/{specialty}", response_model=List[DoctorSchema])
async def get_doctors_by_specialty(
    specialty: str,
    active_only: bool = Query(True, description="Apenas médicos ativos"),
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Buscar médicos por especialidade."""
    
    query = db.query(Doctor).filter(Doctor.specialty.ilike(f"%{specialty}%"))
    
    if active_only:
        query = query.filter(Doctor.is_active == True)
    
    doctors = query.all()
    return doctors