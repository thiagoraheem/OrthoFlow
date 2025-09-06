import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { User, Phone, Mail, Calendar, MapPin, Heart, FileText, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { PatientWithInsurance } from "@shared/schema";

interface PatientViewProps {
  patient: PatientWithInsurance;
}

export default function PatientView({ patient }: PatientViewProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Não informado";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Data inválida" : format(date, "dd/MM/yyyy", { locale: ptBR });
  };

  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return null;
    const birth = new Date(dateOfBirth);
    if (isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(patient.dateOfBirth);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="bg-primary/10 p-3 rounded-full">
          <User className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {patient.firstName} {patient.lastName}
          </h2>
          <p className="text-muted-foreground">ID: {patient.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Data de Nascimento</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(patient.dateOfBirth)}
                  {age && ` (${age} anos)`}
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Telefone</p>
                <p className="text-sm text-muted-foreground">{patient.phone}</p>
              </div>
            </div>
            
            {patient.email && (
              <>
                <Separator />
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{patient.email}</p>
                  </div>
                </div>
              </>
            )}
            
            {patient.address && (
              <>
                <Separator />
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Endereço</p>
                    <p className="text-sm text-muted-foreground">{patient.address}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Convênio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Convênio
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patient.insurancePlan ? (
              <div className="space-y-4">
                <div>
                  <Badge variant="outline" className="mb-2">
                    {patient.insurancePlan.planName}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {patient.insurancePlan.provider}
                  </p>
                </div>
                
                {patient.insuranceNumber && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium">Número da Carteirinha</p>
                      <p className="text-sm text-muted-foreground">{patient.insuranceNumber}</p>
                    </div>
                  </>
                )}
                
                {patient.insurancePlan.coverage && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium">Cobertura</p>
                      <p className="text-sm text-muted-foreground">{patient.insurancePlan.coverage}</p>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <CreditCard className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Sem convênio cadastrado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contato de Emergência */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="mr-2 h-5 w-5" />
              Contato de Emergência
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patient.emergencyContact ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Nome</p>
                  <p className="text-sm text-muted-foreground">{patient.emergencyContact}</p>
                </div>
                
                {patient.emergencyPhone && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium">Telefone</p>
                      <p className="text-sm text-muted-foreground">{patient.emergencyPhone}</p>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <Heart className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Nenhum contato de emergência cadastrado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Observações */}
        {patient.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Observações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {patient.notes}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}