import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Plus, Search, Phone, Mail, Calendar } from "lucide-react";
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
import PatientForm from "@/components/forms/patient-form";
import type { PatientWithInsurance } from "@shared/schema";

export default function Patients() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["/api/patients"],
  });

  const filteredPatients = patients.filter((patient: PatientWithInsurance) =>
    searchTerm === "" ||
    patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm) ||
    (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-medical-text">Patients</h2>
            <p className="text-gray-500">Manage patient records and information</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-medical-blue hover:bg-blue-700" data-testid="button-new-patient">
                <Plus className="mr-2 h-4 w-4" />
                New Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <PatientForm />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Patients ({filteredPatients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 h-16 rounded"></div>
                ))}
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">
                  {searchTerm ? "No patients found matching your search" : "No patients registered"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Insurance</TableHead>
                    <TableHead>Emergency Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient: PatientWithInsurance) => (
                    <TableRow key={patient.id} data-testid={`patient-row-${patient.id}`}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {patient.firstName} {patient.lastName}
                          </p>
                          <p className="text-sm text-gray-500">ID: {patient.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                          {patient.dateOfBirth}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Phone className="mr-2 h-3 w-3 text-gray-400" />
                            {patient.phone}
                          </div>
                          {patient.email && (
                            <div className="flex items-center text-sm">
                              <Mail className="mr-2 h-3 w-3 text-gray-400" />
                              {patient.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {patient.insurancePlan ? (
                          <div>
                            <Badge variant="outline" className="mb-1">
                              {patient.insurancePlan.planName}
                            </Badge>
                            <p className="text-xs text-gray-500">
                              {patient.insurancePlan.provider}
                            </p>
                            {patient.insuranceNumber && (
                              <p className="text-xs text-gray-500">
                                #{patient.insuranceNumber}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">No insurance</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{patient.emergencyContact}</p>
                          <p className="text-xs text-gray-500">{patient.emergencyPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            data-testid={`button-edit-${patient.id}`}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            data-testid={`button-view-${patient.id}`}
                          >
                            View
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
