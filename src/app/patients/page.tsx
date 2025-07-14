"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"
import { apiClient } from "@/components/lib/api"
import type { PatientEnrollment } from "@/components/lib/types"
import { User, Plus, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/components/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function PatientsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [patients, setPatients] = useState<PatientEnrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const data = await apiClient.getPatients()
      setPatients(data)
    } catch (error) {
      console.error("Failed to fetch patients:", error)
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this patient?")) return

    try {
      await apiClient.deletePatient(id)
      setPatients(patients.filter((p) => p.id !== id))
      toast({
        title: "Success",
        description: "Patient deleted successfully",
      })
    } catch (error) {
      console.error("Failed to delete patient:", error)
      toast({
        title: "Error",
        description: "Failed to delete patient",
        variant: "destructive",
      })
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-emerald-900">Patients</h1>
            <p className="text-slate-600">Manage patient enrollments and information</p>
          </div>
          <Link href="/patients/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((patient) => (
            <Card key={patient.id} className="card-hover">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <User className="h-8 w-8 text-emerald-600" />
                  <div className="flex space-x-2">
                    <Link href={`/patients/${patient.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(patient.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-xl">{patient.name}</CardTitle>
                <CardDescription>
                  {patient.age} years old • {patient.gender}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-slate-600">Admitted: {patient.dateOfAdmission ? formatDate(patient.dateOfAdmission) : 'N/A'}</div>
                  <div className="flex space-x-2">
                    <Link href={`/patients/${patient.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/prescriptions/new?patientId=${patient.id}`}>
                      <Button size="sm">Add Prescription</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {patients.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No patients found</h3>
              <p className="text-slate-600 text-center mb-4">Get started by enrolling your first patient.</p>
              <Link href="/patients/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Patient
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
