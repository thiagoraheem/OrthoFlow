import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const doctors = sqliteTable("doctors", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  specialty: text("specialty").notNull(),
  licenseNumber: text("license_number").notNull().unique(),
  phone: text("phone").notNull(),
  email: text("email").notNull().unique(),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
});

export const patients = sqliteTable("patients", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  cpf: text("cpf").notNull().unique(),
  dateOfBirth: text("date_of_birth").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address").notNull(),
  emergencyContact: text("emergency_contact").notNull(),
  emergencyPhone: text("emergency_phone").notNull(),
  medicalHistory: text("medical_history"),
  allergies: text("allergies"),
  insurancePlanId: text("insurance_plan_id").references(() => insurancePlans.id),
  insuranceNumber: text("insurance_number"),
});

export const clinicRooms = sqliteTable("clinic_rooms", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  roomNumber: text("room_number").notNull().unique(),
  roomType: text("room_type").notNull(),
  capacity: text("capacity").notNull(),
  equipment: text("equipment"),
  isAvailable: integer("is_available", { mode: "boolean" }).default(true).notNull(),
});

export const insurancePlans = sqliteTable("insurance_plans", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  planName: text("plan_name").notNull(),
  provider: text("provider").notNull(),
  coverageType: text("coverage_type").notNull(),
  copayAmount: real("copay_amount"),
  deductibleAmount: real("deductible_amount"),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
});

export const appointmentTypes = sqliteTable("appointment_types", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  typeName: text("type_name").notNull().unique(),
  duration: text("duration").notNull(),
  description: text("description"),
});

export const appointments = sqliteTable("appointments", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  patientId: text("patient_id").notNull().references(() => patients.id),
  doctorId: text("doctor_id").notNull().references(() => doctors.id),
  roomId: text("room_id").references(() => clinicRooms.id),
  appointmentTypeId: text("appointment_type_id").notNull().references(() => appointmentTypes.id),
  appointmentDate: text("appointment_date").notNull(),
  appointmentTime: text("appointment_time").notNull(),
  status: text("status").notNull().default("scheduled"),
  reason: text("reason"),
  notes: text("notes"),
});

// TUSS - Terminologia Unificada da Saúde Suplementar
export const tussCodes = sqliteTable("tuss_codes", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  code: text("code").notNull().unique(), // Código TUSS
  description: text("description").notNull(), // Descrição do procedimento
  tableNumber: text("table_number").notNull(), // Número da tabela (22, 23, 24, etc.)
  tableName: text("table_name").notNull(), // Nome da tabela
  category: text("category"), // Categoria do procedimento
  subcategory: text("subcategory"), // Subcategoria
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
  createdAt: text("created_at").default(sql`(datetime('now'))`).notNull(),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`).notNull(),
});

// CID - Classificação Internacional de Doenças
export const cidCodes = sqliteTable("cid_codes", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  code: text("code").notNull().unique(), // Código CID (ex: A00, B15.0)
  description: text("description").notNull(), // Descrição da doença
  chapter: text("chapter"), // Capítulo do CID
  category: text("category"), // Categoria
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
  createdAt: text("created_at").default(sql`(datetime('now'))`).notNull(),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`).notNull(),
});

// Solicitações de Exames
export const examRequests = sqliteTable("exam_requests", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  appointmentId: text("appointment_id").notNull().references(() => appointments.id),
  patientId: text("patient_id").notNull().references(() => patients.id),
  doctorId: text("doctor_id").notNull().references(() => doctors.id),
  tussCodeId: text("tuss_code_id").notNull().references(() => tussCodes.id),
  cidCodeId: text("cid_code_id").references(() => cidCodes.id), // CID relacionado (opcional)
  clinicalIndication: text("clinical_indication").notNull(), // Indicação clínica
  urgency: text("urgency").notNull().default("routine"), // routine, urgent, emergency
  status: text("status").notNull().default("pending"), // pending, approved, rejected, completed
  observations: text("observations"), // Observações adicionais
  requestedAt: text("requested_at").default(sql`(datetime('now'))`).notNull(),
  approvedAt: text("approved_at"),
  completedAt: text("completed_at"),
  createdAt: text("created_at").default(sql`(datetime('now'))`).notNull(),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`).notNull(),
});

// Tabela para controle de importação de dados
export const dataImports = sqliteTable("data_imports", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  type: text("type").notNull(), // 'tuss', 'cid'
  version: text("version"), // Versão dos dados importados
  recordsCount: integer("records_count").notNull(),
  status: text("status").notNull().default("processing"), // processing, completed, failed
  filePath: text("file_path"), // Caminho do arquivo importado
  errorMessage: text("error_message"), // Mensagem de erro se houver
  importedAt: text("imported_at").default(sql`(datetime('now'))`).notNull(),
  importedBy: text("imported_by").notNull(), // Usuário que fez a importação
});

// Insert schemas
export const insertDoctorSchema = createInsertSchema(doctors).omit({
  id: true,
});

// Schema base do paciente
const basePatientSchema = createInsertSchema(patients).omit({
  id: true,
});

// Função para validar CPF
const validateCPF = (cpf: string): boolean => {
  if (!cpf) return false;
  
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
};

// Função para validar telefone brasileiro
const validatePhone = (phone: string): boolean => {
  if (!phone) return false;
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
};

// Função para validar data de nascimento
const validateBirthDate = (date: string): boolean => {
  if (!date) return false;
  const birthDate = new Date(date);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  return birthDate <= today && age <= 120;
};

// Schema aprimorado com validações customizadas
export const insertPatientSchema = z.object({
  firstName: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres")
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços"),
  
  lastName: z.string()
    .min(2, "Sobrenome deve ter pelo menos 2 caracteres")
    .max(50, "Sobrenome deve ter no máximo 50 caracteres")
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Sobrenome deve conter apenas letras e espaços"),
  
  cpf: z.string()
    .min(1, "CPF é obrigatório")
    .refine(validateCPF, "CPF inválido. Verifique o formato e os dígitos"),
  
  dateOfBirth: z.string()
    .min(1, "Data de nascimento é obrigatória")
    .refine(validateBirthDate, "Data de nascimento inválida"),
  
  phone: z.string()
    .min(1, "Telefone é obrigatório")
    .refine(validatePhone, "Telefone deve ter entre 10 e 11 dígitos"),
  
  email: z.string()
    .email("Email inválido")
    .optional()
    .or(z.literal("")),
  
  address: z.string()
    .min(10, "Endereço deve ter pelo menos 10 caracteres")
    .max(200, "Endereço deve ter no máximo 200 caracteres"),
  
  emergencyContact: z.string()
    .min(2, "Nome do contato de emergência é obrigatório")
    .max(100, "Nome do contato deve ter no máximo 100 caracteres")
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços"),
  
  emergencyPhone: z.string()
    .min(1, "Telefone de emergência é obrigatório")
    .refine(validatePhone, "Telefone de emergência deve ter entre 10 e 11 dígitos"),
  
  medicalHistory: z.string()
    .max(1000, "Histórico médico deve ter no máximo 1000 caracteres")
    .optional()
    .or(z.literal("")),
  
  allergies: z.string()
    .max(500, "Alergias deve ter no máximo 500 caracteres")
    .optional()
    .or(z.literal("")),
  
  insurancePlanId: z.string().optional().or(z.literal("")),
  
  insuranceNumber: z.string()
    .max(50, "Número do convênio deve ter no máximo 50 caracteres")
    .optional()
    .or(z.literal(""))
});

export const insertClinicRoomSchema = createInsertSchema(clinicRooms).omit({
  id: true,
});

export const insertInsurancePlanSchema = createInsertSchema(insurancePlans).omit({
  id: true,
});

export const insertAppointmentTypeSchema = createInsertSchema(appointmentTypes).omit({
  id: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
});

export const insertTussCodeSchema = createInsertSchema(tussCodes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCidCodeSchema = createInsertSchema(cidCodes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExamRequestSchema = createInsertSchema(examRequests).omit({
  id: true,
  requestedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDataImportSchema = createInsertSchema(dataImports).omit({
  id: true,
  importedAt: true,
});

// Types
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type Doctor = typeof doctors.$inferSelect;

export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patients.$inferSelect;

export type InsertClinicRoom = z.infer<typeof insertClinicRoomSchema>;
export type ClinicRoom = typeof clinicRooms.$inferSelect;

export type InsertInsurancePlan = z.infer<typeof insertInsurancePlanSchema>;
export type InsurancePlan = typeof insurancePlans.$inferSelect;

export type InsertAppointmentType = z.infer<typeof insertAppointmentTypeSchema>;
export type AppointmentType = typeof appointmentTypes.$inferSelect;

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

export type InsertTussCode = z.infer<typeof insertTussCodeSchema>;
export type TussCode = typeof tussCodes.$inferSelect;

export type InsertCidCode = z.infer<typeof insertCidCodeSchema>;
export type CidCode = typeof cidCodes.$inferSelect;

export type InsertExamRequest = z.infer<typeof insertExamRequestSchema>;
export type ExamRequest = typeof examRequests.$inferSelect;

export type InsertDataImport = z.infer<typeof insertDataImportSchema>;
export type DataImport = typeof dataImports.$inferSelect;

// Extended types for API responses
export type AppointmentWithDetails = Appointment & {
  patient: Patient;
  doctor: Doctor;
  room?: ClinicRoom;
  appointmentType: AppointmentType;
};

export type PatientWithInsurance = Patient & {
  insurancePlan?: InsurancePlan;
};

export type ExamRequestWithDetails = ExamRequest & {
  patient: Patient;
  doctor: Doctor;
  appointment: Appointment;
  tussCode: TussCode;
  cidCode?: CidCode;
};
