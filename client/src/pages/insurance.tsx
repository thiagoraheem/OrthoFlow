import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield, Plus, Search, DollarSign, Users } from "lucide-react";
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
import InsuranceForm from "@/components/forms/insurance-form";
import type { InsurancePlan } from "@shared/schema";

export default function Insurance() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: insurancePlans = [], isLoading } = useQuery({
    queryKey: ["/api/insurance"],
  });

  const { data: patients = [] } = useQuery({
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
  const providers = new Set(insurancePlans.map(p => p.provider));

  // Count patients per insurance plan
  const getPatientCount = (planId: string) => {
    return patients.filter(patient => patient.insurancePlanId === planId).length;
  };

  const formatCurrency = (amount: string | null) => {
    if (!amount) return "N/A";
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-medical-text">Insurance Plans</h2>
            <p className="text-gray-500">Manage patient insurance coverage and benefits</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-medical-blue hover:bg-blue-700" data-testid="button-new-insurance">
                <Plus className="mr-2 h-4 w-4" />
                New Insurance Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <InsuranceForm />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Plans</p>
                  <p className="text-3xl font-bold text-medical-text mt-1" data-testid="stat-total-plans">
                    {insurancePlans.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="text-medical-blue text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Active Plans</p>
                  <p className="text-3xl font-bold text-medical-text mt-1" data-testid="stat-active-plans">
                    {activePlans.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="text-health-green text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Providers</p>
                  <p className="text-3xl font-bold text-medical-text mt-1" data-testid="stat-providers">
                    {providers.size}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-purple-600 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Covered Patients</p>
                  <p className="text-3xl font-bold text-medical-text mt-1" data-testid="stat-covered-patients">
                    {patients.filter(p => p.insurancePlanId).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <Users className="text-info-blue text-xl" />
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
                placeholder="Search by plan name, provider, or coverage type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
          </CardContent>
        </Card>

        {/* Insurance Plans Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Insurance Plans ({filteredPlans.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 h-16 rounded"></div>
                ))}
              </div>
            ) : filteredPlans.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">
                  {searchTerm ? "No insurance plans found matching your search" : "No insurance plans configured"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Details</TableHead>
                    <TableHead>Coverage Type</TableHead>
                    <TableHead>Financial Terms</TableHead>
                    <TableHead>Enrolled Patients</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlans.map((plan: InsurancePlan) => (
                    <TableRow key={plan.id} data-testid={`insurance-row-${plan.id}`}>
                      <TableCell>
                        <div className="flex items-center">
                          <Shield className="mr-3 h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{plan.planName}</p>
                            <p className="text-sm text-gray-500">{plan.provider}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {plan.coverageType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <DollarSign className="mr-1 h-3 w-3 text-gray-400" />
                            <span className="text-gray-600">Copay:</span>
                            <span className="ml-1 font-medium">{formatCurrency(plan.copayAmount)}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <DollarSign className="mr-1 h-3 w-3 text-gray-400" />
                            <span className="text-gray-600">Deductible:</span>
                            <span className="ml-1 font-medium">{formatCurrency(plan.deductibleAmount)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4 text-gray-400" />
                          <span className="font-medium">{getPatientCount(plan.id)}</span>
                          <span className="ml-1 text-gray-500">patients</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={plan.isActive ? "bg-health-green text-white" : "bg-gray-400 text-white"}
                        >
                          {plan.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            data-testid={`button-edit-${plan.id}`}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            data-testid={`button-patients-${plan.id}`}
                          >
                            View Patients
                          </Button>
                          <Button 
                            size="sm" 
                            variant={plan.isActive ? "destructive" : "default"}
                            data-testid={`button-toggle-${plan.id}`}
                          >
                            {plan.isActive ? "Deactivate" : "Activate"}
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
