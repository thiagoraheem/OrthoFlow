import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Plus, Search, Phone, Mail, Calendar, Eye, Edit } from "lucide-react";
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
import PatientView from "@/components/patient-view";
import PatientEdit from "@/components/patient-edit";
import type { PatientWithInsurance } from "@/types/api";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Patients() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewPatient, setViewPatient] = useState<PatientWithInsurance | null>(null);
  const [editPatient, setEditPatient] = useState<PatientWithInsurance | null>(null);

  const { data: patients = [], isLoading } = useQuery<PatientWithInsurance[]>({
    queryKey: ["/api/patients"],
  });

  const filteredPatients = patients.filter((patient: PatientWithInsurance) =>
    searchTerm === "" ||
    patient.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm) ||
    (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Pacientes</h2>
            <p className="text-muted-foreground text-sm sm:text-base">Gerenciar registros e informações de pacientes</p>
          </div>
          {(user?.userType === "Atendente" || user?.userType === "Administrador") && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90" data-testid="button-new-patient">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Paciente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <PatientForm />
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
                placeholder="Buscar por nome, telefone ou email..."
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
              Pacientes ({filteredPatients.length})
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
                  {searchTerm ? "Nenhum paciente encontrado" : "Nenhum paciente cadastrado"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Data de Nascimento</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Convênio</TableHead>
                      <TableHead>Emergência</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient: PatientWithInsurance) => (
                      <TableRow key={patient.id} data-testid={`patient-row-${patient.id}`}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {patient.first_name} {patient.last_name}
                            </p>
                            <p className="text-sm text-gray-500">ID: {patient.id.slice(0, 8)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                            {patient.date_of_birth ? (
                              (() => {
                                const date = new Date(patient.date_of_birth);
                                return isNaN(date.getTime()) ? 'Data inválida' : format(date, "dd/MM/yyyy", { locale: ptBR });
                              })()
                            ) : 'Não informado'}
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
                            <span className="text-gray-400">Sem convênio</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{patient.emergency_contact}</p>
                            <p className="text-xs text-gray-500">{patient.emergency_phone}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setViewPatient(patient)}
                              data-testid={`button-view-${patient.id}`}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Visualizar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditPatient(patient)}
                              data-testid={`button-edit-${patient.id}`}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
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
      </div>

      {/* Dialog para visualizar paciente */}
      <Dialog open={!!viewPatient} onOpenChange={() => setViewPatient(null)}>
        <DialogContent className="max-w-4xl">
          {viewPatient && <PatientView patient={viewPatient} />}
        </DialogContent>
      </Dialog>

      {/* Dialog para editar paciente */}
      <Dialog open={!!editPatient} onOpenChange={() => setEditPatient(null)}>
        <DialogContent className="max-w-4xl">
          {editPatient && (
            <PatientEdit 
              patient={editPatient} 
              onSuccess={() => setEditPatient(null)}
              onCancel={() => setEditPatient(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}