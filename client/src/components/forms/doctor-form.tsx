import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertDoctorSchema } from "@/schemas/validation";
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
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

const specialties = [
  "Ortopedia Geral",
  "Medicina Esportiva",
  "Artroplastia (Próteses)",
  "Cirurgia da Coluna",
  "Cirurgia da Mão",
  "Cirurgia do Pé e Tornozelo",
  "Ortopedia Pediátrica",
  "Cirurgia do Trauma",
  "Artroscopia",
  "Oncologia Ortopédica"
];

export default function DoctorForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(insertDoctorSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      specialty: "",
      licenseNumber: "",
      phone: "",
      email: "",
      isActive: true,
    },
  });

  const createDoctorMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/doctors", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/doctors"] });
      toast({
        title: "Sucesso",
        description: "Médico cadastrado com sucesso",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao cadastrar médico",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createDoctorMutation.mutate(data);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Cadastrar Novo Médico</DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

          <FormField
            control={form.control}
            name="specialty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Especialidade</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-specialty">
                      <SelectValue placeholder="Selecionar Especialidade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
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
            name="licenseNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número do CRM</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ex: 12345/SP"
                    {...field} 
                    data-testid="input-license" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                  <FormLabel>Email</FormLabel>
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

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-medical-blue hover:bg-blue-700"
              disabled={createDoctorMutation.isPending}
              data-testid="button-add"
            >
              {createDoctorMutation.isPending ? "Cadastrando..." : "Cadastrar Médico"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}