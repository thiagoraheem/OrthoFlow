import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Plus, Search, Filter, Clock, User, Stethoscope } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AppointmentForm from "@/components/forms/appointment-form";
import { format } from "date-fns";
import type { AppointmentWithDetails } from "@shared/schema";

export default function Appointments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["/api/appointments"],
  });

  const filteredAppointments = appointments.filter((appointment: AppointmentWithDetails) => {
    const matchesSearch = searchTerm === "" || 
      appointment.patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !selectedDate || appointment.appointmentDate === selectedDate;
    
    return matchesSearch && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-health-green text-white";
      case "in-progress": return "bg-info-blue text-white";
      case "scheduled": return "bg-medical-blue text-white";
      case "cancelled": return "bg-destructive text-white";
      default: return "bg-warning-yellow text-white";
    }
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-medical-text">Appointments</h2>
            <p className="text-gray-500">Manage patient appointments and schedules</p>
          </div>
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
      </header>

      <div className="p-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by patient or doctor name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  data-testid="input-date-filter"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedDate("");
                }}
                data-testid="button-clear-filters"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Appointments ({filteredAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 h-16 rounded"></div>
                ))}
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">
                  {searchTerm || selectedDate ? "No appointments found matching your filters" : "No appointments scheduled"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment: AppointmentWithDetails) => (
                    <TableRow key={appointment.id} data-testid={`appointment-row-${appointment.id}`}>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{appointment.appointmentDate}</p>
                            <p className="text-sm text-gray-500">{appointment.appointmentTime}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium">
                              {appointment.patient.firstName} {appointment.patient.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{appointment.patient.phone}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Stethoscope className="mr-2 h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium">
                              Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{appointment.doctor.specialty}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {appointment.appointmentType.typeName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {appointment.room ? (
                          <span>Room {appointment.room.roomNumber}</span>
                        ) : (
                          <span className="text-gray-400">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            data-testid={`button-edit-${appointment.id}`}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            data-testid={`button-cancel-${appointment.id}`}
                          >
                            Cancel
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
