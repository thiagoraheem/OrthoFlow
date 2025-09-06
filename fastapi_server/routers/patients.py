from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from database import get_db
from models import Patient, InsurancePlan
from schemas import (
    Patient as PatientSchema,
    PatientCreate,
    PatientUpdate,
    User as UserSchema
)
from auth import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[PatientSchema])
async def get_patients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None, description="Buscar por nome ou CPF"),
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Listar pacientes com paginação e busca."""
    
    query = db.query(Patient)
    
    # Aplicar filtro de busca se fornecido
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Patient.first_name.ilike(search_term)) |
            (Patient.last_name.ilike(search_term)) |
            (Patient.cpf.ilike(search_term))
        )
    
    patients = query.offset(skip).limit(limit).all()
    return patients

@router.get("/{patient_id}", response_model=PatientSchema)
async def get_patient(
    patient_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Obter paciente por ID."""
    
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    return patient

@router.post("/", response_model=PatientSchema, status_code=status.HTTP_201_CREATED)
async def create_patient(
    patient_data: PatientCreate,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Criar novo paciente."""
    
    # Verificar se CPF já existe
    existing_patient = db.query(Patient).filter(Patient.cpf == patient_data.cpf).first()
    if existing_patient:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Patient with this CPF already exists"
        )
    
    # Verificar se plano de saúde existe (se fornecido)
    if patient_data.insurance_plan_id:
        insurance_plan = db.query(InsurancePlan).filter(
            InsurancePlan.id == patient_data.insurance_plan_id
        ).first()
        if not insurance_plan:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insurance plan not found"
            )
    
    # Criar paciente
    try:
        db_patient = Patient(**patient_data.dict())
        db.add(db_patient)
        db.commit()
        db.refresh(db_patient)
        return db_patient
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating patient"
        )

@router.put("/{patient_id}", response_model=PatientSchema)
async def update_patient(
    patient_id: uuid.UUID,
    patient_data: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Atualizar paciente."""
    
    print(f"[DEBUG] Updating patient {patient_id} with data: {patient_data.dict(exclude_unset=True)}")
    
    # Buscar paciente
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        print(f"[ERROR] Patient {patient_id} not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    print(f"[DEBUG] Found patient: {patient.first_name} {patient.last_name}")
    
    # Verificar se CPF já existe em outro paciente (se CPF foi alterado)
    if patient_data.cpf and patient_data.cpf != patient.cpf:
        existing_patient = db.query(Patient).filter(
            Patient.cpf == patient_data.cpf,
            Patient.id != patient_id
        ).first()
        if existing_patient:
            print(f"[ERROR] CPF {patient_data.cpf} already exists for another patient")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Patient with this CPF already exists"
            )
    
    # Verificar se plano de saúde existe (se fornecido)
    if patient_data.insurance_plan_id:
        print(f"[DEBUG] Checking insurance plan: {patient_data.insurance_plan_id}")
        insurance_plan = db.query(InsurancePlan).filter(
            InsurancePlan.id == patient_data.insurance_plan_id
        ).first()
        if not insurance_plan:
            print(f"[ERROR] Insurance plan {patient_data.insurance_plan_id} not found")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insurance plan not found"
            )
    
    # Atualizar campos
    try:
        update_data = patient_data.dict(exclude_unset=True)
        print(f"[DEBUG] Update data: {update_data}")
        
        for field, value in update_data.items():
            print(f"[DEBUG] Setting {field} = {value}")
            setattr(patient, field, value)
        
        print(f"[DEBUG] Committing changes to database")
        db.commit()
        db.refresh(patient)
        print(f"[DEBUG] Patient updated successfully")
        return patient
    except Exception as e:
        print(f"[ERROR] Exception during patient update: {str(e)}")
        print(f"[ERROR] Exception type: {type(e).__name__}")
        import traceback
        print(f"[ERROR] Traceback: {traceback.format_exc()}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating patient: {str(e)}"
        )

@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_patient(
    patient_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Deletar paciente."""
    
    # Buscar paciente
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Deletar paciente
    try:
        db.delete(patient)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting patient"
        )

@router.get("/search/cpf/{cpf}", response_model=PatientSchema)
async def search_patient_by_cpf(
    cpf: str,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Buscar paciente por CPF."""
    
    # Remove caracteres não numéricos do CPF
    import re
    clean_cpf = re.sub(r'\D', '', cpf)
    
    patient = db.query(Patient).filter(Patient.cpf == clean_cpf).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    return patient