"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/providers/auth-provider"
import { apiClient } from "@/components/lib/api"
import { UserRole, type Hospital } from "@/components/lib/types"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function NewDoctorPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    hospitalId: ""
  })

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const data = await apiClient.getHospitals()
        setHospitals(data)
        
        // If user is hospital admin, set their hospital ID
        if (user?.role === UserRole.HOSPITAL_ADMIN && user.hospitalId) {
          setFormData(prev => ({ ...prev, hospitalId: user.hospitalId || "" }))
        }
      } catch {
        toast.error("Failed to fetch hospitals")
      }
    }

    fetchHospitals()
  }, [user])

  // Redirect if not authorized
  useEffect(() => {
    if (user?.role !== UserRole.SUPER_ADMIN && user?.role !== UserRole.HOSPITAL_ADMIN) {
      router.push("/dashboard")
    }
  }, [user, router])

  if (user?.role !== UserRole.SUPER_ADMIN && user?.role !== UserRole.HOSPITAL_ADMIN) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate required fields
      const requiredFields = ['name', 'email', 'password', 'specialization', 'hospitalId']
      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData])
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
      }

      await apiClient.createDoctor(formData)
      toast.success("Doctor created successfully")
      router.push("/doctors")
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create doctor"
      toast.error(errorMessage)
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

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      hospitalId: value,
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/doctors">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Doctors
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-emerald-900">Add New Doctor</h1>
            <p className="text-slate-600">Create a new doctor profile with complete details</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter doctor's full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                    Email *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter doctor's email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                    Password *
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter doctor's password"
                  />
                </div>

                <div>
                  <label htmlFor="specialization" className="block text-sm font-medium text-slate-700 mb-1">
                    Specialization *
                  </label>
                  <Input
                    id="specialization"
                    name="specialization"
                    type="text"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                    placeholder="Enter doctor's specialization"
                  />
                </div>

                {user?.role === UserRole.SUPER_ADMIN && (
                  <div>
                    <label htmlFor="hospitalId" className="block text-sm font-medium text-slate-700 mb-1">
                      Hospital *
                    </label>
                    <Select
                      value={formData.hospitalId}
                      onValueChange={handleSelectChange}
                      required
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
                )}
              </div>

              <div className="flex space-x-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Doctor"}
                </Button>
                <Link href="/doctors">
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