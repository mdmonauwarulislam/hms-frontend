"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { apiClient } from "@/components/lib/api"
import { type Doctor, type Designation } from "@/components/lib/types"
import { toast } from "sonner"

interface PageProps {
  params: {
    id: string
  }
}

export default function EditDoctorPage({ params }: PageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    designation: 'General Physician' as Designation,
  })

  const fetchDoctor = useCallback(async () => {
    try {
      const data = await apiClient.getDoctor(params.id)
      setDoctor(data)
      setFormData({
        name: data.name,
        specialization: data.specialization,
        designation: data.designation,
      })
    } catch (err) {
      console.error('Error fetching doctor:', err)
      toast.error("Failed to fetch doctor details")
      router.push("/doctors")
    } finally {
      setLoading(false)
    }
  }, [params.id, router])

  useEffect(() => {
    fetchDoctor()
  }, [fetchDoctor])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await apiClient.updateDoctor(params.id, formData)
      toast.success("Doctor updated successfully")
      router.push("/doctors")
    } catch (err) {
      console.error('Error updating doctor:', err)
      toast.error("Failed to update doctor")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">Loading...</div>
      </DashboardLayout>
    )
  }

  if (!doctor) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">Doctor not found</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900">Edit Doctor</h1>
          <p className="text-slate-600">Update doctor information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Doctor Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    required
                  />
                </div>

              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/doctors")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
} 