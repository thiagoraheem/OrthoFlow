import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserCheck, Plus, Search, Phone, Mail, Stethoscope } from "lucide-react";
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
import DoctorForm from "@/components/forms/doctor-form";
import type { Doctor } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";

export default function Doctors() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: doctors = [], isLoading } = useQuery<Doctor[]>({
    queryKey: ["/api/doctors"],
  });

  const filteredDoctors = doctors.filter((doctor: Doctor) =>
    searchTerm === "" ||
    doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.phone.includes(searchTerm) ||
    doctor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeDoctors = filteredDoctors.filter(doctor => doctor.isActive);
  const inactiveDoctors = filteredDoctors.filter(doctor => !doctor.isActive);

  return (
    <div>
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Médicos</h2>
            <p className="text-muted-foreground text-sm sm:text-base">Gerenciar perfis e informações médicas</p>
          </div>
          {(user?.userType === "Administrador" || user?.userType === "Atendente") && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90" data-testid="button-new-doctor">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Médico
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DoctorForm />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, especialidade, telefone ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
          </CardContent>
        </Card>

        {/* Active Doctors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="mr-2 h-5 w-5" />
              Médicos Ativos ({activeDoctors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 h-16 rounded"></div>
                ))}
              </div>
            ) : activeDoctors.length === 0 ? (
              <div className="text-center py-8">
                <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">
                  {searchTerm ? "Nenhum médico ativo encontrado" : "Nenhum médico ativo cadastrado"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Especialidade</TableHead>
                      <TableHead>CRM</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeDoctors.map((doctor: Doctor) => (
                      <TableRow key={doctor.id} data-testid={`doctor-row-${doctor.id}`}>
                        <TableCell>
                          <div className="flex items-center">
                            <Stethoscope className="mr-2 h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium">
                                Dr. {doctor.firstName} {doctor.lastName}
                              </p>
                              <p className="text-sm text-gray-500">ID: {doctor.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {doctor.specialty}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="font-mono text-sm">{doctor.licenseNumber}</p>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Phone className="mr-2 h-3 w-3 text-gray-400" />
                              {doctor.phone}
                            </div>
                            <div className="flex items-center text-sm">
                              <Mail className="mr-2 h-3 w-3 text-gray-400" />
                              {doctor.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-health-green text-white">
                            Ativo
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              data-testid={`button-edit-${doctor.id}`}
                            >
                              Editar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              data-testid={`button-schedule-${doctor.id}`}
                            >
                              Agenda
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

        {/* Inactive Doctors */}
        {inactiveDoctors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="mr-2 h-5 w-5 text-gray-400" />
                Médicos Inativos ({inactiveDoctors.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Especialidade</TableHead>
                      <TableHead>CRM</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inactiveDoctors.map((doctor: Doctor) => (
                      <TableRow key={doctor.id} data-testid={`doctor-row-${doctor.id}`} className="opacity-75">
                        <TableCell>
                          <div className="flex items-center">
                            <Stethoscope className="mr-2 h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium">
                                Dr. {doctor.firstName} {doctor.lastName}
                              </p>
                              <p className="text-sm text-gray-500">ID: {doctor.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="opacity-75">
                            {doctor.specialty}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="font-mono text-sm">{doctor.licenseNumber}</p>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Phone className="mr-2 h-3 w-3 text-gray-400" />
                              {doctor.phone}
                            </div>
                            <div className="flex items-center text-sm">
                              <Mail className="mr-2 h-3 w-3 text-gray-400" />
                              {doctor.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            Inativo
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              data-testid={`button-edit-${doctor.id}`}
                            >
                              Editar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-health-green hover:bg-green-600 text-white border-health-green"
                              data-testid={`button-activate-${doctor.id}`}
                            >
                              Ativar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}