import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertClinicRoomSchema } from "@shared/schema";
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

const roomTypes = [
  "Consultation Room",
  "Examination Room",
  "Surgery Room",
  "Recovery Room",
  "Physical Therapy Room",
  "X-Ray Room",
  "MRI Room",
];

const capacities = [
  "1 patient",
  "2 patients",
  "4 patients",
  "6 patients",
  "Surgery suite",
];

export default function RoomForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(insertClinicRoomSchema),
    defaultValues: {
      roomNumber: "",
      roomType: "",
      capacity: "",
      equipment: "",
      isAvailable: true,
    },
  });

  const createRoomMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/clinic-rooms", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clinic-rooms"] });
      toast({
        title: "Success",
        description: "Room added successfully",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add room",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createRoomMutation.mutate(data);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add New Room</DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="roomNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Number</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-room-number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roomType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-room-type">
                        <SelectValue placeholder="Select Room Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roomTypes.map((type) => (
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
          </div>

          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-capacity">
                      <SelectValue placeholder="Select Capacity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {capacities.map((capacity) => (
                      <SelectItem key={capacity} value={capacity}>
                        {capacity}
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
            name="equipment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Equipment (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="List available equipment..."
                    {...field}
                    data-testid="textarea-equipment"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-medical-blue hover:bg-blue-700"
              disabled={createRoomMutation.isPending}
              data-testid="button-add"
            >
              {createRoomMutation.isPending ? "Adding..." : "Add Room"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
