import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, decimal, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const doctors = pgTable("doctors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  specialty: text("specialty").notNull(),
  licenseNumber: text("license_number").notNull().unique(),
  phone: text("phone").notNull(),
  email: text("email").notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address").notNull(),
  emergencyContact: text("emergency_contact").notNull(),
  emergencyPhone: text("emergency_phone").notNull(),
  medicalHistory: text("medical_history"),
  insurancePlanId: varchar("insurance_plan_id").references(() => insurancePlans.id),
  insuranceNumber: text("insurance_number"),
});

export const clinicRooms = pgTable("clinic_rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomNumber: text("room_number").notNull().unique(),
  roomType: text("room_type").notNull(),
  capacity: text("capacity").notNull(),
  equipment: text("equipment"),
  isAvailable: boolean("is_available").default(true).notNull(),
});

export const insurancePlans = pgTable("insurance_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planName: text("plan_name").notNull(),
  provider: text("provider").notNull(),
  coverageType: text("coverage_type").notNull(),
  copayAmount: decimal("copay_amount", { precision: 8, scale: 2 }),
  deductibleAmount: decimal("deductible_amount", { precision: 8, scale: 2 }),
  isActive: boolean("is_active").default(true).notNull(),
});

export const appointmentTypes = pgTable("appointment_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  typeName: text("type_name").notNull().unique(),
  duration: text("duration").notNull(),
  description: text("description"),
});

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  doctorId: varchar("doctor_id").notNull().references(() => doctors.id),
  roomId: varchar("room_id").references(() => clinicRooms.id),
  appointmentTypeId: varchar("appointment_type_id").notNull().references(() => appointmentTypes.id),
  appointmentDate: text("appointment_date").notNull(),
  appointmentTime: text("appointment_time").notNull(),
  status: text("status").notNull().default("scheduled"),
  reason: text("reason"),
  notes: text("notes"),
});

// TUSS - Terminologia Unificada da Saúde Suplementar
export const tussCodes = pgTable("tuss_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(), // Código TUSS
  description: text("description").notNull(), // Descrição do procedimento
  tableNumber: text("table_number").notNull(), // Número da tabela (22, 23, 24, etc.)
  tableName: text("table_name").notNull(), // Nome da tabela
  category: text("category"), // Categoria do procedimento
  subcategory: text("subcategory"), // Subcategoria
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// CID - Classificação Internacional de Doenças
export const cidCodes = pgTable("cid_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(), // Código CID (ex: A00, B15.0)
  description: text("description").notNull(), // Descrição da doença
  chapter: text("chapter"), // Capítulo do CID
  category: text("category"), // Categoria
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Solicitações de Exames
export const examRequests = pgTable("exam_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appointmentId: varchar("appointment_id").notNull().references(() => appointments.id),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  doctorId: varchar("doctor_id").notNull().references(() => doctors.id),
  tussCodeId: varchar("tuss_code_id").notNull().references(() => tussCodes.id),
  cidCodeId: varchar("cid_code_id").references(() => cidCodes.id), // CID relacionado (opcional)
  clinicalIndication: text("clinical_indication").notNull(), // Indicação clínica
  urgency: text("urgency").notNull().default("routine"), // routine, urgent, emergency
  status: text("status").notNull().default("pending"), // pending, approved, rejected, completed
  observations: text("observations"), // Observações adicionais
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  approvedAt: timestamp("approved_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabela para controle de importação de dados
export const dataImports = pgTable("data_imports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'tuss', 'cid'
  version: text("version"), // Versão dos dados importados
  recordsCount: integer("records_count").notNull(),
  status: text("status").notNull().default("processing"), // processing, completed, failed
  filePath: text("file_path"), // Caminho do arquivo importado
  errorMessage: text("error_message"), // Mensagem de erro se houver
  importedAt: timestamp("imported_at").defaultNow().notNull(),
  importedBy: text("imported_by").notNull(), // Usuário que fez a importação
});

// Insert schemas
export const insertDoctorSchema = createInsertSchema(doctors).omit({
  id: true,
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
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
