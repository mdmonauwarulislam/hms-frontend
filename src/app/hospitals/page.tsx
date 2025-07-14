"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"
import { apiClient } from "@/components/lib/api"
import { UserRole, type Hospital } from "@/components/lib/types"
import { Building2, Plus, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/components/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function HospitalsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHospitals()
  }, [])

  const fetchHospitals = async () => {
    try {
      const data = await apiClient.getHospitals()
      setHospitals(data)
    } catch (error) {
      console.error("Failed to fetch hospitals:", error)
      toast({
        title: "Error",
        description: "Failed to fetch hospitals",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hospital?")) return

    try {
      await apiClient.deleteHospital(id)
      setHospitals(hospitals.filter((h) => h.id !== id))
      toast({
        title: "Success",
        description: "Hospital deleted successfully",
      })
    } catch (error) {
      console.error("Failed to delete hospital:", error)
      toast({
        title: "Error",
        description: "Failed to delete hospital",
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
            <h1 className="text-3xl font-bold text-emerald-900">Hospitals</h1>
            <p className="text-slate-600">Manage hospital information and settings</p>
          </div>
          {user?.role === UserRole.SUPER_ADMIN && (
            <Link href="/hospitals/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Hospital
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.map((hospital) => (
            <Card key={hospital.id} className="card-hover">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Building2 className="h-8 w-8 text-emerald-600" />
                  {user?.role === UserRole.SUPER_ADMIN && (
                    <div className="flex space-x-2">
                      <Link href={`/hospitals/${hospital.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(hospital.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <CardTitle className="text-xl">{hospital.name}</CardTitle>
                <CardDescription>{hospital.address}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-slate-600">Created: {formatDate(hospital.createdAt)}</div>
                  <Link href={`/hospitals/${hospital.id}`}>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {hospitals.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No hospitals found</h3>
              <p className="text-slate-600 text-center mb-4">
                {user?.role === UserRole.SUPER_ADMIN
                  ? "Get started by creating your first hospital."
                  : "No hospitals are available for your account."}
              </p>
              {user?.role === UserRole.SUPER_ADMIN && (
                <Link href="/hospitals/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Hospital
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
