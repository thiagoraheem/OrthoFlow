from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Doctor(Base):
    __tablename__ = "doctors"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    specialty = Column(String, nullable=False)
    license_number = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relacionamentos
    appointments = relationship("Appointment", back_populates="doctor")

class InsurancePlan(Base):
    __tablename__ = "insurance_plans"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    plan_name = Column(String, nullable=False)
    provider = Column(String, nullable=False)
    coverage_type = Column(String, nullable=False)
    copay_amount = Column(Float)
    deductible_amount = Column(Float)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relacionamentos
    patients = relationship("Patient", back_populates="insurance_plan")

class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    cpf = Column(String(11), unique=True, nullable=False)
    date_of_birth = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String)
    address = Column(Text, nullable=False)
    emergency_contact = Column(String, nullable=False)
    emergency_phone = Column(String, nullable=False)
    medical_history = Column(Text)
    allergies = Column(Text)
    insurance_plan_id = Column(String(36), ForeignKey("insurance_plans.id"))
    insurance_number = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relacionamentos
    insurance_plan = relationship("InsurancePlan", back_populates="patients")
    appointments = relationship("Appointment", back_populates="patient")

class ClinicRoom(Base):
    __tablename__ = "clinic_rooms"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    room_number = Column(String, unique=True, nullable=False)
    room_type = Column(String, nullable=False)
    capacity = Column(String, nullable=False)
    equipment = Column(Text)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relacionamentos
    appointments = relationship("Appointment", back_populates="room")

class AppointmentType(Base):
    __tablename__ = "appointment_types"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    type_name = Column(String, unique=True, nullable=False)
    duration = Column(String, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relacionamentos
    appointments = relationship("Appointment", back_populates="appointment_type")

class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(String(36), ForeignKey("doctors.id"), nullable=False)
    room_id = Column(String(36), ForeignKey("clinic_rooms.id"))
    appointment_type_id = Column(String(36), ForeignKey("appointment_types.id"), nullable=False)
    appointment_date = Column(String, nullable=False)
    appointment_time = Column(String, nullable=False)
    status = Column(String, default="scheduled", nullable=False)
    reason = Column(Text)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relacionamentos
    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
    room = relationship("ClinicRoom", back_populates="appointments")
    appointment_type = relationship("AppointmentType", back_populates="appointments")