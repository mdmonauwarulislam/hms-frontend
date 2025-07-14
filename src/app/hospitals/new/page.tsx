"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/providers/auth-provider"
import { apiClient } from "@/components/lib/api"
import { UserRole } from "@/components/lib/types"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function NewHospitalPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    address: "",
  })
  const [loading, setLoading] = useState(false)

  // Redirect if not super admin
  if (user?.role !== UserRole.SUPER_ADMIN) {
    router.push("/dashboard")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await apiClient.createHospital(formData)
      toast({
        title: "Success",
        description: "Hospital created successfully",
      })
      router.push("/hospitals")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create hospital",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/hospitals">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Hospitals
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-emerald-900">Create New Hospital</h1>
            <p className="text-slate-600">Add a new hospital to the system</p>
          </div>
        </div>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Hospital Information</CardTitle>
              <CardDescription>Enter the details for the new hospital</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                    Hospital Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter hospital name"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">
                    Address
                  </label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    placeholder="Enter hospital address"
                  />
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Hospital"}
                  </Button>
                  <Link href="/hospitals">
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
