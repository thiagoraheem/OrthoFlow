import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertDoctorSchema,
  insertPatientSchema,
  insertClinicRoomSchema,
  insertInsurancePlanSchema,
  insertAppointmentTypeSchema,
  insertAppointmentSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Doctors
  app.get("/api/doctors", async (req, res) => {
    try {
      const doctors = await storage.getDoctors();
      res.json(doctors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch doctors" });
    }
  });

  app.get("/api/doctors/:id", async (req, res) => {
    try {
      const doctor = await storage.getDoctor(req.params.id);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      res.json(doctor);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch doctor" });
    }
  });

  app.post("/api/doctors", async (req, res) => {
    try {
      const validatedData = insertDoctorSchema.parse(req.body);
      const doctor = await storage.createDoctor(validatedData);
      res.status(201).json(doctor);
    } catch (error) {
      res.status(400).json({ message: "Invalid doctor data" });
    }
  });

  app.put("/api/doctors/:id", async (req, res) => {
    try {
      const validatedData = insertDoctorSchema.partial().parse(req.body);
      const doctor = await storage.updateDoctor(req.params.id, validatedData);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      res.json(doctor);
    } catch (error) {
      res.status(400).json({ message: "Invalid doctor data" });
    }
  });

  app.delete("/api/doctors/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteDoctor(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete doctor" });
    }
  });

  // Patients
  app.get("/api/patients", async (req, res) => {
    try {
      const patients = await storage.getPatients();
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  app.get("/api/patients/:id", async (req, res) => {
    try {
      const patient = await storage.getPatient(req.params.id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  app.post("/api/patients", async (req, res) => {
    try {
      const validatedData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(validatedData);
      res.status(201).json(patient);
    } catch (error) {
      res.status(400).json({ message: "Invalid patient data" });
    }
  });

  app.put("/api/patients/:id", async (req, res) => {
    try {
      const validatedData = insertPatientSchema.partial().parse(req.body);
      const patient = await storage.updatePatient(req.params.id, validatedData);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.json(patient);
    } catch (error) {
      res.status(400).json({ message: "Invalid patient data" });
    }
  });

  app.delete("/api/patients/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePatient(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete patient" });
    }
  });

  // Clinic Rooms
  app.get("/api/rooms", async (req, res) => {
    try {
      const rooms = await storage.getClinicRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });

  app.post("/api/rooms", async (req, res) => {
    try {
      const validatedData = insertClinicRoomSchema.parse(req.body);
      const room = await storage.createClinicRoom(validatedData);
      res.status(201).json(room);
    } catch (error) {
      res.status(400).json({ message: "Invalid room data" });
    }
  });

  app.put("/api/rooms/:id", async (req, res) => {
    try {
      const validatedData = insertClinicRoomSchema.partial().parse(req.body);
      const room = await storage.updateClinicRoom(req.params.id, validatedData);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      res.json(room);
    } catch (error) {
      res.status(400).json({ message: "Invalid room data" });
    }
  });

  app.delete("/api/rooms/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteClinicRoom(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Room not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete room" });
    }
  });

  // Insurance Plans
  app.get("/api/insurance", async (req, res) => {
    try {
      const plans = await storage.getInsurancePlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch insurance plans" });
    }
  });

  app.post("/api/insurance", async (req, res) => {
    try {
      const validatedData = insertInsurancePlanSchema.parse(req.body);
      const plan = await storage.createInsurancePlan(validatedData);
      res.status(201).json(plan);
    } catch (error) {
      res.status(400).json({ message: "Invalid insurance plan data" });
    }
  });

  app.put("/api/insurance/:id", async (req, res) => {
    try {
      const validatedData = insertInsurancePlanSchema.partial().parse(req.body);
      const plan = await storage.updateInsurancePlan(req.params.id, validatedData);
      if (!plan) {
        return res.status(404).json({ message: "Insurance plan not found" });
      }
      res.json(plan);
    } catch (error) {
      res.status(400).json({ message: "Invalid insurance plan data" });
    }
  });

  app.delete("/api/insurance/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteInsurancePlan(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Insurance plan not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete insurance plan" });
    }
  });

  // Appointment Types
  app.get("/api/appointment-types", async (req, res) => {
    try {
      const types = await storage.getAppointmentTypes();
      res.json(types);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointment types" });
    }
  });

  app.post("/api/appointment-types", async (req, res) => {
    try {
      const validatedData = insertAppointmentTypeSchema.parse(req.body);
      const type = await storage.createAppointmentType(validatedData);
      res.status(201).json(type);
    } catch (error) {
      res.status(400).json({ message: "Invalid appointment type data" });
    }
  });

  // Appointments
  app.get("/api/appointments", async (req, res) => {
    try {
      const { date } = req.query;
      if (date && typeof date === 'string') {
        const appointments = await storage.getAppointmentsByDate(date);
        res.json(appointments);
      } else {
        const appointments = await storage.getAppointments();
        res.json(appointments);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.get("/api/appointments/:id", async (req, res) => {
    try {
      const appointment = await storage.getAppointment(req.params.id);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointment" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(validatedData);
      res.status(201).json(appointment);
    } catch (error) {
      res.status(400).json({ message: "Invalid appointment data" });
    }
  });

  app.put("/api/appointments/:id", async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.partial().parse(req.body);
      const appointment = await storage.updateAppointment(req.params.id, validatedData);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      res.status(400).json({ message: "Invalid appointment data" });
    }
  });

  app.delete("/api/appointments/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteAppointment(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete appointment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
