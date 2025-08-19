import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, decimal } from "drizzle-orm/pg-core";
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
