import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DoorOpen, Plus, Search, Users, Settings } from "lucide-react";
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
import RoomForm from "@/components/forms/room-form";
import type { ClinicRoom } from "@shared/schema";

export default function Rooms() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ["/api/rooms"],
  });

  const filteredRooms = rooms.filter((room: ClinicRoom) =>
    searchTerm === "" ||
    room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.roomType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.capacity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (room.equipment && room.equipment.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const availableRooms = filteredRooms.filter(room => room.isAvailable);
  const occupiedRooms = filteredRooms.filter(room => !room.isAvailable);
  const roomTypes = new Set(rooms.map(r => r.roomType));

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-medical-text">Clinic Rooms</h2>
            <p className="text-gray-500">Manage facility rooms and availability</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-medical-blue hover:bg-blue-700" data-testid="button-new-room">
                <Plus className="mr-2 h-4 w-4" />
                New Room
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <RoomForm />
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
                  <p className="text-gray-500 text-sm font-medium">Total Rooms</p>
                  <p className="text-3xl font-bold text-medical-text mt-1" data-testid="stat-total-rooms">
                    {rooms.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DoorOpen className="text-medical-blue text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Available Rooms</p>
                  <p className="text-3xl font-bold text-medical-text mt-1" data-testid="stat-available-rooms">
                    {availableRooms.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DoorOpen className="text-health-green text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Occupied Rooms</p>
                  <p className="text-3xl font-bold text-medical-text mt-1" data-testid="stat-occupied-rooms">
                    {occupiedRooms.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Users className="text-red-600 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Room Types</p>
                  <p className="text-3xl font-bold text-medical-text mt-1" data-testid="stat-room-types">
                    {roomTypes.size}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Settings className="text-purple-600 text-xl" />
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
                placeholder="Search by room number, type, capacity, or equipment..."
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
              Clinic Rooms ({filteredRooms.length})
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
                  {searchTerm ? "No rooms found matching your search" : "No rooms configured"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRooms.map((room: ClinicRoom) => (
                    <TableRow key={room.id} data-testid={`room-row-${room.id}`}>
                      <TableCell>
                        <div className="flex items-center">
                          <DoorOpen className="mr-3 h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-lg">Room {room.roomNumber}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {room.roomType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4 text-gray-400" />
                          {room.capacity}
                        </div>
                      </TableCell>
                      <TableCell>
                        {room.equipment ? (
                          <div className="max-w-xs">
                            <p className="text-sm text-gray-600 truncate" title={room.equipment}>
                              {room.equipment}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400">No equipment listed</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={room.isAvailable ? "bg-health-green text-white" : "bg-red-500 text-white"}
                        >
                          {room.isAvailable ? "Available" : "Occupied"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            data-testid={`button-edit-${room.id}`}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            data-testid={`button-schedule-${room.id}`}
                          >
                            Schedule
                          </Button>
                          <Button 
                            size="sm" 
                            variant={room.isAvailable ? "destructive" : "default"}
                            data-testid={`button-toggle-${room.id}`}
                          >
                            {room.isAvailable ? "Set Occupied" : "Set Available"}
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
