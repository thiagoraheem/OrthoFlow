from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from database import get_db
from models import AppointmentType
from schemas import (
    AppointmentType as AppointmentTypeSchema,
    AppointmentTypeCreate,
    AppointmentTypeUpdate,
    User as UserSchema
)
from auth import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[AppointmentTypeSchema])
async def get_appointment_types(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    is_active: Optional[bool] = Query(None, description="Filtrar por status ativo"),
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Listar tipos de consulta com filtros."""
    
    query = db.query(AppointmentType)
    
    # Aplicar filtros
    if is_active is not None:
        query = query.filter(AppointmentType.is_active == is_active)
    
    appointment_types = query.offset(skip).limit(limit).all()
    return appointment_types

@router.get("/{type_id}", response_model=AppointmentTypeSchema)
async def get_appointment_type(
    type_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Obter tipo de consulta por ID."""
    
    appointment_type = db.query(AppointmentType).filter(AppointmentType.id == type_id).first()
    if not appointment_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment type not found"
        )
    
    return appointment_type

@router.post("/", response_model=AppointmentTypeSchema, status_code=status.HTTP_201_CREATED)
async def create_appointment_type(
    type_data: AppointmentTypeCreate,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Criar novo tipo de consulta."""
    
    # Verificar se já existe tipo com o mesmo nome
    existing_type = db.query(AppointmentType).filter(
        AppointmentType.name == type_data.name
    ).first()
    
    if existing_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Appointment type with this name already exists"
        )
    
    # Criar tipo de consulta
    try:
        db_type = AppointmentType(**type_data.dict())
        db.add(db_type)
        db.commit()
        db.refresh(db_type)
        return db_type
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating appointment type"
        )

@router.put("/{type_id}", response_model=AppointmentTypeSchema)
async def update_appointment_type(
    type_id: uuid.UUID,
    type_data: AppointmentTypeUpdate,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Atualizar tipo de consulta."""
    
    # Buscar tipo de consulta
    appointment_type = db.query(AppointmentType).filter(AppointmentType.id == type_id).first()
    if not appointment_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment type not found"
        )
    
    # Verificar se nome já existe (se foi alterado)
    update_data = type_data.dict(exclude_unset=True)
    if 'name' in update_data and update_data['name'] != appointment_type.name:
        existing_type = db.query(AppointmentType).filter(
            AppointmentType.name == update_data['name'],
            AppointmentType.id != type_id
        ).first()
        
        if existing_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Appointment type with this name already exists"
            )
    
    # Atualizar campos
    try:
        for field, value in update_data.items():
            setattr(appointment_type, field, value)
        
        db.commit()
        db.refresh(appointment_type)
        return appointment_type
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating appointment type"
        )

@router.delete("/{type_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_appointment_type(
    type_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Deletar tipo de consulta."""
    
    # Buscar tipo de consulta
    appointment_type = db.query(AppointmentType).filter(AppointmentType.id == type_id).first()
    if not appointment_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment type not found"
        )
    
    # Verificar se há agendamentos usando este tipo
    from ..models import Appointment
    appointments_using_type = db.query(Appointment).filter(
        Appointment.appointment_type_id == type_id
    ).first()
    
    if appointments_using_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete appointment type that is being used in appointments"
        )
    
    # Deletar tipo de consulta
    try:
        db.delete(appointment_type)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting appointment type"
        )

@router.patch("/{type_id}/status", response_model=AppointmentTypeSchema)
async def toggle_appointment_type_status(
    type_id: uuid.UUID,
    is_active: bool = Query(..., description="Novo status do tipo de consulta"),
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Alterar status ativo/inativo do tipo de consulta."""
    
    # Buscar tipo de consulta
    appointment_type = db.query(AppointmentType).filter(AppointmentType.id == type_id).first()
    if not appointment_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment type not found"
        )
    
    # Atualizar status
    try:
        appointment_type.is_active = is_active
        db.commit()
        db.refresh(appointment_type)
        return appointment_type
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating appointment type status"
        )

@router.get("/search/by-name", response_model=List[AppointmentTypeSchema])
async def search_appointment_types_by_name(
    name: str = Query(..., description="Nome ou parte do nome do tipo de consulta"),
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Buscar tipos de consulta por nome."""
    
    appointment_types = db.query(AppointmentType).filter(
        AppointmentType.name.ilike(f"%{name}%"),
        AppointmentType.is_active == True
    ).all()
    
    return appointment_types