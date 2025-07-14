"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/providers/auth-provider"
import { apiClient } from "@/components/lib/api"
import { UserRole, type Hospital, type Doctor, type PatientEnrollment, type Prescription } from "@/components/lib/types"
import { Building2, Users, User, Pill } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    hospitals: 0,
    doctors: 0,
    patients: 0,
    prescriptions: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const promises = []

        // Fetch data based on user role
        if (user?.role === UserRole.SUPER_ADMIN) {
          promises.push(
            apiClient.getHospitals(),
            apiClient.getDoctors(),
            apiClient.getPatients(),
            apiClient.getPrescriptions(),
          )
        } else if (user?.role === UserRole.HOSPITAL_ADMIN) {
          promises.push(
            apiClient.getHospitals(), // Will return only user's hospital
            apiClient.getDoctors(),
            apiClient.getPatients(),
            apiClient.getPrescriptions(),
          )
        } else if (user?.role === UserRole.DOCTOR) {
          promises.push(
            Promise.resolve([]), // No hospitals for doctors
            Promise.resolve([]), // No doctors list for doctors
            apiClient.getPatients(),
            apiClient.getPrescriptions(),
          )
        }

        const [hospitals, doctors, patients, prescriptions] = await Promise.all(promises)

        setStats({
          hospitals: (hospitals as Hospital[]).length,
          doctors: (doctors as Doctor[]).length,
          patients: (patients as PatientEnrollment[]).length,
          prescriptions: (prescriptions as Prescription[]).length,
        })
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchStats()
    }
  }, [user])

  const getStatsCards = () => {
    const cards = []

    if (user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.HOSPITAL_ADMIN) {
      cards.push({
        title: "Hospitals",
        value: stats.hospitals,
        description: user.role === UserRole.SUPER_ADMIN ? "Total hospitals" : "Your hospital",
        icon: Building2,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
      })

      cards.push({
        title: "Doctors",
        value: stats.doctors,
        description: "Active doctors",
        icon: Users,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      })
    }

    cards.push({
      title: "Patients",
      value: stats.patients,
      description: user?.role === UserRole.DOCTOR ? "Your patients" : "Total patients",
      icon: User,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    })

    cards.push({
      title: "Prescriptions",
      value: stats.prescriptions,
      description: user?.role === UserRole.DOCTOR ? "Your prescriptions" : "Total prescriptions",
      icon: Pill,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    })

    return cards
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
        <div>
          <h1 className="text-3xl font-bold text-emerald-900">Dashboard</h1>
          <p className="text-slate-600">
            Welcome back, {user?.name}! Heres an overview of your {user?.role.replace("_", " ").toLowerCase()}{" "}
            dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getStatsCards().map((card, index) => {
            const Icon = card.icon
            return (
              <Card key={index} className="card-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <div className={`p-2 rounded-md ${card.bgColor}`}>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-slate-500">{card.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks for your role</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {user?.role === UserRole.SUPER_ADMIN && (
                <>
                  <a
                    href="/hospitals/new"
                    className="block p-3 rounded-md bg-emerald-50 hover:bg-emerald-100 transition-colors"
                  >
                    <div className="font-medium text-emerald-900">Create New Hospital</div>
                    <div className="text-sm text-emerald-600">Add a new hospital to the system</div>
                  </a>
                  <a
                    href="/doctors/new"
                    className="block p-3 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <div className="font-medium text-blue-900">Add New Doctor</div>
                    <div className="text-sm text-blue-600">Register a new doctor</div>
                  </a>
                </>
              )}
              {(user?.role === UserRole.HOSPITAL_ADMIN || user?.role === UserRole.SUPER_ADMIN) && (
                <a href="/doctors/new" className="block p-3 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors">
                  <div className="font-medium text-blue-900">Add New Doctor</div>
                  <div className="text-sm text-blue-600">Register a new doctor to your hospital</div>
                </a>
              )}
              <a
                href="/patients/new"
                className="block p-3 rounded-md bg-purple-50 hover:bg-purple-100 transition-colors"
              >
                <div className="font-medium text-purple-900">Enroll New Patient</div>
                <div className="text-sm text-purple-600">Add a new patient enrollment</div>
              </a>
              <a
                href="/prescriptions/new"
                className="block p-3 rounded-md bg-orange-50 hover:bg-orange-100 transition-colors"
              >
                <div className="font-medium text-orange-900">Create Prescription</div>
                <div className="text-sm text-orange-600">Add a new prescription for a patient</div>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>Your account and system details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-slate-700">Role</div>
                <div className="text-lg text-emerald-600">{user?.role.replace("_", " ")}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-700">Email</div>
                <div className="text-sm text-slate-600">{user?.email}</div>
              </div>
              {user?.hospitalId && (
                <div>
                  <div className="text-sm font-medium text-slate-700">Hospital Access</div>
                  <div className="text-sm text-slate-600">Limited to assigned hospital</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
