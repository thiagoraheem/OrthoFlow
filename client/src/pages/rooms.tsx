import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DoorOpen, Plus, Search, MapPin, Package } from "lucide-react";
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
import type { ClinicRoom } from "@/types/api";
import { useAuth } from "@/contexts/AuthContext";

function Rooms() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: rooms = [], isLoading } = useQuery<ClinicRoom[]>({
    queryKey: ["/api/clinic-rooms/"],
  });

  const filteredRooms = rooms.filter((room: ClinicRoom) =>
    searchTerm === "" ||
    room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.room_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (room.equipment && room.equipment.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const availableRooms = filteredRooms.filter(room => room.is_available);
  const occupiedRooms = filteredRooms.filter(room => !room.is_available);

  const getRoomTypeColor = (type: string | undefined) => {
    if (!type) return "bg-gray-100 text-gray-800";
    switch (type.toLowerCase()) {
      case "consultório": return "bg-blue-100 text-blue-800";
      case "cirurgia": return "bg-red-100 text-red-800";
      case "exame": return "bg-green-100 text-green-800";
      case "fisioterapia": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Salas</h2>
            <p className="text-muted-foreground text-sm sm:text-base">Gerenciar salas e equipamentos da clínica</p>
          </div>
          {(user?.userType === "Administrador" || user?.userType === "Controlador") && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90" data-testid="button-new-room">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Sala
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <div className="p-6">
                  <p>Formulário de sala em desenvolvimento...</p>
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
                  <p className="text-gray-500 text-sm font-medium">Total de Salas</p>
                  <p className="text-2xl sm:text-3xl font-bold text-medical-text mt-1" data-testid="stat-total-rooms">
                    {rooms.length}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DoorOpen className="text-medical-blue text-lg sm:text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Salas Disponíveis</p>
                  <p className="text-2xl sm:text-3xl font-bold text-medical-text mt-1" data-testid="stat-available-rooms">
                    {availableRooms.length}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DoorOpen className="text-health-green text-lg sm:text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Salas Ocupadas</p>
                  <p className="text-2xl sm:text-3xl font-bold text-medical-text mt-1" data-testid="stat-occupied-rooms">
                    {occupiedRooms.length}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <DoorOpen className="text-red-600 text-lg sm:text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Taxa de Ocupação</p>
                  <p className="text-2xl sm:text-3xl font-bold text-medical-text mt-1" data-testid="stat-occupancy-rate">
                    {rooms.length > 0 ? Math.round((occupiedRooms.length / rooms.length) * 100) : 0}%
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MapPin className="text-purple-600 text-lg sm:text-xl" />
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
                placeholder="Buscar por número, tipo ou equipamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
          </CardContent>
        </Card>

        {/* Rooms Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DoorOpen className="mr-2 h-5 w-5" />
              Salas ({filteredRooms.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 h-16 rounded"></div>
                ))}
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="text-center py-8">
                <DoorOpen className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">
                  {searchTerm ? "Nenhuma sala encontrada" : "Nenhuma sala cadastrada"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número da Sala</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Capacidade</TableHead>
                      <TableHead>Equipamentos</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRooms.map((room: ClinicRoom) => (
                      <TableRow key={room.id} data-testid={`room-row-${room.id}`}>
                        <TableCell>
                          <div className="flex items-center">
                            <DoorOpen className="mr-2 h-4 w-4 text-gray-400" />
                            <span className="font-mono text-lg font-semibold">
                              {room.room_number}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoomTypeColor(room.room_type)}>
                            {room.room_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {room.capacity} {room.capacity === "1" ? "pessoa" : "pessoas"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {room.equipment ? (
                            <div className="flex items-center">
                              <Package className="mr-1 h-3 w-3 text-gray-400" />
                              <span className="text-sm truncate max-w-32" title={room.equipment}>
                                {room.equipment}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Sem equipamentos</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={room.is_available ? "bg-health-green text-white" : "bg-red-500 text-white"}>
                            {room.is_available ? "Disponível" : "Ocupada"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              data-testid={`button-edit-${room.id}`}
                            >
                              Editar
                            </Button>
                            {room.is_available ? (
                              <Button 
                                size="sm" 
                                variant="outline"
                                data-testid={`button-schedule-${room.id}`}
                              >
                                Agendar
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="bg-health-green hover:bg-green-600 text-white border-health-green"
                                data-testid={`button-free-${room.id}`}
                              >
                                Liberar
                              </Button>
                            )}
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
    </div>
  );
}

export default Rooms;