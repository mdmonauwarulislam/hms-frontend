"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/providers/auth-provider"
import { apiClient } from "@/components/lib/api"
import { UserRole } from "@/components/lib/types"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function NewHospitalPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    licenseNumber: "",
    establishedYear: "",
    bedCapacity: "",
    emergencyContact: "",
    description: ""
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
      // Ensure all required fields are present and properly formatted
      const hospitalData = {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        website: formData.website || undefined,
        licenseNumber: formData.licenseNumber,
        establishedYear: parseInt(formData.establishedYear),
        bedCapacity: parseInt(formData.bedCapacity),
        emergencyContact: formData.emergencyContact,
        description: formData.description || undefined
      }

      // Validate required fields
      const requiredFields = [
        'name', 'address', 'phone', 'email', 'licenseNumber', 
        'emergencyContact', 'establishedYear', 'bedCapacity'
      ]
      const missingFields = requiredFields.filter(field => !hospitalData[field as keyof typeof hospitalData])
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
      }

      // Validate numeric fields
      if (isNaN(hospitalData.establishedYear) || isNaN(hospitalData.bedCapacity)) {
        throw new Error('Established year and bed capacity must be valid numbers')
      }

      await apiClient.createHospital(hospitalData)
      toast.success("Hospital created successfully")
      router.push("/hospitals")
    } catch (error: any) {
      toast.error(error.message || "Failed to create hospital")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
            <h1 className="text-3xl font-bold text-emerald-900">Add New Hospital</h1>
            <p className="text-slate-600">Create a new hospital profile with complete details</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-emerald-900 mb-4">Hospital Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                        Hospital Name *
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
                        Address *
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

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                        Phone Number *
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="Enter contact number"
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
                        placeholder="Enter hospital email"
                      />
                    </div>

                    <div>
                      <label htmlFor="website" className="block text-sm font-medium text-slate-700 mb-1">
                        Website
                      </label>
                      <Input
                        id="website"
                        name="website"
                        type="url"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="Enter hospital website"
                      />
                    </div>

                    <div>
                      <label htmlFor="licenseNumber" className="block text-sm font-medium text-slate-700 mb-1">
                        License Number *
                      </label>
                      <Input
                        id="licenseNumber"
                        name="licenseNumber"
                        type="text"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        required
                        placeholder="Enter hospital license number"
                      />
                    </div>

                    <div>
                      <label htmlFor="establishedYear" className="block text-sm font-medium text-slate-700 mb-1">
                        Established Year *
                      </label>
                      <Input
                        id="establishedYear"
                        name="establishedYear"
                        type="number"
                        min="1800"
                        max={new Date().getFullYear()}
                        value={formData.establishedYear}
                        onChange={handleChange}
                        required
                        placeholder="Enter year of establishment"
                      />
                    </div>

                    <div>
                      <label htmlFor="bedCapacity" className="block text-sm font-medium text-slate-700 mb-1">
                        Bed Capacity *
                      </label>
                      <Input
                        id="bedCapacity"
                        name="bedCapacity"
                        type="number"
                        min="1"
                        value={formData.bedCapacity}
                        onChange={handleChange}
                        required
                        placeholder="Enter total bed capacity"
                      />
                    </div>

                    <div>
                      <label htmlFor="emergencyContact" className="block text-sm font-medium text-slate-700 mb-1">
                        Emergency Contact *
                      </label>
                      <Input
                        id="emergencyContact"
                        name="emergencyContact"
                        type="tel"
                        value={formData.emergencyContact}
                        onChange={handleChange}
                        required
                        placeholder="Enter emergency contact number"
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                        placeholder="Enter hospital description"
                      />
                    </div>
                  </div>
                </div>
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
    </DashboardLayout>
  )
}
