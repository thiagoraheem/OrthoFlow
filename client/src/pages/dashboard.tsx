import { useQuery } from "@tanstack/react-query";
import { 
  Calendar, 
  Users, 
  UserCheck, 
  DoorOpen,
  ArrowUp,
  Clock,
  Plus,
  UserPlus,
  Stethoscope,
  Shield,
  CalendarCheck,
  CalendarPlus,
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import AppointmentForm from "@/components/forms/appointment-form";
import PatientForm from "@/components/forms/patient-form";
import DoctorForm from "@/components/forms/doctor-form";
import { format } from "date-fns";
import type { AppointmentWithDetails } from "@shared/schema";

export default function Dashboard() {
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: todayAppointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/appointments", { date: today }],
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ["/api/doctors"],
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["/api/rooms"],
  });

  const availableDoctors = doctors.filter(d => d.isActive);
  const availableRooms = rooms.filter(r => r.isAvailable);
  const roomOccupancy = rooms.length > 0 ? Math.round(((rooms.length - availableRooms.length) / rooms.length) * 100) : 0;

  const getAppointmentStatusColor = (appointment: AppointmentWithDetails) => {
    switch (appointment.status) {
      case "completed": return "bg-health-green border-health-green";
      case "in-progress": return "bg-health-green border-health-green";
      case "scheduled": return "bg-medical-blue border-medical-blue";
      default: return "bg-warning-yellow border-warning-yellow";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed": return "Completed";
      case "in-progress": return "In Progress";
      case "scheduled": return "Check In";
      default: return "Late";
    }
  };

  return (
    <div>
      {/* Top Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-medical-text">Dashboard</h2>
            <p className="text-gray-500">Today, {format(new Date(), "MMMM d, yyyy")}</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search patients, doctors..."
                className="w-80 pl-10"
                data-testid="search-input"
              />
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>

            {/* Quick Actions */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-medical-blue hover:bg-blue-700" data-testid="button-new-appointment">
                  <Plus className="mr-2 h-4 w-4" />
                  New Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <AppointmentForm />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Today's Appointments</p>
                  <p className="text-3xl font-bold text-medical-text mt-1" data-testid="stat-appointments">
                    {todayAppointments.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CalendarCheck className="text-medical-blue text-xl" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <ArrowUp className="text-health-green mr-1 h-4 w-4" />
                <span className="text-health-green font-medium">Active</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Patients</p>
                  <p className="text-3xl font-bold text-medical-text mt-1" data-testid="stat-patients">
                    {patients.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="text-health-green text-xl" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <ArrowUp className="text-health-green mr-1 h-4 w-4" />
                <span className="text-health-green font-medium">Registered</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Available Doctors</p>
                  <p className="text-3xl font-bold text-medical-text mt-1" data-testid="stat-doctors">
                    {availableDoctors.length}/{doctors.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="text-info-blue text-xl" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <Clock className="text-warning-yellow mr-1 h-4 w-4" />
                <span className="text-warning-yellow font-medium">On duty</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Room Occupancy</p>
                  <p className="text-3xl font-bold text-medical-text mt-1" data-testid="stat-rooms">
                    {roomOccupancy}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DoorOpen className="text-purple-600 text-xl" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-gray-500">
                  {rooms.length - availableRooms.length} of {rooms.length} rooms occupied
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Today's Schedule</CardTitle>
                <Button variant="ghost" className="text-medical-blue hover:text-blue-700">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="space-y-4">
                  <div className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>
                  <div className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>
                  <div className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>
                </div>
              ) : todayAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-500">No appointments scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayAppointments.map((appointment: AppointmentWithDetails) => (
                    <div
                      key={appointment.id}
                      className={`flex items-center p-4 rounded-lg border-l-4 ${getAppointmentStatusColor(appointment)}`}
                      data-testid={`appointment-${appointment.id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium">
                            {appointment.appointmentTime}
                          </span>
                          <Badge variant="secondary">
                            {appointment.appointmentType.typeName}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-medical-text mt-1">
                          {appointment.patient.firstName} {appointment.patient.lastName}
                        </h4>
                        <p className="text-sm text-gray-500">{appointment.reason}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          <Stethoscope className="inline mr-1 h-4 w-4" />
                          Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                          {appointment.room && (
                            <>
                              <span className="mx-2">•</span>
                              <DoorOpen className="inline mr-1 h-4 w-4" />
                              Room {appointment.room.roomNumber}
                            </>
                          )}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className={
                            appointment.status === "completed" || appointment.status === "in-progress"
                              ? "bg-health-green hover:bg-green-600"
                              : "bg-health-green hover:bg-green-600"
                          }
                          data-testid={`button-${appointment.status === "scheduled" ? "checkin" : "status"}`}
                        >
                          {getStatusLabel(appointment.status)}
                        </Button>
                        {appointment.status === "scheduled" && (
                          <Button
                            size="sm"
                            variant="outline"
                            data-testid="button-reschedule"
                          >
                            Reschedule
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Panel */}
          <div className="space-y-6">
            {/* Quick Registration */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full bg-medical-blue hover:bg-blue-700 justify-center"
                      data-testid="button-register-patient"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Register New Patient
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <PatientForm />
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full bg-health-green hover:bg-green-600 justify-center"
                      data-testid="button-add-doctor"
                    >
                      <Stethoscope className="mr-2 h-4 w-4" />
                      Add Doctor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DoctorForm />
                  </DialogContent>
                </Dialog>

                <Button 
                  className="w-full bg-info-blue hover:bg-cyan-700 justify-center"
                  data-testid="button-manage-rooms"
                >
                  <DoorOpen className="mr-2 h-4 w-4" />
                  Manage Rooms
                </Button>

                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700 justify-center"
                  data-testid="button-insurance-plans"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Insurance Plans
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CalendarPlus className="text-medical-blue text-sm" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-medical-text">New appointment scheduled</p>
                      <p className="text-xs text-gray-500">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserCheck className="text-health-green text-sm" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-medical-text">Patient checked in</p>
                      <p className="text-xs text-gray-500">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="text-purple-600 text-sm" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-medical-text">Treatment plan updated</p>
                      <p className="text-xs text-gray-500">15 minutes ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
