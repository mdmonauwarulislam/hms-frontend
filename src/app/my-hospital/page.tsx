"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"
import { apiClient } from "@/components/lib/api"
import { UserRole, type Hospital, type Doctor, type PatientEnrollment } from "@/components/lib/types"
import { Building2, Users, User, Pill, MapPin, Calendar, Plus } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/components/lib/utils"
import { toast } from "sonner"

interface HospitalDetails {
  hospital: Hospital
  statistics: {
    doctors: number
    patients: number
    prescriptions: number
  }
  recentDoctors: Doctor[]
  recentPatients: PatientEnrollment[]
}

export default function MyHospitalPage() {
  const { user } = useAuth()
 
  const [hospitalDetails, setHospitalDetails] = useState<HospitalDetails | null>(null)
  const [loading, setLoading] = useState(true)

  // Only Hospital Admin can access this page
  useEffect(() => {
    if (user && user.role !== UserRole.HOSPITAL_ADMIN) {
      window.location.href = "/dashboard"
    }
  }, [user])

  useEffect(() => {
    fetchHospitalDetails()
  }, [])

  const fetchHospitalDetails = async () => {
    try {
      const data = await apiClient.getMyHospital()
      setHospitalDetails(data)
    } catch (error) {
      console.error("Failed to fetch hospital details:", error)
      toast.error("Failed to fetch hospital details")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!hospitalDetails) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No hospital assigned</h3>
          <p className="text-slate-600">Please contact the system administrator to assign you to a hospital.</p>
        </div>
      </DashboardLayout>
    )
  }

  const { hospital, statistics, recentDoctors, recentPatients } = hospitalDetails

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hospital Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{hospital.name}</h1>
              <div className="flex items-center mt-2">
                <MapPin className="h-4 w-4 mr-2" />
                <p className="text-emerald-100">{hospital.address}</p>
              </div>
              <div className="flex items-center mt-1">
                <Calendar className="h-4 w-4 mr-2" />
                <p className="text-emerald-100">Established: {formatDate(hospital.createdAt)}</p>
              </div>
            </div>
            <Building2 className="h-16 w-16 text-emerald-200" />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.doctors}</div>
              <p className="text-xs text-slate-500">Active medical staff</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <User className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.patients}</div>
              <p className="text-xs text-slate-500">Enrolled patients</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Prescriptions</CardTitle>
              <Pill className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.prescriptions}</div>
              <p className="text-xs text-slate-500">Medical prescriptions</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your hospital operations</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/doctors/new">
              <Button variant="outline" className="w-full h-20 flex flex-col">
                <Plus className="h-6 w-6 mb-2" />
                Add Doctor
              </Button>
            </Link>
            <Link href="/patients/new">
              <Button variant="outline" className="w-full h-20 flex flex-col">
                <Plus className="h-6 w-6 mb-2" />
                Enroll Patient
              </Button>
            </Link>
            <Link href="/doctors">
              <Button variant="outline" className="w-full h-20 flex flex-col">
                <Users className="h-6 w-6 mb-2" />
                View Doctors
              </Button>
            </Link>
            <Link href="/patients">
              <Button variant="outline" className="w-full h-20 flex flex-col">
                <User className="h-6 w-6 mb-2" />
                View Patients
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Doctors */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Doctors</CardTitle>
                <CardDescription>Latest doctor additions</CardDescription>
              </div>
              <Link href="/doctors">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDoctors.length > 0 ? (
                  recentDoctors.map((doctor) => (
                    <div key={doctor._id} className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{doctor.name}</p>
                        <p className="text-sm text-slate-500">{doctor.specialization}</p>
                      </div>
                      <div className="text-xs text-slate-400">{formatDate(doctor.createdAt)}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-4">No doctors added yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Patients */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Patients</CardTitle>
                <CardDescription>Latest patient enrollments</CardDescription>
              </div>
              <Link href="/patients">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPatients.length > 0 ? (
                  recentPatients.map((patient) => (
                    <div key={patient._id} className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-slate-500">
                          {patient.age} years • {(patient.doctorId as any)?.name}
                        </p>
                      </div>
                      <div className="text-xs text-slate-400">{formatDate(patient.dateOfAdmission)}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-4">No patients enrolled yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
