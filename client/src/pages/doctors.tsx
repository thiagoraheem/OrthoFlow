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

export default function Doctors() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ["/api/doctors"],
  });

  const filteredDoctors = doctors.filter((doctor: Doctor) =>
    searchTerm === "" ||
    doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.phone.includes(searchTerm) ||
    doctor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeDoctors = filteredDoctors.filter(doctor => doctor.isActive);
  const inactiveDoctors = filteredDoctors.filter(doctor => !doctor.isActive);

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-medical-text">Doctors</h2>
            <p className="text-gray-500">Manage medical staff and specialties</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-medical-blue hover:bg-blue-700" data-testid="button-new-doctor">
                <Plus className="mr-2 h-4 w-4" />
                New Doctor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DoctorForm />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Doctors</p>
                  <p className="text-3xl font-bold text-medical-text mt-1" data-testid="stat-total-doctors">
                    {doctors.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="text-medical-blue text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Active Doctors</p>
                  <p className="text-3xl font-bold text-medical-text mt-1" data-testid="stat-active-doctors">
                    {activeDoctors.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Stethoscope className="text-health-green text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Specialties</p>
                  <p className="text-3xl font-bold text-medical-text mt-1" data-testid="stat-specialties">
                    {new Set(doctors.map(d => d.specialty)).size}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="text-purple-600 text-xl" />
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
                placeholder="Search by name, specialty, license, or contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
          </CardContent>
        </Card>

        {/* Doctors Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="mr-2 h-5 w-5" />
              Medical Staff ({filteredDoctors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 h-16 rounded"></div>
                ))}
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="text-center py-8">
                <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">
                  {searchTerm ? "No doctors found matching your search" : "No doctors registered"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name & Specialty</TableHead>
                    <TableHead>License Number</TableHead>
                    <TableHead>Contact Information</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDoctors.map((doctor: Doctor) => (
                    <TableRow key={doctor.id} data-testid={`doctor-row-${doctor.id}`}>
                      <TableCell>
                        <div className="flex items-center">
                          <Stethoscope className="mr-3 h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium">
                              Dr. {doctor.firstName} {doctor.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{doctor.specialty}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{doctor.licenseNumber}</span>
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
                        <Badge 
                          className={doctor.isActive ? "bg-health-green text-white" : "bg-gray-400 text-white"}
                        >
                          {doctor.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            data-testid={`button-edit-${doctor.id}`}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            data-testid={`button-schedule-${doctor.id}`}
                          >
                            Schedule
                          </Button>
                          <Button 
                            size="sm" 
                            variant={doctor.isActive ? "destructive" : "default"}
                            data-testid={`button-toggle-${doctor.id}`}
                          >
                            {doctor.isActive ? "Deactivate" : "Activate"}
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
