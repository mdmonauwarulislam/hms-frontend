"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/components/lib/api"
import type { PatientEnrollment, Prescription } from "@/components/lib/types"
import { User, Calendar, FileText, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/components/lib/utils"
import { toast } from "sonner"
import { useParams } from "next/navigation"

export default function PatientDetailsPage() {
  const params = useParams()
  const [patient, setPatient] = useState<PatientEnrollment | null>(null)
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [doctorName, setDoctorName] = useState<string | null>(null)
  const [hospitalName, setHospitalName] = useState<string | null>(null)


  useEffect(() => {
    if (params.id) {
      fetchPatientDetails()
      fetchPrescriptions()
    }
  }, [params.id])

  const fetchPatientDetails = async () => {
    try {
      const data = await apiClient.getPatient(params.id as string)
      setPatient(data)
      

      if (data.doctorId) {
        try {
          const doctor = await apiClient.getDoctor(data.doctorId)
          setDoctorName(doctor.name)
         
        } catch (error) {
          console.error("Failed to fetch doctor details:", error)
          toast.error("Failed to fetch doctor details")
        }
      }

      if (data.hospitalId) {
        try {
          
          const hospital = await apiClient.getHospital(data.hospitalId)
          setHospitalName(hospital.name)
        } catch (error) {
          console.error("Failed to fetch hospital details:", error)
          toast.error("Failed to fetch hospital details")
        }
      }
    } catch (error) {
      console.error("Failed to fetch patient details:", error)
      toast.error("Failed to fetch patient details")
    } finally {
      setLoading(false)
    }
  }


  const fetchPrescriptions = async () => {
    try {
      const data = await apiClient.getPrescriptions(params.id as string)
      setPrescriptions(data)
    } catch (error) {
      console.error("Failed to fetch prescriptions:", error)
      toast.error("Failed to fetch prescriptions")
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

  if (!patient) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Patient not found</h3>
            <Link href="/patients">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Patients
              </Button>
            </Link>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Link href="/patients" className="text-emerald-600 hover:text-emerald-700 mb-2 inline-flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Patients
            </Link>
            <h1 className="text-3xl font-bold text-emerald-900">{patient.name}</h1>
            <p className="text-slate-600">Patient Details and Medical Records</p>
          </div>
          <div className="flex space-x-2">
            <Link href={`/patients/${patient._id}/edit`}>
              <Button variant="outline">Edit Patient</Button>
            </Link>
            <Link href={`/patients/prescriptions/new?patientId=${patient._id}`}>
              <Button>Add Prescription</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Age</p>
                  <p className="font-medium">{patient.age} years</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Gender</p>
                  <p className="font-medium">{patient.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Date of Admission</p>
                  <p className="font-medium">{patient.dateOfAdmission ? formatDate(patient.dateOfAdmission) : 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              <div>
                <p className="text-sm text-slate-600">Doctor</p>
                <p className="font-medium">{doctorName || 'Not assigned'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Hospital</p>
                <p className="font-medium">{hospitalName || 'Not assigned'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Prescriptions</CardTitle>
            <CardDescription>Recent medical prescriptions and treatments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prescriptions.map((prescription) => (
                <Card key={prescription._id} className="border border-slate-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-emerald-600" />
                          <h4 className="font-medium">Prescription #{prescription._id}</h4>
                        </div>
                        <p className="text-sm text-slate-600">{prescription.medication}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(prescription.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h5 className="text-sm font-medium mb-2">Dosage:</h5>
                      <p className="text-sm text-slate-600">{prescription.dosage}</p>
                    </div>
                    {prescription.instructions && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium mb-2">Notes:</h5>
                        <p className="text-sm text-slate-600">{prescription.instructions}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {prescriptions.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No prescriptions found</h3>
                  <p className="text-slate-600 mb-4">Add a new prescription to start recording treatments.</p>
                  <Link href={`/patients/prescriptions/new?patientId=${patient._id}`}>
                    <Button>
                      Add Prescription
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
} 