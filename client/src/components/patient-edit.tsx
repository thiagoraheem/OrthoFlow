import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertPatientSchema } from "@/schemas/validation";
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
import type { PatientWithInsurance } from "@/types/api";
import { useEffect } from "react";

interface PatientEditProps {
  patient: PatientWithInsurance;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PatientEdit({ patient, onSuccess, onCancel }: PatientEditProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: insurancePlans = [] } = useQuery<any[]>({
    queryKey: ["/api/insurance-plans"],
  });

  const form = useForm({
    resolver: zodResolver(insertPatientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      cpf: "",
      dateOfBirth: "",
      phone: "",
      email: "",
      address: "",
      emergencyContact: "",
      emergencyPhone: "",
      medicalHistory: "",
      allergies: "",
      insurancePlanId: "none",
      insuranceNumber: "",
    },
  });

  // Preencher o formulário com os dados do paciente
  useEffect(() => {
    if (patient) {
      const formatDate = (dateString: string | null) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";
        return date.toISOString().split('T')[0];
      };

      form.reset({
        firstName: patient.first_name || "",
        lastName: patient.last_name || "",
        cpf: patient.cpf || "",
        dateOfBirth: formatDate(patient.date_of_birth),
        phone: patient.phone || "",
        email: patient.email || "",
        address: patient.address || "",
        emergencyContact: patient.emergency_contact || "",
        emergencyPhone: patient.emergency_phone || "",
        medicalHistory: patient.medical_history || "",
        allergies: patient.allergies || "",
        insurancePlanId: patient.insurance_plan_id || "none",
        insuranceNumber: patient.insurance_number || "",
      });
    }
  }, [patient, form]);

  const updatePatientMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PUT", `/api/patients/${patient.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      toast({
        title: "Sucesso",
        description: "Paciente atualizado com sucesso",
      });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar paciente",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    // Mapear campos do frontend (camelCase) para backend (snake_case)
    const mappedData = {
      first_name: data.firstName,
      last_name: data.lastName,
      date_of_birth: data.dateOfBirth,
      phone: data.phone,
      email: data.email || null,
      address: data.address,
      emergency_contact: data.emergencyContact,
      emergency_phone: data.emergencyPhone,
      medical_history: data.medicalHistory || null,
      allergies: data.allergies || null,
      insurance_plan_id: data.insurancePlanId === "none" ? null : data.insurancePlanId || null,
      insurance_number: data.insuranceNumber || null,
    };
    
    // Adicionar CPF apenas se não estiver vazio
    if (data.cpf && data.cpf.trim() !== "") {
      mappedData.cpf = data.cpf;
    }
    
    // Remover campos vazios
    const cleanedData = Object.fromEntries(
      Object.entries(mappedData).map(([key, value]) => [key, value === "" ? null : value])
    );
    
    updatePatientMutation.mutate(cleanedData);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Editar Paciente</DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-first-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sobrenome</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-last-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="000.000.000-00"
                      {...field} 
                      data-testid="input-cpf" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Nascimento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} data-testid="input-dob" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="(11) 99999-9999"
                      {...field} 
                      data-testid="input-phone" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="email@exemplo.com"
                      {...field} 
                      data-testid="input-email" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Endereço completo..."
                    {...field} 
                    data-testid="textarea-address" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="emergencyContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contato de Emergência</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-emergency-contact" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emergencyPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone de Emergência</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="(11) 99999-9999"
                      {...field} 
                      data-testid="input-emergency-phone" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="medicalHistory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Histórico Médico (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o histórico médico do paciente..."
                      className="min-h-[100px]"
                      {...field} 
                      data-testid="textarea-medical-history" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allergies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alergias (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva as alergias do paciente..."
                      className="min-h-[100px]"
                      {...field} 
                      data-testid="textarea-allergies" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="insurancePlanId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plano de Convênio (Opcional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-insurance">
                        <SelectValue placeholder="Selecionar Convênio" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Sem convênio</SelectItem>
                      {insurancePlans.map((plan: any) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.planName} - {plan.provider}
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
              name="insuranceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número do Convênio (Opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-insurance-number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-border sticky bottom-0 bg-card">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90"
              disabled={updatePatientMutation.isPending}
              data-testid="button-update"
            >
              {updatePatientMutation.isPending ? "Atualizando..." : "Atualizar Paciente"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}