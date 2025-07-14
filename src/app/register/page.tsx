"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2 } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/components/lib/api"
import { UserRole, type Hospital } from "@/components/lib/types"
import { useAuth } from "@/components/providers/auth-provider"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: UserRole.DOCTOR,
    hospitalId: "",
    specialization: "",
  })
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  useEffect(() => {
    // Fetch hospitals for selection
    const fetchHospitals = async () => {
      try {
        const hospitalData = await apiClient.getHospitals()
        setHospitals(hospitalData)
      } catch (err) {
        console.error("Failed to fetch hospitals:", err)
      }
    }

    fetchHospitals()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await apiClient.register(formData)
      router.push("/login?message=Registration successful")
    } catch (err: any) {
      setError(err.message || "Registration failed")
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
    <div className="min-h-screen gradient-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-emerald-600" />
          <h2 className="mt-6 text-3xl font-bold text-emerald-900">Create Account</h2>
          <p className="mt-2 text-sm text-slate-600">Register for the Hospital Management System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>Create your account to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  required
                >
                  <option value={UserRole.DOCTOR}>Doctor</option>
                  <option value={UserRole.HOSPITAL_ADMIN}>Hospital Admin</option>
                  <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                </select>
              </div>

              {(formData.role === UserRole.HOSPITAL_ADMIN || formData.role === UserRole.DOCTOR) && (
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

              {formData.role === UserRole.DOCTOR && (
                <div>
                  <label htmlFor="specialization" className="block text-sm font-medium text-slate-700 mb-1">
                    Specialization
                  </label>
                  <Input
                    id="specialization"
                    name="specialization"
                    type="text"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                    placeholder="Enter your specialization"
                  />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Already have an account?{" "}
                <Link href="/login" className="text-emerald-600 hover:text-emerald-500 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
