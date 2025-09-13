import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertAppointmentSchema } from "@/schemas/validation";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", 
  "16:00", "16:30", "17:00", "17:30", "18:00"
];

export default function AppointmentForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: patients = [] } = useQuery<any[]>({
    queryKey: ["/api/patients/"],
  });

  const { data: doctors = [] } = useQuery<any[]>({
    queryKey: ["/api/doctors/"],
  });

  const { data: rooms = [] } = useQuery<any[]>({
    queryKey: ["/api/clinic-rooms/"],
  });

  const { data: appointmentTypes = [] } = useQuery<any[]>({
    queryKey: ["/api/appointment-types/"],
  });

  const form = useForm({
    resolver: zodResolver(insertAppointmentSchema),
    defaultValues: {
      patientId: "",
      doctorId: "",
      roomId: "none",
      appointmentTypeId: "",
      appointmentDate: "",
      appointmentTime: "",
      status: "scheduled",
      reason: "",
      notes: "",
    },
  });

  const createAppointmentMutation = useMutation({
    mutationFn: (data: any) => {
      console.log("🚀 Enviando requisição para:", "/api/appointments/");
      console.log("📋 Dados da requisição:", data);
      return apiRequest("POST", "/api/appointments/", data);
    },
    onSuccess: (response) => {
      console.log("✅ Sucesso na criação:", response);
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/"] });
      toast({
        title: "Sucesso",
        description: "Consulta agendada com sucesso",
      });
      form.reset();
    },
    onError: (error) => {
      console.error("❌ Erro na criação:", error);
      console.error("📄 Detalhes do erro:", error.message);
      toast({
        title: "Erro",
        description: `Falha ao agendar consulta: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: z.infer<typeof insertAppointmentSchema>) => {
    try {
      const appointmentData = {
        patient_id: data.patientId,
        doctor_id: data.doctorId,
        appointment_date: data.appointmentDate,
        appointment_time: data.appointmentTime,
        appointment_type_id: data.appointmentTypeId,
        clinic_room_id: data.clinicRoomId,
        reason: data.reason,
        status: "scheduled",
      };

      // Adicionar roomId apenas se não estiver vazio ou "none"
      if (data.roomId && data.roomId !== "none") {
        appointmentData.clinic_room_id = data.roomId;
      }

      console.log("📤 Dados para o backend:", appointmentData);
      
      createAppointmentMutation.mutate(appointmentData);
    } catch (error) {
      console.error("Erro ao criar consulta:", error);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Agendar Nova Consulta</DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paciente</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-patient">
                        <SelectValue placeholder="Selecionar Paciente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients.map((patient: any) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.first_name} {patient.last_name} - Nasc: {patient.date_of_birth}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Médico</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-doctor">
                        <SelectValue placeholder="Selecionar Médico" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {doctors.map((doctor: any) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          Dr. {doctor.first_name} {doctor.last_name} - {doctor.specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="appointmentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} data-testid="input-date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="appointmentTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horário</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-time">
                        <SelectValue placeholder="Selecionar Horário" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="appointmentTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-type">
                        <SelectValue placeholder="Selecionar Tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {appointmentTypes.map((type: any) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.type_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="roomId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sala (Opcional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-room">
                      <SelectValue placeholder="Selecionar Sala" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Não atribuir sala</SelectItem>
                    {rooms.filter((room: any) => room.isAvailable).map((room: any) => (
                      <SelectItem key={room.id} value={room.id}>
                        Sala {room.room_number} - {room.room_type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Motivo da Consulta</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva o motivo desta consulta..."
                    className="resize-none"
                    {...field}
                    data-testid="textarea-reason"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-medical-blue hover:bg-blue-700"
              disabled={createAppointmentMutation.isPending}
              data-testid="button-schedule"
              onClick={() => console.log("🖱️ Botão clicado!", form.getValues())}
            >
              {createAppointmentMutation.isPending ? "Agendando..." : "Agendar Consulta"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}