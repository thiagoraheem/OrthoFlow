import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield, Plus, Search, Users, DollarSign, Building } from "lucide-react";
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
import type { InsurancePlan, PatientWithInsurance } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";

export default function Insurance() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: insurancePlans = [], isLoading } = useQuery<InsurancePlan[]>({
    queryKey: ["/api/insurance"],
  });

  const { data: patients = [] } = useQuery<PatientWithInsurance[]>({
    queryKey: ["/api/patients"],
  });

  const filteredPlans = insurancePlans.filter((plan: InsurancePlan) =>
    searchTerm === "" ||
    plan.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.coverageType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activePlans = filteredPlans.filter(plan => plan.isActive);
  const inactivePlans = filteredPlans.filter(plan => !plan.isActive);

  const getPlanPatients = (planId: string) => {
    return patients.filter((patient: PatientWithInsurance) => patient.insurancePlanId === planId);
  };

  const getCoverageTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "integral": return "bg-green-100 text-green-800";
      case "básico": return "bg-blue-100 text-blue-800";
      case "premium": return "bg-purple-100 text-purple-800";
      case "executivo": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Planos de Convênio</h2>
            <p className="text-muted-foreground text-sm sm:text-base">Gerenciar planos de saúde e convênios</p>
          </div>
          {(user?.userType === "Administrador" || user?.userType === "Controlador") && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90" data-testid="button-new-insurance">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Plano
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <div className="p-6">
                  <p>Formulário de plano de convênio em desenvolvimento...</p>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total de Planos</p>
                  <p className="text-2xl sm:text-3xl font-bold text-medical-text mt-1" data-testid="stat-total-plans">
                    {insurancePlans.length}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="text-medical-blue text-lg sm:text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Planos Ativos</p>
                  <p className="text-2xl sm:text-3xl font-bold text-medical-text mt-1" data-testid="stat-active-plans">
                    {activePlans.length}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="text-health-green text-lg sm:text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Pacientes com Convênio</p>
                  <p className="text-2xl sm:text-3xl font-bold text-medical-text mt-1" data-testid="stat-insured-patients">
                    {patients.filter((p: PatientWithInsurance) => p.insurancePlanId).length}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="text-purple-600 text-lg sm:text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Operadoras</p>
                  <p className="text-2xl sm:text-3xl font-bold text-medical-text mt-1" data-testid="stat-providers">
                    {new Set(insurancePlans.map(plan => plan.provider)).size}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Building className="text-orange-600 text-lg sm:text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome do plano, operadora ou tipo de cobertura..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
          </CardContent>
        </Card>

        {/* Active Insurance Plans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Planos Ativos ({activePlans.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 h-16 rounded"></div>
                ))}
              </div>
            ) : activePlans.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">
                  {searchTerm ? "Nenhum plano ativo encontrado" : "Nenhum plano ativo cadastrado"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome do Plano</TableHead>
                      <TableHead>Operadora</TableHead>
                      <TableHead>Tipo de Cobertura</TableHead>
                      <TableHead>Copagamento</TableHead>
                      <TableHead>Franquia</TableHead>
                      <TableHead>Pacientes</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activePlans.map((plan: InsurancePlan) => (
                      <TableRow key={plan.id} data-testid={`plan-row-${plan.id}`}>
                        <TableCell>
                          <div className="flex items-center">
                            <Shield className="mr-2 h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium">{plan.planName}</p>
                              <p className="text-sm text-gray-500">ID: {plan.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Building className="mr-2 h-4 w-4 text-gray-400" />
                            <span className="font-medium">{plan.provider}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCoverageTypeColor(plan.coverageType)}>
                            {plan.coverageType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {plan.copayAmount ? (
                            <div className="flex items-center">
                              <DollarSign className="mr-1 h-3 w-3 text-gray-400" />
                              <span className="text-sm">R$ {plan.copayAmount}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Não aplicável</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {plan.deductibleAmount ? (
                            <div className="flex items-center">
                              <DollarSign className="mr-1 h-3 w-3 text-gray-400" />
                              <span className="text-sm">R$ {plan.deductibleAmount}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Não aplicável</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Users className="mr-1 h-3 w-3 text-gray-400" />
                            <span className="text-sm font-medium">
                              {getPlanPatients(plan.id).length}
                            </span>
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
                              data-testid={`button-edit-${plan.id}`}
                            >
                              Editar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              data-testid={`button-patients-${plan.id}`}
                            >
                              Pacientes ({getPlanPatients(plan.id).length})
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

        {/* Inactive Plans */}
        {inactivePlans.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-gray-400" />
                Planos Inativos ({inactivePlans.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome do Plano</TableHead>
                      <TableHead>Operadora</TableHead>
                      <TableHead>Tipo de Cobertura</TableHead>
                      <TableHead>Pacientes</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inactivePlans.map((plan: InsurancePlan) => (
                      <TableRow key={plan.id} data-testid={`plan-row-${plan.id}`} className="opacity-75">
                        <TableCell>
                          <div className="flex items-center">
                            <Shield className="mr-2 h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium">{plan.planName}</p>
                              <p className="text-sm text-gray-500">ID: {plan.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Building className="mr-2 h-4 w-4 text-gray-400" />
                            <span className="font-medium">{plan.provider}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCoverageTypeColor(plan.coverageType)} variant="outline">
                            {plan.coverageType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Users className="mr-1 h-3 w-3 text-gray-400" />
                            <span className="text-sm font-medium">
                              {getPlanPatients(plan.id).length}
                            </span>
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
                              data-testid={`button-edit-${plan.id}`}
                            >
                              Editar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-health-green hover:bg-green-600 text-white border-health-green"
                              data-testid={`button-activate-${plan.id}`}
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