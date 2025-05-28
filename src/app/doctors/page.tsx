"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"
import { apiClient } from "@/components/lib/api"
import { UserRole, type Doctor, type PatientEnrollment, type Hospital } from "@/components/lib/types"
import { Plus, Pencil, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function DoctorsPage() {
  const { user } = useAuth()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [doctorPatients, setDoctorPatients] = useState<PatientEnrollment[]>([])
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [hospitalNames, setHospitalNames] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      let data
      if (user?.role === UserRole.HOSPITAL_ADMIN && user.hospitalId) {
        data = await apiClient.getDoctors(user.hospitalId)
      } else {
        data = await apiClient.getDoctors()
      }
      setDoctors(data)
      
      // Fetch hospital names for all doctors
      const hospitalIds = [...new Set(data.map(doctor => doctor.hospitalId))]
      const hospitalNamesMap: Record<string, string> = {}
      
      for (const hospitalId of hospitalIds) {
        try {
          const hospital = await apiClient.getHospital(hospitalId)
          hospitalNamesMap[hospitalId] = hospital.name
        } catch (err) {
          console.error(`Error fetching hospital ${hospitalId}:`, err)
          hospitalNamesMap[hospitalId] = 'Unknown Hospital'
        }
      }
      
      setHospitalNames(hospitalNamesMap)
    } catch (err) {
      console.error('Error fetching doctors:', err)
      toast.error("Failed to fetch doctors")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this doctor?")) return

    try {
      await apiClient.deleteDoctor(id)
      toast.success("Doctor deleted successfully")
      fetchDoctors()
    } catch (err) {
      console.error('Error deleting doctor:', err)
      toast.error("Failed to delete doctor")
    }
  }

  const handleViewDetails = async (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    try {
      const patients = await apiClient.getPatients(undefined, doctor._id)
      setDoctorPatients(patients)
      setIsViewDialogOpen(true)
    } catch (err) {
      console.error('Error fetching doctor details:', err)
      toast.error("Failed to fetch doctor's details")
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-emerald-900">Doctors</h1>
            <p className="text-slate-600">Manage doctors in your hospital</p>
          </div>
          {(user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.HOSPITAL_ADMIN) && (
            <Link href="/doctors/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Doctor
              </Button>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-8 text-slate-500">No doctors found</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <Card key={doctor._id}>
                <CardHeader>
                  <CardTitle className="text-xl">{doctor.name}</CardTitle>
                  <CardDescription>
                    <div className="space-y-1">
                      <p className="font-medium">{doctor.specialization}</p>
                      <p className="text-sm">{doctor.designation}</p>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p>Email: {doctor.email}</p>
                    <p>Hospital: {hospitalNames[doctor.hospitalId] || 'Loading...'}</p>
                    <p>Joined: {new Date(doctor.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(doctor)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Link href={`/doctors/${doctor._id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(doctor._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Doctor Details</DialogTitle>
            </DialogHeader>
            {selectedDoctor && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Personal Information</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Name:</span> {selectedDoctor.name}</p>
                      <p><span className="font-medium">Email:</span> {selectedDoctor.email}</p>
                      <p><span className="font-medium">Specialization:</span> {selectedDoctor.specialization}</p>
                      {/* <p><span className="font-medium">Designation:</span> {selectedDoctor.designation}</p> */}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Hospital Information</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Hospital:</span> {hospitalNames[selectedDoctor.hospitalId] || 'Loading...'}</p>
                      <p><span className="font-medium">Joined:</span> {new Date(selectedDoctor.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Patients ({doctorPatients.length})</h3>
                  {doctorPatients.length === 0 ? (
                    <p className="text-slate-500">No patients assigned yet</p>
                  ) : (
                    <div className="grid gap-4">
                      {doctorPatients.map((patient) => (
                        <Card key={patient._id}>
                          <CardContent className="pt-6">
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <p className="font-medium">{patient.name}</p>
                                <p className="text-sm text-slate-600">Age: {patient.age}</p>
                              </div>
                              <div>
                                <p className="text-sm text-slate-600">Gender: {patient.gender}</p>
                                {patient.dateOfAdmission && (
                                  <p className="text-sm text-slate-600">
                                    Admitted: {new Date(patient.dateOfAdmission).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <Link href={`/patients/${patient._id}`}>
                                  <Button variant="outline" size="sm">
                                    View Details
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
} 