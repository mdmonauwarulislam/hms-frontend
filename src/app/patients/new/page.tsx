"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/providers/auth-provider"
import { apiClient } from "@/lib/api"
import { UserRole, type Doctor, type Hospital } from "@/lib/types"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function NewPatientPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "Male",
    doctorId: "",
    hospitalId: "",
    dateOfAdmission: new Date().toISOString().split("T")[0],
  })
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      if (user?.role === UserRole.DOCTOR) {
        // For doctors, we don't need to fetch doctors list
        // The backend will automatically assign the patient to the logged-in doctor
        return
      }

      const [doctorsData, hospitalsData] = await Promise.all([
        apiClient.getDoctors(),
        user?.role === UserRole.SUPER_ADMIN ? apiClient.getHospitals() : Promise.resolve([]),
      ])

      setDoctors(doctorsData)
      setHospitals(hospitalsData)

      // Pre-fill hospital for hospital admin
      if (user?.role === UserRole.HOSPITAL_ADMIN && user.hospitalId) {
        setFormData((prev) => ({ ...prev, hospitalId: user.hospitalId! }))
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

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

      await apiClient.createPatient(patientData)
      toast({
        title: "Success",
        description: "Patient enrolled successfully",
      })
      router.push("/patients")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to enroll patient",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/patients">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Patients
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-emerald-900">Enroll New Patient</h1>
            <p className="text-slate-600">Add a new patient to the system</p>
          </div>
        </div>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
              <CardDescription>Enter the details for the new patient</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                    Patient Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter patient name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-slate-700 mb-1">
                      Age
                    </label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleChange}
                      required
                      placeholder="Enter age"
                      min="0"
                      max="150"
                    />
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-slate-700 mb-1">
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                      required
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {user?.role === UserRole.SUPER_ADMIN && (
                  <div>
                    <label htmlFor="hospitalId" className="block text-sm font-medium text-slate-700 mb-1">
                      Hospital
                    </label>
                    <select
                      id="hospitalId"
                      name="hospitalId"
                      value={formData.hospitalId}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                      required
                    >
                      <option value="">Select a hospital</option>
                      {hospitals.map((hospital) => (
                        <option key={hospital._id} value={hospital._id}>
                          {hospital.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {user?.role !== UserRole.DOCTOR && (
                  <div>
                    <label htmlFor="doctorId" className="block text-sm font-medium text-slate-700 mb-1">
                      Assigned Doctor
                    </label>
                    <select
                      id="doctorId"
                      name="doctorId"
                      value={formData.doctorId}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                      required
                    >
                      <option value="">Select a doctor</option>
                      {doctors.map((doctor) => (
                        <option key={doctor._id} value={doctor._id}>
                          {doctor.name} - {doctor.specialization}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label htmlFor="dateOfAdmission" className="block text-sm font-medium text-slate-700 mb-1">
                    Date of Admission
                  </label>
                  <Input
                    id="dateOfAdmission"
                    name="dateOfAdmission"
                    type="date"
                    value={formData.dateOfAdmission}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Enrolling..." : "Enroll Patient"}
                  </Button>
                  <Link href="/patients">
                    <Button variant="outline">Cancel</Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
