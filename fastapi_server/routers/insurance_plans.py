from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from database import get_db
from models import InsurancePlan
from schemas import (
    InsurancePlan as InsurancePlanSchema,
    InsurancePlanCreate,
    InsurancePlanUpdate,
    User as UserSchema
)
from auth import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[InsurancePlanSchema])
async def get_insurance_plans(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    is_active: Optional[bool] = Query(None, description="Filtrar por status ativo"),
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Listar planos de saúde com filtros."""
    
    query = db.query(InsurancePlan)
    
    # Aplicar filtros
    if is_active is not None:
        query = query.filter(InsurancePlan.is_active == is_active)
    
    insurance_plans = query.offset(skip).limit(limit).all()
    return insurance_plans

@router.get("/{plan_id}", response_model=InsurancePlanSchema)
async def get_insurance_plan(
    plan_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Obter plano de saúde por ID."""
    
    insurance_plan = db.query(InsurancePlan).filter(InsurancePlan.id == plan_id).first()
    if not insurance_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Insurance plan not found"
        )
    
    return insurance_plan

@router.post("/", response_model=InsurancePlanSchema, status_code=status.HTTP_201_CREATED)
async def create_insurance_plan(
    plan_data: InsurancePlanCreate,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Criar novo plano de saúde."""
    
    # Verificar se já existe plano com o mesmo nome
    existing_plan = db.query(InsurancePlan).filter(
        InsurancePlan.name == plan_data.name
    ).first()
    
    if existing_plan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insurance plan with this name already exists"
        )
    
    # Criar plano de saúde
    try:
        db_plan = InsurancePlan(**plan_data.dict())
        db.add(db_plan)
        db.commit()
        db.refresh(db_plan)
        return db_plan
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating insurance plan"
        )

@router.put("/{plan_id}", response_model=InsurancePlanSchema)
async def update_insurance_plan(
    plan_id: uuid.UUID,
    plan_data: InsurancePlanUpdate,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Atualizar plano de saúde."""
    
    # Buscar plano de saúde
    insurance_plan = db.query(InsurancePlan).filter(InsurancePlan.id == plan_id).first()
    if not insurance_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Insurance plan not found"
        )
    
    # Verificar se nome já existe (se foi alterado)
    update_data = plan_data.dict(exclude_unset=True)
    if 'name' in update_data and update_data['name'] != insurance_plan.name:
        existing_plan = db.query(InsurancePlan).filter(
            InsurancePlan.name == update_data['name'],
            InsurancePlan.id != plan_id
        ).first()
        
        if existing_plan:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insurance plan with this name already exists"
            )
    
    # Atualizar campos
    try:
        for field, value in update_data.items():
            setattr(insurance_plan, field, value)
        
        db.commit()
        db.refresh(insurance_plan)
        return insurance_plan
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating insurance plan"
        )

@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_insurance_plan(
    plan_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Deletar plano de saúde."""
    
    # Buscar plano de saúde
    insurance_plan = db.query(InsurancePlan).filter(InsurancePlan.id == plan_id).first()
    if not insurance_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Insurance plan not found"
        )
    
    # Verificar se há pacientes usando este plano
    from ..models import Patient
    patients_using_plan = db.query(Patient).filter(
        Patient.insurance_plan_id == plan_id
    ).first()
    
    if patients_using_plan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete insurance plan that is being used by patients"
        )
    
    # Deletar plano de saúde
    try:
        db.delete(insurance_plan)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting insurance plan"
        )

@router.patch("/{plan_id}/status", response_model=InsurancePlanSchema)
async def toggle_insurance_plan_status(
    plan_id: uuid.UUID,
    is_active: bool = Query(..., description="Novo status do plano de saúde"),
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Alterar status ativo/inativo do plano de saúde."""
    
    # Buscar plano de saúde
    insurance_plan = db.query(InsurancePlan).filter(InsurancePlan.id == plan_id).first()
    if not insurance_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Insurance plan not found"
        )
    
    # Atualizar status
    try:
        insurance_plan.is_active = is_active
        db.commit()
        db.refresh(insurance_plan)
        return insurance_plan
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating insurance plan status"
        )

@router.get("/search/by-name", response_model=List[InsurancePlanSchema])
async def search_insurance_plans_by_name(
    name: str = Query(..., description="Nome ou parte do nome do plano de saúde"),
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Buscar planos de saúde por nome."""
    
    insurance_plans = db.query(InsurancePlan).filter(
        InsurancePlan.name.ilike(f"%{name}%"),
        InsurancePlan.is_active == True
    ).all()
    
    return insurance_plans

@router.get("/active/list", response_model=List[InsurancePlanSchema])
async def get_active_insurance_plans(
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(get_current_active_user)
):
    """Listar apenas planos de saúde ativos."""
    
    insurance_plans = db.query(InsurancePlan).filter(
        InsurancePlan.is_active == True
    ).order_by(InsurancePlan.name).all()
    
    return insurance_plans