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
import { ptBR } from "date-fns/locale";
import type { AppointmentWithDetails } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";

export default function Appointments() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const { data: appointments = [], isLoading } = useQuery<AppointmentWithDetails[]>({
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

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "Concluída";
      case "in-progress": return "Em Andamento";
      case "scheduled": return "Agendada";
      case "cancelled": return "Cancelada";
      default: return "Atrasada";
    }
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Consultas</h2>
            <p className="text-muted-foreground text-sm sm:text-base">Gerenciar consultas e agendamentos</p>
          </div>
          {(user?.userType === "Atendente" || user?.userType === "Administrador") && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90" data-testid="button-new-appointment">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Consulta
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <AppointmentForm />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por paciente ou médico..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
              </div>
              <div className="w-full lg:w-48">
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
                className="w-full lg:w-auto"
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Consultas ({filteredAppointments.length})
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
                  {searchTerm || selectedDate ? "Nenhuma consulta encontrada" : "Nenhuma consulta agendada"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data & Horário</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Médico</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Sala</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments.map((appointment: AppointmentWithDetails) => (
                      <TableRow key={appointment.id} data-testid={`appointment-row-${appointment.id}`}>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium">
                  {appointment.appointmentDate ? (
                    (() => {
                      const date = new Date(appointment.appointmentDate);
                      return isNaN(date.getTime()) ? 'Data inválida' : format(date, "dd/MM/yyyy", { locale: ptBR });
                    })()
                  ) : 'Não informado'}
                </p>
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
                            <span>Sala {appointment.room.roomNumber}</span>
                          ) : (
                            <span className="text-gray-400">Não atribuída</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(appointment.status)}>
                            {getStatusText(appointment.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              data-testid={`button-edit-${appointment.id}`}
                            >
                              Editar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              data-testid={`button-cancel-${appointment.id}`}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}