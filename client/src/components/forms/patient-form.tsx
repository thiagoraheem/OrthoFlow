import React, { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail, MapPin, Heart, FileText, CreditCard, AlertTriangle } from "lucide-react";
import {
  formatCPF,
  formatPhone
} from "@/lib/validation-utils";

interface PatientFormProps {
  onCancel?: () => void;
}

export default function PatientForm({ onCancel }: PatientFormProps = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: insurancePlans = [] } = useQuery<any[]>({
    queryKey: ["/api/insurance-plans/"],
  });

  const form = useForm({
    resolver: zodResolver(insertPatientSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      cpf: "",
      date_of_birth: "",
      phone: "",
      email: "",
      address: "",
      emergency_contact: "",
      emergency_phone: "",
      medical_history: "",
      allergies: "",
      insurance_plan_id: "none",
      insurance_number: "",
    },
    mode: "onChange",
  });



  const createPatientMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/patients/", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients/"] });
      toast({
        title: "Sucesso",
        description: "Paciente cadastrado com sucesso",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao cadastrar paciente",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    // Limpar dados vazios e ajustar valores especiais
    const cleanedData = {
      ...data,
      cpf: data.cpf && data.cpf.trim() !== "" ? data.cpf : null,
      email: data.email || null,
      medical_history: data.medical_history || null,
      allergies: data.allergies || null,
      insurance_plan_id: data.insurance_plan_id === "none" ? null : data.insurance_plan_id || null,
      insurance_number: data.insurance_number || null,
    };
    
    // Remover campos vazios
    const finalData = Object.fromEntries(
      Object.entries(cleanedData).map(([key, value]) => [key, value === "" ? null : value])
    );
    
    createPatientMutation.mutate(finalData);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <DialogHeader className="text-center">
        <DialogTitle className="flex items-center justify-center gap-2 text-2xl">
          <User className="h-6 w-6" />
          Novo Paciente
        </DialogTitle>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-2">
          <AlertTriangle className="h-4 w-4" />
          <span>Campos marcados com * são obrigatórios</span>
        </div>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
                <Badge variant="destructive" className="ml-2">Obrigatório</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Nome <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Digite o nome"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Sobrenome <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Digite o sobrenome"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        CPF <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="000.000.000-00"
                          onChange={(e) => {
                            const formatted = formatCPF(e.target.value);
                            field.onChange(formatted);
                          }}
                          maxLength={14}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date_of_birth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Data de Nascimento <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Informações de Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Informações de Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        Telefone <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="(00) 00000-0000"
                          onChange={(e) => {
                            const formatted = formatPhone(e.target.value);
                            field.onChange(formatted);
                          }}
                          maxLength={15}
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
                      <FormLabel className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="email@exemplo.com"
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
                    <FormLabel className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Endereço <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Digite o endereço completo"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Contato de Emergência */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Contato de Emergência
                <Badge variant="destructive" className="ml-2">Obrigatório</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="emergency_contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Nome do Contato <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Nome do contato de emergência"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergency_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        Telefone de Emergência <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="(00) 00000-0000"
                          onChange={(e) => {
                            const formatted = formatPhone(e.target.value);
                            field.onChange(formatted);
                          }}
                          maxLength={15}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Informações Médicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Informações Médicas
                <Badge variant="secondary" className="ml-2">Opcional</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="medical_history"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      Histórico Médico
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Descreva o histórico médico do paciente (opcional)"
                        className="min-h-[100px]"
                        maxLength={1000}
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
                    <FormLabel className="flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      Alergias
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Liste as alergias conhecidas (opcional)"
                        className="min-h-[80px]"
                        maxLength={500}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Informações do Convênio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Informações do Convênio
                <Badge variant="secondary" className="ml-2">Opcional</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="insurance_plan_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plano de Saúde</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o plano" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {insurancePlans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id.toString()}>
                              {plan.name}
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
                  name="insurance_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número do Convênio</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Número da carteirinha"
                          maxLength={50}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {form.formState.isValid ? (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  Formulário válido
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                  {Object.keys(form.formState.errors).length} erro(s) encontrado(s)
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="lg" onClick={onCancel}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createPatientMutation.isPending || !form.formState.isValid}
                size="lg"
                className="min-w-[120px]"
              >
                {createPatientMutation.isPending ? "Salvando..." : "Salvar Paciente"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}