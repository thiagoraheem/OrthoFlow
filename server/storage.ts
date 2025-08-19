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
  type PatientWithInsurance
} from "@shared/schema";
import { randomUUID } from "crypto";

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
}

export class MemStorage implements IStorage {
  private doctors: Map<string, Doctor>;
  private patients: Map<string, Patient>;
  private clinicRooms: Map<string, ClinicRoom>;
  private insurancePlans: Map<string, InsurancePlan>;
  private appointmentTypes: Map<string, AppointmentType>;
  private appointments: Map<string, Appointment>;

  constructor() {
    this.doctors = new Map();
    this.patients = new Map();
    this.clinicRooms = new Map();
    this.insurancePlans = new Map();
    this.appointmentTypes = new Map();
    this.appointments = new Map();
    
    this.initializeDefaults();
  }

  private initializeDefaults() {
    // Initialize default appointment types
    const consultationType: AppointmentType = {
      id: randomUUID(),
      typeName: "Consultation",
      duration: "30 minutes",
      description: "Initial patient consultation"
    };
    
    const examinationType: AppointmentType = {
      id: randomUUID(),
      typeName: "Examination",
      duration: "45 minutes",
      description: "Physical examination and assessment"
    };

    this.appointmentTypes.set(consultationType.id, consultationType);
    this.appointmentTypes.set(examinationType.id, examinationType);
  }

  // Doctors
  async getDoctors(): Promise<Doctor[]> {
    return Array.from(this.doctors.values());
  }

  async getDoctor(id: string): Promise<Doctor | undefined> {
    return this.doctors.get(id);
  }

  async createDoctor(insertDoctor: InsertDoctor): Promise<Doctor> {
    const id = randomUUID();
    const doctor: Doctor = { ...insertDoctor, id };
    this.doctors.set(id, doctor);
    return doctor;
  }

  async updateDoctor(id: string, updates: Partial<InsertDoctor>): Promise<Doctor | undefined> {
    const doctor = this.doctors.get(id);
    if (!doctor) return undefined;
    
    const updatedDoctor = { ...doctor, ...updates };
    this.doctors.set(id, updatedDoctor);
    return updatedDoctor;
  }

  async deleteDoctor(id: string): Promise<boolean> {
    return this.doctors.delete(id);
  }

  // Patients
  async getPatients(): Promise<PatientWithInsurance[]> {
    const patients = Array.from(this.patients.values());
    return patients.map(patient => ({
      ...patient,
      insurancePlan: patient.insurancePlanId ? this.insurancePlans.get(patient.insurancePlanId) : undefined
    }));
  }

  async getPatient(id: string): Promise<PatientWithInsurance | undefined> {
    const patient = this.patients.get(id);
    if (!patient) return undefined;
    
    return {
      ...patient,
      insurancePlan: patient.insurancePlanId ? this.insurancePlans.get(patient.insurancePlanId) : undefined
    };
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = randomUUID();
    const patient: Patient = { ...insertPatient, id };
    this.patients.set(id, patient);
    return patient;
  }

  async updatePatient(id: string, updates: Partial<InsertPatient>): Promise<Patient | undefined> {
    const patient = this.patients.get(id);
    if (!patient) return undefined;
    
    const updatedPatient = { ...patient, ...updates };
    this.patients.set(id, updatedPatient);
    return updatedPatient;
  }

  async deletePatient(id: string): Promise<boolean> {
    return this.patients.delete(id);
  }

  // Clinic Rooms
  async getClinicRooms(): Promise<ClinicRoom[]> {
    return Array.from(this.clinicRooms.values());
  }

  async getClinicRoom(id: string): Promise<ClinicRoom | undefined> {
    return this.clinicRooms.get(id);
  }

  async createClinicRoom(insertRoom: InsertClinicRoom): Promise<ClinicRoom> {
    const id = randomUUID();
    const room: ClinicRoom = { ...insertRoom, id };
    this.clinicRooms.set(id, room);
    return room;
  }

  async updateClinicRoom(id: string, updates: Partial<InsertClinicRoom>): Promise<ClinicRoom | undefined> {
    const room = this.clinicRooms.get(id);
    if (!room) return undefined;
    
    const updatedRoom = { ...room, ...updates };
    this.clinicRooms.set(id, updatedRoom);
    return updatedRoom;
  }

  async deleteClinicRoom(id: string): Promise<boolean> {
    return this.clinicRooms.delete(id);
  }

  // Insurance Plans
  async getInsurancePlans(): Promise<InsurancePlan[]> {
    return Array.from(this.insurancePlans.values());
  }

  async getInsurancePlan(id: string): Promise<InsurancePlan | undefined> {
    return this.insurancePlans.get(id);
  }

  async createInsurancePlan(insertPlan: InsertInsurancePlan): Promise<InsurancePlan> {
    const id = randomUUID();
    const plan: InsurancePlan = { ...insertPlan, id };
    this.insurancePlans.set(id, plan);
    return plan;
  }

  async updateInsurancePlan(id: string, updates: Partial<InsertInsurancePlan>): Promise<InsurancePlan | undefined> {
    const plan = this.insurancePlans.get(id);
    if (!plan) return undefined;
    
    const updatedPlan = { ...plan, ...updates };
    this.insurancePlans.set(id, updatedPlan);
    return updatedPlan;
  }

  async deleteInsurancePlan(id: string): Promise<boolean> {
    return this.insurancePlans.delete(id);
  }

  // Appointment Types
  async getAppointmentTypes(): Promise<AppointmentType[]> {
    return Array.from(this.appointmentTypes.values());
  }

  async getAppointmentType(id: string): Promise<AppointmentType | undefined> {
    return this.appointmentTypes.get(id);
  }

  async createAppointmentType(insertType: InsertAppointmentType): Promise<AppointmentType> {
    const id = randomUUID();
    const type: AppointmentType = { ...insertType, id };
    this.appointmentTypes.set(id, type);
    return type;
  }

  async updateAppointmentType(id: string, updates: Partial<InsertAppointmentType>): Promise<AppointmentType | undefined> {
    const type = this.appointmentTypes.get(id);
    if (!type) return undefined;
    
    const updatedType = { ...type, ...updates };
    this.appointmentTypes.set(id, updatedType);
    return updatedType;
  }

  async deleteAppointmentType(id: string): Promise<boolean> {
    return this.appointmentTypes.delete(id);
  }

  // Appointments
  async getAppointments(): Promise<AppointmentWithDetails[]> {
    const appointments = Array.from(this.appointments.values());
    return appointments.map(appointment => this.enrichAppointment(appointment));
  }

  async getAppointment(id: string): Promise<AppointmentWithDetails | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    return this.enrichAppointment(appointment);
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = randomUUID();
    const appointment: Appointment = { ...insertAppointment, id };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointment(id: string, updates: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, ...updates };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async deleteAppointment(id: string): Promise<boolean> {
    return this.appointments.delete(id);
  }

  async getAppointmentsByDate(date: string): Promise<AppointmentWithDetails[]> {
    const appointments = Array.from(this.appointments.values())
      .filter(appointment => appointment.appointmentDate === date);
    return appointments.map(appointment => this.enrichAppointment(appointment));
  }

  private enrichAppointment(appointment: Appointment): AppointmentWithDetails {
    const patient = this.patients.get(appointment.patientId)!;
    const doctor = this.doctors.get(appointment.doctorId)!;
    const room = appointment.roomId ? this.clinicRooms.get(appointment.roomId) : undefined;
    const appointmentType = this.appointmentTypes.get(appointment.appointmentTypeId)!;

    return {
      ...appointment,
      patient,
      doctor,
      room,
      appointmentType
    };
  }
}

export const storage = new MemStorage();
