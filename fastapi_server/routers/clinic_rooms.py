from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from database import get_db
from models import ClinicRoom
from schemas import (
    ClinicRoom as ClinicRoomSchema,
    ClinicRoomCreate,
    ClinicRoomUpdate,
    User as UserSchema
)
from auth import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[ClinicRoomSchema])
async def get_clinic_rooms(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    is_available: Optional[bool] = Query(None, description="Filtrar por disponibilidade"),
    room_type: Optional[str] = Query(None, description="Filtrar por tipo de sala"),
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Listar salas clínicas com filtros."""
    
    query = db.query(ClinicRoom)
    
    # Aplicar filtros
    if is_available is not None:
        query = query.filter(ClinicRoom.is_available == is_available)
    
    if room_type:
        query = query.filter(ClinicRoom.room_type.ilike(f"%{room_type}%"))
    
    rooms = query.offset(skip).limit(limit).all()
    return rooms

@router.get("/{room_id}", response_model=ClinicRoomSchema)
async def get_clinic_room(
    room_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Obter sala clínica por ID."""
    
    room = db.query(ClinicRoom).filter(ClinicRoom.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clinic room not found"
        )
    
    return room

@router.post("/", response_model=ClinicRoomSchema, status_code=status.HTTP_201_CREATED)
async def create_clinic_room(
    room_data: ClinicRoomCreate,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Criar nova sala clínica."""
    
    # Verificar se já existe sala com o mesmo nome
    existing_room = db.query(ClinicRoom).filter(
        ClinicRoom.name == room_data.name
    ).first()
    
    if existing_room:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Room with this name already exists"
        )
    
    # Criar sala
    try:
        db_room = ClinicRoom(**room_data.dict())
        db.add(db_room)
        db.commit()
        db.refresh(db_room)
        return db_room
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating clinic room"
        )

@router.put("/{room_id}", response_model=ClinicRoomSchema)
async def update_clinic_room(
    room_id: uuid.UUID,
    room_data: ClinicRoomUpdate,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Atualizar sala clínica."""
    
    # Buscar sala
    room = db.query(ClinicRoom).filter(ClinicRoom.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clinic room not found"
        )
    
    # Verificar se nome já existe (se foi alterado)
    update_data = room_data.dict(exclude_unset=True)
    if 'name' in update_data and update_data['name'] != room.name:
        existing_room = db.query(ClinicRoom).filter(
            ClinicRoom.name == update_data['name'],
            ClinicRoom.id != room_id
        ).first()
        
        if existing_room:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Room with this name already exists"
            )
    
    # Atualizar campos
    try:
        for field, value in update_data.items():
            setattr(room, field, value)
        
        db.commit()
        db.refresh(room)
        return room
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating clinic room"
        )

@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_clinic_room(
    room_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Deletar sala clínica."""
    
    # Buscar sala
    room = db.query(ClinicRoom).filter(ClinicRoom.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clinic room not found"
        )
    
    # Verificar se há agendamentos ativos para esta sala
    from ..models import Appointment
    active_appointments = db.query(Appointment).filter(
        Appointment.room_id == room_id,
        Appointment.status.in_(["scheduled", "confirmed"])
    ).first()
    
    if active_appointments:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete room with active appointments"
        )
    
    # Deletar sala
    try:
        db.delete(room)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting clinic room"
        )

@router.patch("/{room_id}/availability", response_model=ClinicRoomSchema)
async def toggle_room_availability(
    room_id: uuid.UUID,
    is_available: bool = Query(..., description="Nova disponibilidade da sala"),
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Alterar disponibilidade da sala."""
    
    # Buscar sala
    room = db.query(ClinicRoom).filter(ClinicRoom.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clinic room not found"
        )
    
    # Atualizar disponibilidade
    try:
        room.is_available = is_available
        db.commit()
        db.refresh(room)
        return room
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating room availability"
        )

@router.get("/available/by-date/{date}", response_model=List[ClinicRoomSchema])
async def get_available_rooms_by_date(
    date: str,
    time_slot: Optional[str] = Query(None, description="Horário específico (HH:MM)"),
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Obter salas disponíveis em uma data específica."""
    
    # Buscar salas disponíveis
    query = db.query(ClinicRoom).filter(ClinicRoom.is_available == True)
    
    # Se horário específico foi fornecido, verificar conflitos
    if time_slot:
        from ..models import Appointment
        
        # Subconsulta para salas ocupadas no horário
        occupied_rooms = db.query(Appointment.room_id).filter(
            Appointment.appointment_date == date,
            Appointment.appointment_time == time_slot,
            Appointment.status.in_(["scheduled", "confirmed"]),
            Appointment.room_id.isnot(None)
        ).subquery()
        
        # Filtrar salas não ocupadas
        query = query.filter(~ClinicRoom.id.in_(occupied_rooms))
    
    rooms = query.all()
    return rooms