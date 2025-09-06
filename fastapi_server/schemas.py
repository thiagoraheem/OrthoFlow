from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime
import uuid
import re

# Schemas de usuário
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    is_active: Optional[bool] = True
    is_superuser: Optional[bool] = False

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

# Schemas de médico
class DoctorBase(BaseModel):
    first_name: str
    last_name: str
    specialty: str
    license_number: str
    phone: str
    email: EmailStr
    is_active: Optional[bool] = True

class DoctorCreate(DoctorBase):
    pass

class DoctorUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    specialty: Optional[str] = None
    license_number: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None

class Doctor(DoctorBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Schemas de plano de saúde
class InsurancePlanBase(BaseModel):
    plan_name: str
    provider: str
    coverage_type: str
    copay_amount: Optional[float] = None
    deductible_amount: Optional[float] = None
    is_active: Optional[bool] = True

class InsurancePlanCreate(InsurancePlanBase):
    pass

class InsurancePlanUpdate(BaseModel):
    plan_name: Optional[str] = None
    provider: Optional[str] = None
    coverage_type: Optional[str] = None
    copay_amount: Optional[float] = None
    deductible_amount: Optional[float] = None
    is_active: Optional[bool] = None

class InsurancePlan(InsurancePlanBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Schemas de paciente
class PatientBase(BaseModel):
    first_name: str
    last_name: str
    cpf: str
    date_of_birth: str
    phone: str
    email: Optional[str] = None
    address: str
    emergency_contact: str
    emergency_phone: str
    medical_history: Optional[str] = None
    allergies: Optional[str] = None
    insurance_plan_id: Optional[uuid.UUID] = None
    insurance_number: Optional[str] = None
    
    @validator('cpf')
    def validate_cpf(cls, v):
        # Remove caracteres não numéricos
        cpf = re.sub(r'\D', '', v)
        
        # Verifica se tem 11 dígitos
        if len(cpf) != 11:
            raise ValueError('CPF deve ter 11 dígitos')
        
        # Verifica se não são todos os dígitos iguais
        if cpf == cpf[0] * 11:
            raise ValueError('CPF inválido')
        
        # Validação do CPF
        def calculate_digit(cpf_digits, weights):
            total = sum(int(digit) * weight for digit, weight in zip(cpf_digits, weights))
            remainder = total % 11
            return 0 if remainder < 2 else 11 - remainder
        
        # Primeiro dígito verificador
        first_digit = calculate_digit(cpf[:9], range(10, 1, -1))
        if int(cpf[9]) != first_digit:
            raise ValueError('CPF inválido')
        
        # Segundo dígito verificador
        second_digit = calculate_digit(cpf[:10], range(11, 1, -1))
        if int(cpf[10]) != second_digit:
            raise ValueError('CPF inválido')
        
        return cpf

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    cpf: Optional[str] = None
    date_of_birth: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    medical_history: Optional[str] = None
    allergies: Optional[str] = None
    insurance_plan_id: Optional[uuid.UUID] = None
    insurance_number: Optional[str] = None
    
    @validator('cpf')
    def validate_cpf(cls, v):
        if v is None:
            return v
        # Remove caracteres não numéricos
        cpf = re.sub(r'\D', '', v)
        
        # Verifica se tem 11 dígitos
        if len(cpf) != 11:
            raise ValueError('CPF deve ter 11 dígitos')
        
        # Verifica se não são todos os dígitos iguais
        if cpf == cpf[0] * 11:
            raise ValueError('CPF inválido')
        
        # Validação do CPF
        def calculate_digit(cpf_digits, weights):
            total = sum(int(digit) * weight for digit, weight in zip(cpf_digits, weights))
            remainder = total % 11
            return 0 if remainder < 2 else 11 - remainder
        
        # Primeiro dígito verificador
        first_digit = calculate_digit(cpf[:9], range(10, 1, -1))
        if int(cpf[9]) != first_digit:
            raise ValueError('CPF inválido')
        
        # Segundo dígito verificador
        second_digit = calculate_digit(cpf[:10], range(11, 1, -1))
        if int(cpf[10]) != second_digit:
            raise ValueError('CPF inválido')
        
        return cpf

class Patient(PatientBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    insurance_plan: Optional[InsurancePlan] = None
    
    class Config:
        from_attributes = True

# Schemas de sala
class ClinicRoomBase(BaseModel):
    room_number: str
    room_type: str
    capacity: str
    equipment: Optional[str] = None
    is_available: Optional[bool] = True

class ClinicRoomCreate(ClinicRoomBase):
    pass

class ClinicRoomUpdate(BaseModel):
    room_number: Optional[str] = None
    room_type: Optional[str] = None
    capacity: Optional[str] = None
    equipment: Optional[str] = None
    is_available: Optional[bool] = None

class ClinicRoom(ClinicRoomBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Schemas de tipo de consulta
class AppointmentTypeBase(BaseModel):
    type_name: str
    duration: str
    description: Optional[str] = None

class AppointmentTypeCreate(AppointmentTypeBase):
    pass

class AppointmentTypeUpdate(BaseModel):
    type_name: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None

class AppointmentType(AppointmentTypeBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Schemas de agendamento
class AppointmentBase(BaseModel):
    patient_id: uuid.UUID
    doctor_id: uuid.UUID
    room_id: Optional[uuid.UUID] = None
    appointment_type_id: uuid.UUID
    appointment_date: str
    appointment_time: str
    status: Optional[str] = "scheduled"
    reason: Optional[str] = None
    notes: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    patient_id: Optional[uuid.UUID] = None
    doctor_id: Optional[uuid.UUID] = None
    room_id: Optional[uuid.UUID] = None
    appointment_type_id: Optional[uuid.UUID] = None
    appointment_date: Optional[str] = None
    appointment_time: Optional[str] = None
    status: Optional[str] = None
    reason: Optional[str] = None
    notes: Optional[str] = None

class Appointment(AppointmentBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    patient: Patient
    doctor: Doctor
    room: Optional[ClinicRoom] = None
    appointment_type: AppointmentType
    
    class Config:
        from_attributes = True