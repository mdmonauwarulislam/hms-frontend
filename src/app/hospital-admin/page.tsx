"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"
import { apiClient } from "@/components/lib/api"
import { UserRole, type User } from "@/components/lib/types"
import { UserCheck, Plus, Edit, Trash2, Building2 } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/components/lib/utils"
import { toast } from "sonner"

export default function HospitalAdminsPage() {
  const { user } = useAuth()
  const [admins, setAdmins] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  // Only Super Admin can access this page
  useEffect(() => {
    if (user && user.role !== UserRole.SUPER_ADMIN) {
      window.location.href = "/dashboard"
    }
  }, [user])

  useEffect(() => {
    fetchHospitalAdmins()
  }, [])

  const fetchHospitalAdmins = async () => {
    try {
      const data = await apiClient.getHospitalAdmins()
      setAdmins(data)
    } catch (error) {
      console.error("Failed to fetch hospital admins:", error)
      toast.error("Failed to fetch hospital admins")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hospital admin?")) return

    try {
      await apiClient.deleteHospitalAdmin(id)
      setAdmins(admins.filter((admin) => admin._id !== id))
      toast.success("Hospital admin deleted successfully")
    } catch (error) {
      console.error("Failed to delete hospital admin:", error)
      toast.error("Failed to delete hospital admin")
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
            <h1 className="text-3xl font-bold text-emerald-900">Hospital Administrators</h1>
            <p className="text-slate-600">Manage hospital administrators and their assignments</p>
          </div>
          <Link href="/hospital-admins/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Hospital Admin
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {admins.map((admin) => (
            <Card key={admin._id} className="card-hover">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <UserCheck className="h-8 w-8 text-emerald-600" />
                  <div className="flex space-x-2">
                    <Link href={`/hospital-admins/${admin._id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(admin._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-xl">{admin.name}</CardTitle>
                <CardDescription>{admin.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {admin.hospitalId && (
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-slate-500" />
                      <div>
                        <div className="font-medium text-sm">{(admin.hospitalId as any).name}</div>
                        <div className="text-xs text-slate-500">{(admin.hospitalId as any).address}</div>
                      </div>
                    </div>
                  )}
                  <div className="text-sm text-slate-600">
                    Created: {formatDate(admin.createdAt || new Date().toISOString())}
                  </div>
                  <Link href={`/hospitals/${admin.hospitalId}`}>
                    <Button variant="outline" className="w-full">
                      View Hospital
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {admins.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UserCheck className="h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No hospital administrators found</h3>
              <p className="text-slate-600 text-center mb-4">
                Get started by creating your first hospital administrator.
              </p>
              <Link href="/hospital-admins/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Hospital Admin
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
