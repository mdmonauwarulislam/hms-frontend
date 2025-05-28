"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/providers/auth-provider"
import { apiClient } from "@/components/lib/api"
import { UserRole, type Doctor, type Hospital, type PatientEnrollment } from "@/components/lib/types"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function EditPatientPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "Male",
    doctorId: "",
    hospitalId: "",
    dateOfAdmission: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch patient details
      const patientData = await apiClient.getPatient(params.id as string)
      setFormData({
        name: patientData.name,
        age: patientData.age.toString(),
        gender: patientData.gender,
        doctorId: patientData.doctorId || "",
        hospitalId: patientData.hospitalId || "",
        dateOfAdmission: patientData.dateOfAdmission ? new Date(patientData.dateOfAdmission).toISOString().split("T")[0] : "",
      })

      if (user?.role !== UserRole.DOCTOR) {
        const [doctorsData, hospitalsData] = await Promise.all([
          apiClient.getDoctors(user?.role === UserRole.HOSPITAL_ADMIN ? user.hospitalId : undefined),
          user?.role === UserRole.SUPER_ADMIN ? apiClient.getHospitals() : Promise.resolve([]),
        ])

        setDoctors(doctorsData)
        setHospitals(hospitalsData)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
      toast.error("Failed to fetch patient details")
      router.push("/patients")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const patientData = {
        name: formData.name,
        age: Number.parseInt(formData.age),
        gender: formData.gender,
        dateOfAdmission: formData.dateOfAdmission,
        ...(user?.role !== UserRole.DOCTOR && {
          doctorId: formData.doctorId,
          hospitalId: formData.hospitalId,
        }),
      }

      await apiClient.updatePatient(params.id as string, patientData)
      toast.success("Patient updated successfully")
      router.push(`/patients/${params.id}`)
    } catch (error) {
      console.error("Failed to update patient:", error)
      toast.error("Failed to update patient")
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const newData = { ...prev, [name]: value }
      
      // If hospital is changed, filter doctors for that hospital
      if (name === "hospitalId") {
        const hospitalDoctors = doctors.filter((d) => d.hospitalId === value)
        if (hospitalDoctors.length > 0) {
          newData.doctorId = hospitalDoctors[0]._id
        } else {
          newData.doctorId = ""
        }
      }
      
      return newData
    })
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
        <div className="flex items-center space-x-4">
          <Link href={`/patients/${params.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Patient
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-emerald-900">Edit Patient</h1>
            <p className="text-slate-600">Update patient information</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>Update the patient's details below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter patient's full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Enter patient's age"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {user?.role !== UserRole.DOCTOR && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="hospitalId">Hospital</Label>
                      <Select
                        name="hospitalId"
                        value={formData.hospitalId}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, hospitalId: value }))}
                        disabled={user?.role === UserRole.HOSPITAL_ADMIN}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a hospital" />
                        </SelectTrigger>
                        <SelectContent>
                          {hospitals.map((hospital) => (
                            <SelectItem key={hospital._id} value={hospital._id}>
                              {hospital.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="doctorId">Assigned Doctor</Label>
                      <Select
                        name="doctorId"
                        value={formData.doctorId}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, doctorId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors
                            .filter((d) => !formData.hospitalId || d.hospitalId === formData.hospitalId)
                            .map((doctor) => (
                              <SelectItem key={doctor._id} value={doctor._id}>
                                {doctor.name} - {doctor.specialization}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="dateOfAdmission">Date of Admission</Label>
                  <Input
                    id="dateOfAdmission"
                    name="dateOfAdmission"
                    type="date"
                    value={formData.dateOfAdmission}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Updating..." : "Update Patient"}
                </Button>
                <Link href={`/patients/${params.id}`}>
                  <Button variant="outline">Cancel</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
} 