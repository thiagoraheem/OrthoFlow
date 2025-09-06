import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertPatientSchema } from "@shared/schema";
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
import { ValidatedInput } from "@/components/ui/validated-input";
import { ValidatedTextarea } from "@/components/ui/validated-textarea";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail, MapPin, Heart, FileText, CreditCard, AlertTriangle } from "lucide-react";
import {
  formatCPF,
  formatPhone,
  validateCPF,
  validatePhone,
  validateEmail,
  validateBirthDate,
  validateName,
  validateAddress,
  validateOptionalText
} from "@/lib/validation-utils";

export default function PatientForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormValid, setIsFormValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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
    mode: "onChange",
  });

  // Validação em tempo real
  const validateForm = () => {
    const values = form.getValues();
    const errors: Record<string, string> = {};
    
    // Validações obrigatórias
    const firstNameValidation = validateName(values.firstName, "Nome");
    if (!firstNameValidation.isValid) errors.firstName = firstNameValidation.message!;
    
    const lastNameValidation = validateName(values.lastName, "Sobrenome");
    if (!lastNameValidation.isValid) errors.lastName = lastNameValidation.message!;
    
    const cpfValidation = validateCPF(values.cpf);
    if (!cpfValidation.isValid) errors.cpf = cpfValidation.message!;
    
    const birthDateValidation = validateBirthDate(values.dateOfBirth);
    if (!birthDateValidation.isValid) errors.dateOfBirth = birthDateValidation.message!;
    
    const phoneValidation = validatePhone(values.phone);
    if (!phoneValidation.isValid) errors.phone = phoneValidation.message!;
    
    const addressValidation = validateAddress(values.address);
    if (!addressValidation.isValid) errors.address = addressValidation.message!;
    
    const emergencyContactValidation = validateName(values.emergencyContact, "Contato de emergência");
    if (!emergencyContactValidation.isValid) errors.emergencyContact = emergencyContactValidation.message!;
    
    const emergencyPhoneValidation = validatePhone(values.emergencyPhone);
    if (!emergencyPhoneValidation.isValid) errors.emergencyPhone = emergencyPhoneValidation.message!;
    
    // Validações opcionais
    if (values.email) {
      const emailValidation = validateEmail(values.email);
      if (!emailValidation.isValid) errors.email = emailValidation.message!;
    }
    
    const medicalHistoryValidation = validateOptionalText(values.medicalHistory, 1000, "Histórico médico");
    if (!medicalHistoryValidation.isValid) errors.medicalHistory = medicalHistoryValidation.message!;
    
    const allergiesValidation = validateOptionalText(values.allergies, 500, "Alergias");
    if (!allergiesValidation.isValid) errors.allergies = allergiesValidation.message!;
    
    const insuranceNumberValidation = validateOptionalText(values.insuranceNumber, 50, "Número do convênio");
    if (!insuranceNumberValidation.isValid) errors.insuranceNumber = insuranceNumberValidation.message!;
    
    setValidationErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
  };

  // Observar mudanças no formulário
  const watchedValues = form.watch();
  useEffect(() => {
    validateForm();
  }, [watchedValues]);

  const createPatientMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/patients", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
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
    // Mapear campos do frontend (camelCase) para backend (snake_case)
    const mappedData = {
      first_name: data.firstName,
      last_name: data.lastName,
      cpf: data.cpf && data.cpf.trim() !== "" ? data.cpf : null, // CPF apenas se fornecido
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
    
    // Remover campos vazios
    const cleanedData = Object.fromEntries(
      Object.entries(mappedData).map(([key, value]) => [key, value === "" ? null : value])
    );
    
    createPatientMutation.mutate(cleanedData);
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
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Nome <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <ValidatedInput
                          {...field}
                          placeholder="Digite o nome"
                          required
                          error={validationErrors.firstName}
                          onValidate={(value) => validateName(value, "Nome")}
                        />
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
                      <FormLabel className="flex items-center gap-1">
                        Sobrenome <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <ValidatedInput
                          {...field}
                          placeholder="Digite o sobrenome"
                          required
                          error={validationErrors.lastName}
                          onValidate={(value) => validateName(value, "Sobrenome")}
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
                        <ValidatedInput
                          {...field}
                          placeholder="000.000.000-00"
                          required
                          error={validationErrors.cpf}
                          onValidate={validateCPF}
                          formatValue={formatCPF}
                          maxLength={14}
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
                      <FormLabel className="flex items-center gap-1">
                        Data de Nascimento <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <ValidatedInput
                          {...field}
                          type="date"
                          required
                          error={validationErrors.dateOfBirth}
                          onValidate={validateBirthDate}
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
                        <ValidatedInput
                          {...field}
                          placeholder="(00) 00000-0000"
                          required
                          error={validationErrors.phone}
                          onValidate={validatePhone}
                          formatValue={formatPhone}
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
                        <ValidatedInput
                          {...field}
                          type="email"
                          placeholder="email@exemplo.com"
                          error={validationErrors.email}
                          onValidate={validateEmail}
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
                      <ValidatedInput
                        {...field}
                        placeholder="Digite o endereço completo"
                        required
                        error={validationErrors.address}
                        onValidate={validateAddress}
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
                  name="emergencyContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Nome do Contato <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <ValidatedInput
                          {...field}
                          placeholder="Nome do contato de emergência"
                          required
                          error={validationErrors.emergencyContact}
                          onValidate={(value) => validateName(value, "Contato de emergência")}
                        />
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
                      <FormLabel className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        Telefone de Emergência <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <ValidatedInput
                          {...field}
                          placeholder="(00) 00000-0000"
                          required
                          error={validationErrors.emergencyPhone}
                          onValidate={validatePhone}
                          formatValue={formatPhone}
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
                name="medicalHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      Histórico Médico
                    </FormLabel>
                    <FormControl>
                      <ValidatedTextarea
                        {...field}
                        placeholder="Descreva o histórico médico do paciente (opcional)"
                        className="min-h-[100px]"
                        error={validationErrors.medicalHistory}
                        onValidate={(value) => validateOptionalText(value, 1000, "Histórico médico")}
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
                      <ValidatedTextarea
                        {...field}
                        placeholder="Liste as alergias conhecidas (opcional)"
                        className="min-h-[80px]"
                        error={validationErrors.allergies}
                        onValidate={(value) => validateOptionalText(value, 500, "Alergias")}
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
                  name="insurancePlanId"
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
                  name="insuranceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número do Convênio</FormLabel>
                      <FormControl>
                        <ValidatedInput
                          {...field}
                          placeholder="Número da carteirinha"
                          error={validationErrors.insuranceNumber}
                          onValidate={(value) => validateOptionalText(value, 50, "Número do convênio")}
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
              {isFormValid ? (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  Formulário válido
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                  {Object.keys(validationErrors).length} erro(s) encontrado(s)
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="lg">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createPatientMutation.isPending || !isFormValid}
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