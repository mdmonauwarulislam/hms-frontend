"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/providers/auth-provider"
import { apiClient } from "@/components/lib/api"
import { type PatientEnrollment } from "@/components/lib/types"
import { toast } from "sonner"

export default function NewPrescriptionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [patients, setPatients] = useState<PatientEnrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Add debug logging for user state
  useEffect(() => {
    console.log('Current user state:', user)
  }, [user])

  const patientId = searchParams.get("patientId")

  const [formData, setFormData] = useState({
    patientEnrollmentId: patientId || "",
    medication: "",
    dosage: "",
    instructions: "",
  })

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const patientsData = await apiClient.getPatients(
        user?.role === "DOCTOR" ? user.id : undefined
      )
      setPatients(patientsData)

      // If patientId is provided but not found in the list, show error
      if (patientId && !patientsData.find(p => p._id === patientId)) {
        toast.error("Selected patient not found")
        router.push("/patients/prescriptions")
      }
    } catch (error) {
      console.error("Failed to fetch patients:", error)
      toast.error("Failed to fetch patients")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      console.log('User state during submission:', user)
      
      if (!user) {
        console.error('User is not authenticated')
        throw new Error('You must be logged in to create prescriptions')
      }

      if (user.role !== 'DOCTOR') {
        console.error('User role mismatch:', user.role)
        throw new Error('Only doctors can create prescriptions')
      }

      console.log('Submitting prescription data:', {
        ...formData,
        doctorId: user.id,
      })
      
      if (!formData.patientEnrollmentId) {
        throw new Error('Patient ID is required')
      }
      
      if (!formData.medication) {
        throw new Error('Medication is required')
      }
      
      if (!formData.dosage) {
        throw new Error('Dosage is required')
      }
      
      if (!formData.instructions) {
        throw new Error('Instructions are required')
      }

      const response = await apiClient.createPrescription({
        ...formData,
        doctorId: user.id,
      })
      
      console.log('Prescription created successfully:', response)
      toast.success("Prescription created successfully")
      
      // If we came from patient details, go back there, otherwise go to prescriptions list
      if (patientId) {
        router.push(`/patients/${patientId}`)
      } else {
        router.push("/patients/prescriptions")
      }
    } catch (error) {
      console.error("Failed to create prescription:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create prescription")
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
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
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>New Prescription</CardTitle>
            <CardDescription>Create a new prescription for a patient</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="patientEnrollmentId">Patient</Label>
                <Select
                  name="patientEnrollmentId"
                  value={formData.patientEnrollmentId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, patientEnrollmentId: value }))
                  }
                  disabled={!!patientId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient._id} value={patient._id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="medication">Medication</Label>
                <Input
                  id="medication"
                  name="medication"
                  value={formData.medication}
                  onChange={handleChange}
                  placeholder="Enter medication name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  name="dosage"
                  value={formData.dosage}
                  onChange={handleChange}
                  placeholder="Enter dosage (e.g., 500mg twice daily)"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  placeholder="Enter detailed instructions for the patient"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (patientId) {
                      router.push(`/patients/${patientId}`)
                    } else {
                      router.push("/patients/prescriptions")
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Prescription"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
} 