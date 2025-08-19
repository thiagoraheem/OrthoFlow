import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertInsurancePlanSchema } from "@shared/schema";
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

const providers = [
  "Blue Cross Blue Shield",
  "Aetna",
  "Cigna",
  "UnitedHealthcare",
  "Humana",
  "Kaiser Permanente",
  "Anthem",
  "Medicaid",
  "Medicare",
];

const coverageTypes = [
  "HMO",
  "PPO",
  "EPO",
  "POS",
  "HDHP",
  "Traditional",
];

export default function InsuranceForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(insertInsurancePlanSchema),
    defaultValues: {
      planName: "",
      provider: "",
      coverageType: "",
      copayAmount: "",
      deductibleAmount: "",
      isActive: true,
    },
  });

  const createInsuranceMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/insurance", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/insurance"] });
      toast({
        title: "Success",
        description: "Insurance plan added successfully",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add insurance plan",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createInsuranceMutation.mutate(data);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add Insurance Plan</DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="planName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Name</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-plan-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-provider">
                        <SelectValue placeholder="Select Provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {providers.map((provider) => (
                        <SelectItem key={provider} value={provider}>
                          {provider}
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
            name="coverageType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coverage Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-coverage">
                      <SelectValue placeholder="Select Coverage Type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {coverageTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="copayAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Copay Amount ($)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00"
                      {...field} 
                      data-testid="input-copay" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deductibleAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deductible Amount ($)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00"
                      {...field} 
                      data-testid="input-deductible" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-medical-blue hover:bg-blue-700"
              disabled={createInsuranceMutation.isPending}
              data-testid="button-add"
            >
              {createInsuranceMutation.isPending ? "Adding..." : "Add Plan"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
