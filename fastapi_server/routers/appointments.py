from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from datetime import datetime, date

from database import get_db
from models import Appointment, Patient, Doctor, ClinicRoom, AppointmentType
from schemas import (
    Appointment as AppointmentSchema,
    AppointmentCreate,
    AppointmentUpdate,
    User as UserSchema
)
from auth import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[AppointmentSchema])
async def get_appointments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    date_filter: Optional[str] = Query(None, description="Filtrar por data (YYYY-MM-DD)"),
    doctor_id: Optional[uuid.UUID] = Query(None, description="Filtrar por médico"),
    patient_id: Optional[uuid.UUID] = Query(None, description="Filtrar por paciente"),
    status: Optional[str] = Query(None, description="Filtrar por status"),
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Listar agendamentos com filtros."""
    
    query = db.query(Appointment)
    
    # Aplicar filtros
    if date_filter:
        query = query.filter(Appointment.appointment_date == date_filter)
    
    if doctor_id:
        query = query.filter(Appointment.doctor_id == doctor_id)
    
    if patient_id:
        query = query.filter(Appointment.patient_id == patient_id)
    
    if status:
        query = query.filter(Appointment.status == status)
    
    appointments = query.offset(skip).limit(limit).all()
    return appointments

@router.get("/{appointment_id}", response_model=AppointmentSchema)
async def get_appointment(
    appointment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Obter agendamento por ID."""
    
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    return appointment

@router.post("/", response_model=AppointmentSchema, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    appointment_data: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Criar novo agendamento."""
    
    # Verificar se paciente existe
    patient = db.query(Patient).filter(Patient.id == appointment_data.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Patient not found"
        )
    
    # Verificar se médico existe e está ativo
    doctor = db.query(Doctor).filter(
        Doctor.id == appointment_data.doctor_id,
        Doctor.is_active == True
    ).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Doctor not found or inactive"
        )
    
    # Verificar se sala existe e está disponível (se fornecida)
    if appointment_data.room_id:
        room = db.query(ClinicRoom).filter(
            ClinicRoom.id == appointment_data.room_id,
            ClinicRoom.is_available == True
        ).first()
        if not room:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Room not found or unavailable"
            )
    
    # Verificar se tipo de consulta existe
    appointment_type = db.query(AppointmentType).filter(
        AppointmentType.id == appointment_data.appointment_type_id
    ).first()
    if not appointment_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Appointment type not found"
        )
    
    # Verificar conflito de horário para o médico
    existing_appointment = db.query(Appointment).filter(
        Appointment.doctor_id == appointment_data.doctor_id,
        Appointment.appointment_date == appointment_data.appointment_date,
        Appointment.appointment_time == appointment_data.appointment_time,
        Appointment.status.in_(["scheduled", "confirmed"])
    ).first()
    
    if existing_appointment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Doctor already has an appointment at this time"
        )
    
    # Verificar conflito de horário para a sala (se fornecida)
    if appointment_data.room_id:
        existing_room_appointment = db.query(Appointment).filter(
            Appointment.room_id == appointment_data.room_id,
            Appointment.appointment_date == appointment_data.appointment_date,
            Appointment.appointment_time == appointment_data.appointment_time,
            Appointment.status.in_(["scheduled", "confirmed"])
        ).first()
        
        if existing_room_appointment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Room is already booked at this time"
            )
    
    # Criar agendamento
    try:
        db_appointment = Appointment(**appointment_data.dict())
        db.add(db_appointment)
        db.commit()
        db.refresh(db_appointment)
        return db_appointment
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating appointment"
        )

@router.put("/{appointment_id}", response_model=AppointmentSchema)
async def update_appointment(
    appointment_id: uuid.UUID,
    appointment_data: AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Atualizar agendamento."""
    
    # Buscar agendamento
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # Verificações similares ao create, mas apenas para campos alterados
    update_data = appointment_data.dict(exclude_unset=True)
    
    # Verificar conflitos de horário se data/hora/médico foram alterados
    if any(field in update_data for field in ['doctor_id', 'appointment_date', 'appointment_time']):
        doctor_id = update_data.get('doctor_id', appointment.doctor_id)
        appointment_date = update_data.get('appointment_date', appointment.appointment_date)
        appointment_time = update_data.get('appointment_time', appointment.appointment_time)
        
        existing_appointment = db.query(Appointment).filter(
            Appointment.doctor_id == doctor_id,
            Appointment.appointment_date == appointment_date,
            Appointment.appointment_time == appointment_time,
            Appointment.status.in_(["scheduled", "confirmed"]),
            Appointment.id != appointment_id
        ).first()
        
        if existing_appointment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Doctor already has an appointment at this time"
            )
    
    # Atualizar campos
    try:
        for field, value in update_data.items():
            setattr(appointment, field, value)
        
        db.commit()
        db.refresh(appointment)
        return appointment
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating appointment"
        )

@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_appointment(
    appointment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Cancelar agendamento."""
    
    # Buscar agendamento
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # Marcar como cancelado em vez de deletar
    try:
        appointment.status = "cancelled"
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error cancelling appointment"
        )

@router.get("/doctor/{doctor_id}/date/{date}", response_model=List[AppointmentSchema])
async def get_doctor_appointments_by_date(
    doctor_id: uuid.UUID,
    date: str,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Obter agendamentos de um médico em uma data específica."""
    
    appointments = db.query(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.appointment_date == date,
        Appointment.status.in_(["scheduled", "confirmed"])
    ).order_by(Appointment.appointment_time).all()
    
    return appointments

@router.patch("/{appointment_id}/status", response_model=AppointmentSchema)
async def update_appointment_status(
    appointment_id: uuid.UUID,
    new_status: str = Query(..., description="Novo status do agendamento"),
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Atualizar apenas o status do agendamento."""
    
    # Validar status
    valid_statuses = ["scheduled", "confirmed", "completed", "cancelled", "no_show"]
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    # Buscar agendamento
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # Atualizar status
    try:
        appointment.status = new_status
        db.commit()
        db.refresh(appointment)
        return appointment
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating appointment status"
        )