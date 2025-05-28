"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"
import { apiClient } from "@/components/lib/api"
import { type Prescription, type PatientEnrollment } from "@/components/lib/types"
import { Plus, Edit, Trash2, Pill } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/components/lib/utils"
import { toast } from "sonner"

export default function PrescriptionsPage() {
  const { user } = useAuth()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [patients, setPatients] = useState<PatientEnrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [prescriptionsData, patientsData] = await Promise.all([
        apiClient.getPrescriptions(user?.role === UserRole.DOCTOR ? user.id : undefined),
        apiClient.getPatientEnrollments(user?.role === UserRole.DOCTOR ? user.id : undefined),
      ])

      setPrescriptions(prescriptionsData)
      setPatients(patientsData)
    } catch (error) {
      console.error("Failed to fetch data:", error)
      toast.error("Failed to fetch prescriptions")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this prescription?")) return

    try {
      await apiClient.deletePrescription(id)
      setPrescriptions(prescriptions.filter((p) => p._id !== id))
      toast.success("Prescription deleted successfully")
    } catch (error) {
      console.error("Failed to delete prescription:", error)
      toast.error("Failed to delete prescription")
    }
  }

  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p._id === patientId)
    return patient?.name || "Unknown Patient"
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
            <h1 className="text-3xl font-bold text-emerald-900">Prescriptions</h1>
            <p className="text-slate-600">Manage patient prescriptions and medications</p>
          </div>
          {user?.role === UserRole.DOCTOR && (
            <Link href="/patients/prescriptions/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Prescription
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prescriptions.map((prescription) => (
            <Card key={prescription._id} className="card-hover">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Pill className="h-8 w-8 text-emerald-600" />
                  {user?.role === UserRole.DOCTOR && (
                    <div className="flex space-x-2">
                      <Link href={`/patients/prescriptions/${prescription._id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(prescription._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <CardTitle className="text-xl">{getPatientName(prescription.patientEnrollmentId)}</CardTitle>
                <CardDescription>
                  <div className="space-y-1">
                    <div className="font-medium">{prescription.medication}</div>
                    <div className="text-sm text-slate-500">Dosage: {prescription.dosage}</div>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-slate-600">
                    Instructions: {prescription.instructions}
                  </div>
                  <div className="text-sm text-slate-600">
                    Prescribed: {formatDate(prescription.createdAt)}
                  </div>
                  <Link href={`/patients/prescriptions/${prescription._id}`}>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {prescriptions.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Pill className="h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No prescriptions found</h3>
              <p className="text-slate-600 text-center mb-4">
                {user?.role === UserRole.DOCTOR
                  ? "Get started by adding your first prescription."
                  : "No prescriptions are available for your account."}
              </p>
              {user?.role === UserRole.DOCTOR && (
                <Link href="/patients/prescriptions/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Prescription
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
} 