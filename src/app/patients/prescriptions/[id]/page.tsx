"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"
import { apiClient } from "@/components/lib/api"
import { type Prescription, type PatientEnrollment } from "@/components/lib/types"
import { Edit, ArrowLeft, Pill } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/components/lib/utils"
import { toast } from "sonner"

export default function PrescriptionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { user } = useAuth()
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [patient, setPatient] = useState<PatientEnrollment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      const prescriptionData = await apiClient.getPrescription(id)
      setPrescription(prescriptionData)

      if (prescriptionData.patientEnrollmentId) {
        const patientData = await apiClient.getPatient(prescriptionData.patientEnrollmentId)
        setPatient(patientData)
      }
    } catch (error) {
      console.error("Failed to fetch prescription:", error)
      toast.error("Failed to fetch prescription details")
      router.push("/patients/prescriptions")
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

  if (!prescription) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Pill className="h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Prescription not found</h3>
            <p className="text-slate-600 text-center mb-4">
              The prescription you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
            </p>
            <Button onClick={() => router.push("/patients/prescriptions")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Prescriptions
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => router.push("/patients/prescriptions")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Prescriptions
          </Button>
          {user?.role === "DOCTOR" && (
            <Link href={`/patients/prescriptions/${prescription._id}/edit`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Prescription
              </Button>
            </Link>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Prescription Details</CardTitle>
            <CardDescription>
              Prescribed on {formatDate(prescription.createdAt)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-500">Patient</h3>
                <p className="text-lg">{patient?.name || "Unknown Patient"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500">Medication</h3>
                <p className="text-lg">{prescription.medication}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500">Dosage</h3>
                <p className="text-lg">{prescription.dosage}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500">Instructions</h3>
                <p className="text-lg whitespace-pre-wrap">{prescription.instructions}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500">Prescribed By</h3>
                <p className="text-lg">{prescription.doctorId || "Unknown Doctor"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
} 