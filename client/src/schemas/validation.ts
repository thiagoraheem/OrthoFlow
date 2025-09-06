import { z } from "zod";

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

// Doctor schemas
export const insertDoctorSchema = z.object({
  first_name: z.string().min(1, "Nome é obrigatório"),
  last_name: z.string().min(1, "Sobrenome é obrigatório"),
  specialty: z.string().min(1, "Especialidade é obrigatória"),
  license_number: z.string().min(1, "Número da licença é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  email: z.string().email("Email inválido"),
  is_active: z.boolean().optional().default(true),
});

export type DoctorFormData = z.infer<typeof insertDoctorSchema>;

// Patient schemas
export const insertPatientSchema = z.object({
  first_name: z.string().min(1, "Nome é obrigatório"),
  last_name: z.string().min(1, "Sobrenome é obrigatório"),
  cpf: z.string().min(11, "CPF deve ter 11 dígitos").max(14, "CPF inválido"),
  date_of_birth: z.string().min(1, "Data de nascimento é obrigatória"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  address: z.string().min(1, "Endereço é obrigatório"),
  emergency_contact: z.string().min(1, "Contato de emergência é obrigatório"),
  emergency_phone: z.string().min(1, "Telefone de emergência é obrigatório"),
  medical_history: z.string().optional(),
  allergies: z.string().optional(),
  insurance_plan_id: z.string().optional(),
  insurance_number: z.string().optional(),
});

export type PatientFormData = z.infer<typeof insertPatientSchema>;

// Insurance Plan schemas
export const insertInsurancePlanSchema = z.object({
  plan_name: z.string().min(1, "Nome do plano é obrigatório"),
  provider: z.string().min(1, "Provedor é obrigatório"),
  coverage_type: z.string().min(1, "Tipo de cobertura é obrigatório"),
  copay_amount: z.number().optional(),
  deductible_amount: z.number().optional(),
  is_active: z.boolean().optional().default(true),
});

export type InsurancePlanFormData = z.infer<typeof insertInsurancePlanSchema>;

// Clinic Room schemas
export const insertClinicRoomSchema = z.object({
  room_number: z.string().min(1, "Número da sala é obrigatório"),
  room_type: z.string().min(1, "Tipo da sala é obrigatório"),
  capacity: z.string().min(1, "Capacidade é obrigatória"),
  equipment: z.string().optional(),
  is_available: z.boolean().optional().default(true),
});

export type ClinicRoomFormData = z.infer<typeof insertClinicRoomSchema>;

// Appointment schemas
export const insertAppointmentSchema = z.object({
  patient_id: z.string().min(1, "Paciente é obrigatório"),
  doctor_id: z.string().min(1, "Médico é obrigatório"),
  clinic_room_id: z.string().min(1, "Sala é obrigatória"),
  appointment_type_id: z.string().min(1, "Tipo de consulta é obrigatório"),
  appointment_date: z.string().min(1, "Data é obrigatória"),
  appointment_time: z.string().min(1, "Horário é obrigatório"),
  status: z.string().optional().default("Agendado"),
  notes: z.string().optional(),
});

export type AppointmentFormData = z.infer<typeof insertAppointmentSchema>;