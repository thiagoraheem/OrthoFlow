// Tipos baseados nos schemas do FastAPI

// Auth types
export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
  user: User;
}

// Doctor types
export interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  specialty: string;
  license_number: string;
  phone: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface DoctorCreate {
  first_name: string;
  last_name: string;
  specialty: string;
  license_number: string;
  phone: string;
  email: string;
  is_active?: boolean;
}

// Patient types
export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  cpf: string;
  date_of_birth: string;
  phone: string;
  email?: string;
  address: string;
  emergency_contact: string;
  emergency_phone: string;
  medical_history?: string;
  allergies?: string;
  insurance_plan_id?: string;
  insurance_number?: string;
  created_at: string;
  updated_at?: string;
}

export interface PatientCreate {
  first_name: string;
  last_name: string;
  cpf: string;
  date_of_birth: string;
  phone: string;
  email?: string;
  address: string;
  emergency_contact: string;
  emergency_phone: string;
  medical_history?: string;
  allergies?: string;
  insurance_plan_id?: string;
  insurance_number?: string;
}

export interface PatientWithInsurance extends Patient {
  insurance_plan?: InsurancePlan;
}

// Insurance Plan types
export interface InsurancePlan {
  id: string;
  plan_name: string;
  provider: string;
  coverage_type: string;
  copay_amount?: number;
  deductible_amount?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface InsurancePlanCreate {
  plan_name: string;
  provider: string;
  coverage_type: string;
  copay_amount?: number;
  deductible_amount?: number;
  is_active?: boolean;
}

// Clinic Room types
export interface ClinicRoom {
  id: string;
  room_number: string;
  room_type: string;
  capacity: string;
  equipment?: string;
  is_available: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ClinicRoomCreate {
  room_number: string;
  room_type: string;
  capacity: string;
  equipment?: string;
  is_available?: boolean;
}

// Appointment Type
export interface AppointmentType {
  id: string;
  type_name: string;
  duration_minutes: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

// Appointment types
export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  clinic_room_id: string;
  appointment_type_id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface AppointmentCreate {
  patient_id: string;
  doctor_id: string;
  clinic_room_id: string;
  appointment_type_id: string;
  appointment_date: string;
  appointment_time: string;
  status?: string;
  notes?: string;
}

export interface AppointmentWithDetails extends Appointment {
  patient?: Patient;
  doctor?: Doctor;
  clinic_room?: ClinicRoom;
  appointment_type?: AppointmentType;
}