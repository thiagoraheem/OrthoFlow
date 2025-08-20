import { 
  type Doctor, 
  type InsertDoctor,
  type Patient,
  type InsertPatient,
  type ClinicRoom,
  type InsertClinicRoom,
  type InsurancePlan,
  type InsertInsurancePlan,
  type AppointmentType,
  type InsertAppointmentType,
  type Appointment,
  type InsertAppointment,
  type AppointmentWithDetails,
  type PatientWithInsurance,
  type TussCode,
  type InsertTussCode,
  type ExamRequest,
  type InsertExamRequest,
  type ExamRequestWithDetails,
  doctors,
  patients,
  clinicRooms,
  insurancePlans,
  appointmentTypes,
  appointments,
  tussCodes,
  examRequests
} from "@shared/schema";
import { db } from './db';
import { eq } from 'drizzle-orm';

export interface IStorage {
  // Doctors
  getDoctors(): Promise<Doctor[]>;
  getDoctor(id: string): Promise<Doctor | undefined>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  updateDoctor(id: string, doctor: Partial<InsertDoctor>): Promise<Doctor | undefined>;
  deleteDoctor(id: string): Promise<boolean>;

  // Patients
  getPatients(): Promise<PatientWithInsurance[]>;
  getPatient(id: string): Promise<PatientWithInsurance | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: string, patient: Partial<InsertPatient>): Promise<Patient | undefined>;
  deletePatient(id: string): Promise<boolean>;

  // Clinic Rooms
  getClinicRooms(): Promise<ClinicRoom[]>;
  getClinicRoom(id: string): Promise<ClinicRoom | undefined>;
  createClinicRoom(room: InsertClinicRoom): Promise<ClinicRoom>;
  updateClinicRoom(id: string, room: Partial<InsertClinicRoom>): Promise<ClinicRoom | undefined>;
  deleteClinicRoom(id: string): Promise<boolean>;

  // Insurance Plans
  getInsurancePlans(): Promise<InsurancePlan[]>;
  getInsurancePlan(id: string): Promise<InsurancePlan | undefined>;
  createInsurancePlan(plan: InsertInsurancePlan): Promise<InsurancePlan>;
  updateInsurancePlan(id: string, plan: Partial<InsertInsurancePlan>): Promise<InsurancePlan | undefined>;
  deleteInsurancePlan(id: string): Promise<boolean>;

  // Appointment Types
  getAppointmentTypes(): Promise<AppointmentType[]>;
  getAppointmentType(id: string): Promise<AppointmentType | undefined>;
  createAppointmentType(type: InsertAppointmentType): Promise<AppointmentType>;
  updateAppointmentType(id: string, type: Partial<InsertAppointmentType>): Promise<AppointmentType | undefined>;
  deleteAppointmentType(id: string): Promise<boolean>;

  // Appointments
  getAppointments(): Promise<AppointmentWithDetails[]>;
  getAppointment(id: string): Promise<AppointmentWithDetails | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: string): Promise<boolean>;
  getAppointmentsByDate(date: string): Promise<AppointmentWithDetails[]>;

  // TUSS Codes
  getTussCodes(search?: string, tableNumber?: string): Promise<TussCode[]>;
  getTussCode(id: string): Promise<TussCode | undefined>;
  searchTussCodes(query: string): Promise<TussCode[]>;

  // Exam Requests
  getExamRequests(): Promise<ExamRequestWithDetails[]>;
  getExamRequest(id: string): Promise<ExamRequestWithDetails | undefined>;
  createExamRequest(request: InsertExamRequest): Promise<ExamRequest>;
  updateExamRequest(id: string, request: Partial<InsertExamRequest>): Promise<ExamRequest | undefined>;
  deleteExamRequest(id: string): Promise<boolean>;
  getExamRequestsByPatient(patientId: string): Promise<ExamRequestWithDetails[]>;
}

export class DatabaseStorage implements IStorage {
  async getDoctors(): Promise<Doctor[]> {
    return await db.select().from(doctors);
  }

  async getDoctor(id: string): Promise<Doctor | undefined> {
    const [doctor] = await db.select().from(doctors).where(eq(doctors.id, id));
    return doctor || undefined;
  }

  async createDoctor(doctor: InsertDoctor): Promise<Doctor> {
    const [created] = await db.insert(doctors).values(doctor).returning();
    return created;
  }

  async updateDoctor(id: string, doctor: Partial<InsertDoctor>): Promise<Doctor | undefined> {
    const [updated] = await db.update(doctors).set(doctor).where(eq(doctors.id, id)).returning();
    return updated || undefined;
  }

  async deleteDoctor(id: string): Promise<boolean> {
    const result = await db.delete(doctors).where(eq(doctors.id, id));
    return result.rowCount > 0;
  }

  async getPatients(): Promise<PatientWithInsurance[]> {
    const result = await db
      .select()
      .from(patients)
      .leftJoin(insurancePlans, eq(patients.insurancePlanId, insurancePlans.id));

    return result.map(row => ({
      ...row.patients,
      insurancePlan: row.insurance_plans || undefined,
    }));
  }

  async getPatient(id: string): Promise<PatientWithInsurance | undefined> {
    const result = await db
      .select()
      .from(patients)
      .leftJoin(insurancePlans, eq(patients.insurancePlanId, insurancePlans.id))
      .where(eq(patients.id, id));

    const [row] = result;
    if (!row) return undefined;

    return {
      ...row.patients,
      insurancePlan: row.insurance_plans || undefined,
    };
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const [created] = await db.insert(patients).values(patient).returning();
    return created;
  }

  async updatePatient(id: string, patient: Partial<InsertPatient>): Promise<Patient | undefined> {
    const [updated] = await db.update(patients).set(patient).where(eq(patients.id, id)).returning();
    return updated || undefined;
  }

  async deletePatient(id: string): Promise<boolean> {
    const result = await db.delete(patients).where(eq(patients.id, id));
    return result.rowCount > 0;
  }

  async getClinicRooms(): Promise<ClinicRoom[]> {
    return await db.select().from(clinicRooms);
  }

  async getClinicRoom(id: string): Promise<ClinicRoom | undefined> {
    const [room] = await db.select().from(clinicRooms).where(eq(clinicRooms.id, id));
    return room || undefined;
  }

  async createClinicRoom(room: InsertClinicRoom): Promise<ClinicRoom> {
    const [created] = await db.insert(clinicRooms).values(room).returning();
    return created;
  }

  async updateClinicRoom(id: string, room: Partial<InsertClinicRoom>): Promise<ClinicRoom | undefined> {
    const [updated] = await db.update(clinicRooms).set(room).where(eq(clinicRooms.id, id)).returning();
    return updated || undefined;
  }

  async deleteClinicRoom(id: string): Promise<boolean> {
    const result = await db.delete(clinicRooms).where(eq(clinicRooms.id, id));
    return result.rowCount > 0;
  }

  async getInsurancePlans(): Promise<InsurancePlan[]> {
    return await db.select().from(insurancePlans);
  }

  async getInsurancePlan(id: string): Promise<InsurancePlan | undefined> {
    const [plan] = await db.select().from(insurancePlans).where(eq(insurancePlans.id, id));
    return plan || undefined;
  }

  async createInsurancePlan(plan: InsertInsurancePlan): Promise<InsurancePlan> {
    const [created] = await db.insert(insurancePlans).values(plan).returning();
    return created;
  }

  async updateInsurancePlan(id: string, plan: Partial<InsertInsurancePlan>): Promise<InsurancePlan | undefined> {
    const [updated] = await db.update(insurancePlans).set(plan).where(eq(insurancePlans.id, id)).returning();
    return updated || undefined;
  }

  async deleteInsurancePlan(id: string): Promise<boolean> {
    const result = await db.delete(insurancePlans).where(eq(insurancePlans.id, id));
    return result.rowCount > 0;
  }

  async getAppointmentTypes(): Promise<AppointmentType[]> {
    return await db.select().from(appointmentTypes);
  }

  async getAppointmentType(id: string): Promise<AppointmentType | undefined> {
    const [type] = await db.select().from(appointmentTypes).where(eq(appointmentTypes.id, id));
    return type || undefined;
  }

  async createAppointmentType(type: InsertAppointmentType): Promise<AppointmentType> {
    const [created] = await db.insert(appointmentTypes).values(type).returning();
    return created;
  }

  async updateAppointmentType(id: string, type: Partial<InsertAppointmentType>): Promise<AppointmentType | undefined> {
    const [updated] = await db.update(appointmentTypes).set(type).where(eq(appointmentTypes.id, id)).returning();
    return updated || undefined;
  }

  async deleteAppointmentType(id: string): Promise<boolean> {
    const result = await db.delete(appointmentTypes).where(eq(appointmentTypes.id, id));
    return result.rowCount > 0;
  }

  async getAppointments(): Promise<AppointmentWithDetails[]> {
    const result = await db
      .select()
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .leftJoin(clinicRooms, eq(appointments.roomId, clinicRooms.id))
      .leftJoin(appointmentTypes, eq(appointments.appointmentTypeId, appointmentTypes.id));

    return result.map(row => ({
      ...row.appointments,
      patient: row.patients!,
      doctor: row.doctors!,
      room: row.clinic_rooms || undefined,
      appointmentType: row.appointment_types!,
    }));
  }

  async getAppointment(id: string): Promise<AppointmentWithDetails | undefined> {
    const result = await db
      .select()
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .leftJoin(clinicRooms, eq(appointments.roomId, clinicRooms.id))
      .leftJoin(appointmentTypes, eq(appointments.appointmentTypeId, appointmentTypes.id))
      .where(eq(appointments.id, id));

    const [row] = result;
    if (!row) return undefined;

    return {
      ...row.appointments,
      patient: row.patients!,
      doctor: row.doctors!,
      room: row.clinic_rooms || undefined,
      appointmentType: row.appointment_types!,
    };
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [created] = await db.insert(appointments).values(appointment).returning();
    return created;
  }

  async updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const [updated] = await db.update(appointments).set(appointment).where(eq(appointments.id, id)).returning();
    return updated || undefined;
  }

  async deleteAppointment(id: string): Promise<boolean> {
    const result = await db.delete(appointments).where(eq(appointments.id, id));
    return result.rowCount > 0;
  }

  async getAppointmentsByDate(date: string): Promise<AppointmentWithDetails[]> {
    const result = await db
      .select()
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .leftJoin(clinicRooms, eq(appointments.roomId, clinicRooms.id))
      .leftJoin(appointmentTypes, eq(appointments.appointmentTypeId, appointmentTypes.id))
      .where(eq(appointments.appointmentDate, date));

    return result.map(row => ({
      ...row.appointments,
      patient: row.patients!,
      doctor: row.doctors!,
      room: row.clinic_rooms || undefined,
      appointmentType: row.appointment_types!,
    }));
  }

  // TUSS Codes methods
  async getTussCodes(search?: string, tableNumber?: string): Promise<TussCode[]> {
    let query = db.select().from(tussCodes);
    
    if (search || tableNumber) {
      // TODO: Add search and filter logic
    }

    return await query;
  }

  async getTussCode(id: string): Promise<TussCode | undefined> {
    const [code] = await db.select().from(tussCodes).where(eq(tussCodes.id, id));
    return code || undefined;
  }

  async searchTussCodes(query: string): Promise<TussCode[]> {
    // TODO: Implement full text search
    return await db.select().from(tussCodes).limit(50);
  }

  // Exam Requests methods
  async getExamRequests(): Promise<ExamRequestWithDetails[]> {
    const result = await db
      .select()
      .from(examRequests)
      .leftJoin(patients, eq(examRequests.patientId, patients.id))
      .leftJoin(doctors, eq(examRequests.doctorId, doctors.id))
      .leftJoin(appointments, eq(examRequests.appointmentId, appointments.id))
      .leftJoin(tussCodes, eq(examRequests.tussCodeId, tussCodes.id));

    return result.map(row => ({
      ...row.exam_requests,
      patient: row.patients!,
      doctor: row.doctors!,
      appointment: row.appointments!,
      tussCode: row.tuss_codes!,
    }));
  }

  async getExamRequest(id: string): Promise<ExamRequestWithDetails | undefined> {
    const result = await db
      .select()
      .from(examRequests)
      .leftJoin(patients, eq(examRequests.patientId, patients.id))
      .leftJoin(doctors, eq(examRequests.doctorId, doctors.id))
      .leftJoin(appointments, eq(examRequests.appointmentId, appointments.id))
      .leftJoin(tussCodes, eq(examRequests.tussCodeId, tussCodes.id))
      .where(eq(examRequests.id, id));

    const [row] = result;
    if (!row) return undefined;

    return {
      ...row.exam_requests,
      patient: row.patients!,
      doctor: row.doctors!,
      appointment: row.appointments!,
      tussCode: row.tuss_codes!,
    };
  }

  async createExamRequest(request: InsertExamRequest): Promise<ExamRequest> {
    const [created] = await db.insert(examRequests).values(request).returning();
    return created;
  }

  async updateExamRequest(id: string, request: Partial<InsertExamRequest>): Promise<ExamRequest | undefined> {
    const [updated] = await db.update(examRequests).set(request).where(eq(examRequests.id, id)).returning();
    return updated || undefined;
  }

  async deleteExamRequest(id: string): Promise<boolean> {
    const result = await db.delete(examRequests).where(eq(examRequests.id, id));
    return result.rowCount > 0;
  }

  async getExamRequestsByPatient(patientId: string): Promise<ExamRequestWithDetails[]> {
    const result = await db
      .select()
      .from(examRequests)
      .leftJoin(patients, eq(examRequests.patientId, patients.id))
      .leftJoin(doctors, eq(examRequests.doctorId, doctors.id))
      .leftJoin(appointments, eq(examRequests.appointmentId, appointments.id))
      .leftJoin(tussCodes, eq(examRequests.tussCodeId, tussCodes.id))
      .where(eq(examRequests.patientId, patientId));

    return result.map(row => ({
      ...row.exam_requests,
      patient: row.patients!,
      doctor: row.doctors!,
      appointment: row.appointments!,
      tussCode: row.tuss_codes!,
    }));
  }
}

export const storage = new DatabaseStorage();