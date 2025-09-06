import { useState } from "react";
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
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppointmentForm from "@/components/forms/appointment-form";
import PatientForm from "@/components/forms/patient-form";
import DoctorForm from "@/components/forms/doctor-form";
import { format, addDays, startOfWeek, endOfWeek, addWeeks, subWeeks, addMonths, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import type { AppointmentWithDetails, Doctor } from "@/types/api";

export default function Dashboard() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");

  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery<AppointmentWithDetails[]>({
    queryKey: ["/api/appointments"],
  });

  const { data: doctors = [] } = useQuery<Doctor[]>({
    queryKey: ["/api/doctors"],
  });

  const { data: patients = [] } = useQuery<any[]>({
    queryKey: ["/api/patients"],
  });

  const { data: rooms = [] } = useQuery<any[]>({
    queryKey: ["/api/clinic-rooms"],
  });

  // Filtrar consultas baseado no tipo de usuário e data
  const getFilteredAppointments = () => {
    let filtered = appointments;
    
    // Se for médico, mostrar apenas suas consultas
    if (user?.userType === "Médico" && user?.doctorId) {
      filtered = filtered.filter(apt => apt.doctorId === user.doctorId);
    }
    
    // Filtrar por período selecionado
    const currentDateStr = format(currentDate, "yyyy-MM-dd");
    
    if (viewMode === "day") {
      filtered = filtered.filter(apt => apt.appointmentDate === currentDateStr);
    } else if (viewMode === "week") {
      const weekStart = startOfWeek(currentDate, { locale: ptBR });
      const weekEnd = endOfWeek(currentDate, { locale: ptBR });
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate >= weekStart && aptDate <= weekEnd;
      });
    } else if (viewMode === "month") {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate >= monthStart && aptDate <= monthEnd;
      });
    }
    
    return filtered;
  };
  
  const filteredAppointments = getFilteredAppointments();
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
      case "completed": return "Concluída";
      case "in-progress": return "Em Andamento";
      case "scheduled": return "Fazer Check-in";
      default: return "Atrasada";
    }
  };
  
  const navigateDate = (direction: 'prev' | 'next') => {
    if (viewMode === "day") {
      setCurrentDate(prev => direction === 'next' ? addDays(prev, 1) : addDays(prev, -1));
    } else if (viewMode === "week") {
      setCurrentDate(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
    } else if (viewMode === "month") {
      setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
    }
  };
  
  const getDateRangeText = () => {
    if (viewMode === "day") {
      return format(currentDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } else if (viewMode === "week") {
      const weekStart = startOfWeek(currentDate, { locale: ptBR });
      const weekEnd = endOfWeek(currentDate, { locale: ptBR });
      return `${format(weekStart, "dd MMM", { locale: ptBR })} - ${format(weekEnd, "dd MMM yyyy", { locale: ptBR })}`;
    } else {
      return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
    }
  };

  return (
    <div>
      {/* Top Header */}
      <header className="bg-card shadow-sm border-b border-border px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Agenda</h2>
            <p className="text-muted-foreground text-sm sm:text-base">{getDateRangeText()}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {/* Navigation Controls */}
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateDate('prev')}
                className="shadow-sm hover:shadow-md transition-all duration-200 border-border"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentDate(new Date())}
                className="text-xs sm:text-sm shadow-sm hover:shadow-md transition-all duration-200 border-border font-medium px-4"
              >
                Hoje
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateDate('next')}
                className="shadow-sm hover:shadow-md transition-all duration-200 border-border"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* View Mode Selector */}
            <Select value={viewMode} onValueChange={(value: "day" | "week" | "month") => setViewMode(value)}>
              <SelectTrigger className="w-32 shadow-sm hover:shadow-md transition-all duration-200 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Dia</SelectItem>
                <SelectItem value="week">Semana</SelectItem>
                <SelectItem value="month">Mês</SelectItem>
              </SelectContent>
            </Select>

            {/* Quick Actions */}
            {(user?.userType === "Atendente" || user?.userType === "Administrador") && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200 font-medium px-6 py-2 h-10"
                    size="default"
                    data-testid="button-new-appointment"
                  >
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
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-border">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    {viewMode === "day" ? "Consultas Hoje" : 
                     viewMode === "week" ? "Consultas da Semana" : "Consultas do Mês"}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1" data-testid="stat-appointments">
                    {filteredAppointments.length}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <CalendarCheck className="text-primary text-lg sm:text-xl" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <ArrowUp className="text-green-600 dark:text-green-400 mr-1 h-4 w-4" />
                <span className="text-green-600 dark:text-green-400 font-medium">Ativo</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-border">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Total Pacientes</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1" data-testid="stat-patients">
                    {patients.length}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Users className="text-green-600 dark:text-green-400 text-lg sm:text-xl" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <ArrowUp className="text-green-600 dark:text-green-400 mr-1 h-4 w-4" />
                <span className="text-green-600 dark:text-green-400 font-medium">Registrados</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-border">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Médicos Disponíveis</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1" data-testid="stat-doctors">
                    {availableDoctors.length}/{doctors.length}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-100 dark:bg-cyan-900/20 rounded-lg flex items-center justify-center">
                  <UserCheck className="text-cyan-600 dark:text-cyan-400 text-lg sm:text-xl" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <Clock className="text-yellow-600 dark:text-yellow-400 mr-1 h-4 w-4" />
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">De plantão</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-border">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Ocupação de Salas</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1" data-testid="stat-rooms">
                    {roomOccupancy}%
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <DoorOpen className="text-purple-600 dark:text-purple-400 text-lg sm:text-xl" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-muted-foreground">
                  {rooms.length - availableRooms.length} de {rooms.length} salas ocupadas
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Schedule */}
          <Card className="xl:col-span-2 shadow-sm hover:shadow-md transition-all duration-200 border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground">
                  {viewMode === "day" ? "Agenda de Hoje" : 
                   viewMode === "week" ? "Agenda da Semana" : "Agenda do Mês"}
                </CardTitle>
                <Button variant="ghost" className="text-primary hover:text-primary/80 shadow-sm hover:shadow-md transition-all duration-200">
                  Ver Todas
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="space-y-4">
                  <div className="animate-pulse bg-muted h-16 sm:h-20 rounded-lg"></div>
                  <div className="animate-pulse bg-muted h-16 sm:h-20 rounded-lg"></div>
                  <div className="animate-pulse bg-muted h-16 sm:h-20 rounded-lg"></div>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground text-sm sm:text-base">
                    {viewMode === "day" ? "Nenhuma consulta agendada para hoje" :
                     viewMode === "week" ? "Nenhuma consulta agendada para esta semana" :
                     "Nenhuma consulta agendada para este mês"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {user?.userType === "Atendente" && viewMode !== "day" ? (
                    // Agrupar por médico para atendentes
                    (() => {
                      const appointmentsByDoctor = filteredAppointments.reduce((acc, appointment) => {
                        const doctorKey = `${appointment.doctor.firstName} ${appointment.doctor.lastName}`;
                        if (!acc[doctorKey]) {
                          acc[doctorKey] = [];
                        }
                        acc[doctorKey].push(appointment);
                        return acc;
                      }, {} as Record<string, AppointmentWithDetails[]>);

                      return Object.entries(appointmentsByDoctor).map(([doctorName, doctorAppointments]) => (
                        <div key={doctorName} className="border rounded-lg p-4">
                          <h3 className="font-semibold text-medical-blue mb-3 flex items-center">
                            <Stethoscope className="mr-2 h-4 w-4" />
                            Dr. {doctorName} ({doctorAppointments.length} consultas)
                          </h3>
                          <div className="space-y-3">
                            {doctorAppointments.map((appointment: AppointmentWithDetails) => (
                              <div
                                key={appointment.id}
                                className={`flex flex-col sm:flex-row items-start sm:items-center p-3 rounded-lg border-l-4 ${getAppointmentStatusColor(appointment)} gap-3`}
                                data-testid={`appointment-${appointment.id}`}
                              >
                                <div className="flex-1 w-full">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <div className="flex items-center space-x-3">
                                      <span className="text-sm font-medium">
                                        {appointment.appointmentDate ? (
                  (() => {
                    const date = new Date(appointment.appointmentDate);
                    return isNaN(date.getTime()) ? '--/--' : format(date, "dd/MM");
                  })()
                ) : '--/--'}
                                      </span>
                                      <span className="text-sm font-medium">
                                        {appointment.appointmentTime}
                                      </span>
                                      <Badge variant="secondary" className="text-xs">
                                        {appointment.appointmentType.typeName}
                                      </Badge>
                                    </div>
                                  </div>
                                  <h4 className="font-semibold text-medical-text mt-1">
                                    {appointment.patient.firstName} {appointment.patient.lastName}
                                  </h4>
                                  <p className="text-sm text-gray-500">{appointment.reason}</p>
                                  {appointment.room && (
                                    <div className="flex items-center text-sm text-gray-600 mt-1">
                                      <DoorOpen className="inline mr-1 h-3 w-3" />
                                      Sala {appointment.room.roomNumber}
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-row gap-2">
                                  <Button
                                    size="sm"
                                    className={
                                      appointment.status === "completed" || appointment.status === "in-progress"
                                        ? "bg-health-green hover:bg-green-600 text-xs"
                                        : "bg-health-green hover:bg-green-600 text-xs"
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
                                      className="text-xs"
                                    >
                                      Reagendar
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ));
                    })()
                  ) : (
                    // Vista normal para médicos e vista de dia
                    filteredAppointments.map((appointment: AppointmentWithDetails) => (
                      <div
                        key={appointment.id}
                        className={`flex flex-col sm:flex-row items-start sm:items-center p-3 sm:p-4 rounded-lg border-l-4 ${getAppointmentStatusColor(appointment)} gap-3`}
                        data-testid={`appointment-${appointment.id}`}
                      >
                        <div className="flex-1 w-full">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-medium">
                                {appointment.appointmentDate ? (
                  (() => {
                    const date = new Date(appointment.appointmentDate);
                    return isNaN(date.getTime()) ? '--/--' : format(date, "dd/MM");
                  })()
                ) : '--/--'}
                              </span>
                              <span className="text-sm font-medium">
                                {appointment.appointmentTime}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {appointment.appointmentType.typeName}
                              </Badge>
                            </div>
                          </div>
                          <h4 className="font-semibold text-medical-text mt-1">
                            {appointment.patient.firstName} {appointment.patient.lastName}
                          </h4>
                          <p className="text-sm text-gray-500">{appointment.reason}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-600 mt-1">
                            {user?.userType !== "Médico" && (
                              <div className="flex items-center">
                                <Stethoscope className="inline mr-1 h-3 w-3" />
                                Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                              </div>
                            )}
                            {appointment.room && (
                              <div className="flex items-center">
                                <DoorOpen className="inline mr-1 h-3 w-3" />
                                Sala {appointment.room.roomNumber}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                          <Button
                            size="sm"
                            className={
                              appointment.status === "completed" || appointment.status === "in-progress"
                                ? "bg-health-green hover:bg-green-600 text-xs"
                                : "bg-health-green hover:bg-green-600 text-xs"
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
                              className="text-xs"
                            >
                              Reagendar
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Panel */}
          <div className="space-y-6">
            {/* Quick Registration */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(user?.userType === "Atendente" || user?.userType === "Administrador") && (
                  <>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full bg-primary hover:bg-primary/90 justify-center text-sm"
                          data-testid="button-register-patient"
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Cadastrar Paciente
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <PatientForm />
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full bg-secondary hover:bg-secondary/80 justify-center text-sm"
                          data-testid="button-add-doctor"
                        >
                          <Stethoscope className="mr-2 h-4 w-4" />
                          Cadastrar Médico
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DoctorForm />
                      </DialogContent>
                    </Dialog>
                  </>
                )}

                {(user?.userType === "Administrador" || user?.userType === "Controlador") && (
                  <>
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 justify-center text-sm"
                      data-testid="button-manage-rooms"
                    >
                      <DoorOpen className="mr-2 h-4 w-4" />
                      Gerenciar Salas
                    </Button>

                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700 justify-center text-sm"
                      data-testid="button-insurance-plans"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Planos de Convênio
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CalendarPlus className="text-medical-blue text-sm" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-medical-text">Nova consulta agendada</p>
                      <p className="text-xs text-gray-500">há 2 minutos</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserCheck className="text-health-green text-sm" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-medical-text">Paciente fez check-in</p>
                      <p className="text-xs text-gray-500">há 5 minutos</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="text-purple-600 text-sm" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-medical-text">Plano de tratamento atualizado</p>
                      <p className="text-xs text-gray-500">há 15 minutos</p>
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