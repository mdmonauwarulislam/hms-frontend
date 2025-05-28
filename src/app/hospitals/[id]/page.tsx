"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"
import { apiClient } from "@/components/lib/api"
import { UserRole, type Hospital, type User, type Doctor } from "@/components/lib/types"
import { Building2, MapPin, Phone, Mail, Globe, Calendar, UserPlus } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface HospitalDetails {
  hospital: Hospital
  statistics: {
    doctors: number
    patients: number
    prescriptions: number
  }
  admins: User[]
}

export default function HospitalDetailsPage() {
  const params = useParams()
  const { user } = useAuth()
  const [hospitalDetails, setHospitalDetails] = useState<HospitalDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [newAdminEmail, setNewAdminEmail] = useState("")
  const [newAdminPassword, setNewAdminPassword] = useState("")
  const [newAdminName, setNewAdminName] = useState("")
  const [isAssigningAdmin, setIsAssigningAdmin] = useState(false)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null)
  const [isDeletingAdmin, setIsDeletingAdmin] = useState(false)

  const fetchHospitalDetails = useCallback(async () => {
    try {
      // First get the basic hospital info
      const hospital = await apiClient.getHospital(params.id as string)
      
      // Then get the statistics and admins
      const [doctors, patients, prescriptions] = await Promise.all([
        apiClient.getDoctors(params.id as string),
        apiClient.getPatients(params.id as string),
        apiClient.getPrescriptions(undefined, params.id as string)
      ])

      const hospitalDetails: HospitalDetails = {
        hospital,
        statistics: {
          doctors: doctors.length,
          patients: patients.length,
          prescriptions: prescriptions.length
        },
        admins: []
      }

      setHospitalDetails(hospitalDetails)
    } catch (error) {
      console.error("Failed to fetch hospital details:", error)
      toast.error("Failed to fetch hospital details")
      setHospitalDetails(null)
    } finally {
      setLoading(false)
    }
  }, [params.id])

  const fetchHospitalDoctors = useCallback(async () => {
    try {
      const response = await apiClient.getDoctors(params.id as string)
      console.log('Doctors response:', response) // Debug log
      setDoctors(response)
    } catch (error) {
      console.error("Failed to fetch hospital doctors:", error)
      toast.error("Failed to fetch hospital doctors")
    }
  }, [params.id])

  const fetchHospitalAdmins = useCallback(async () => {
    try {
      console.log('Starting to fetch hospital admins...') // Debug log
      const response = await apiClient.getHospitalAdmins()
      console.log('Raw API response:', response) // Debug log
      
      if (!Array.isArray(response)) {
        console.error('Invalid response format:', response)
        toast.error("Invalid response format from server")
        return
      }

      // Filter admins for this hospital
      const hospitalAdmins = response.filter(admin => {
        console.log('Checking admin:', admin) // Debug log for each admin
        return admin.hospitalId === params.id
      })
      console.log('Filtered hospital admins:', hospitalAdmins) // Debug log
      
      // Update the hospital details with the admins
      setHospitalDetails(prev => {
        if (!prev) {
          console.log('No previous hospital details found') // Debug log
          return null
        }
        console.log('Updating hospital details with admins:', hospitalAdmins) // Debug log
        return {
          ...prev,
          admins: hospitalAdmins
        }
      })
    } catch (error) {
      console.error("Failed to fetch hospital admins:", error)
      if (error instanceof Error) {
        console.error("Error details:", error.message)
        toast.error(`Failed to fetch hospital admins: ${error.message}`)
      } else {
        toast.error("Failed to fetch hospital admins")
      }
    }
  }, [params.id])

  useEffect(() => {
    fetchHospitalDetails()
    if (user?.role === UserRole.SUPER_ADMIN) {
      fetchHospitalAdmins()
    }
    fetchHospitalDoctors()
  }, [params.id, user?.role, fetchHospitalDetails, fetchHospitalAdmins, fetchHospitalDoctors])

  const handleAssignAdmin = async () => {
    if (!newAdminEmail || !newAdminPassword || !newAdminName) {
      toast.error("Please fill in all fields")
      return
    }

    setIsAssigningAdmin(true)
    try {
      console.log('Creating new admin with data:', {
        name: newAdminName,
        email: newAdminEmail,
        hospitalId: params.id
      }) // Debug log
      
      const newAdmin = await apiClient.createHospitalAdmin({
        name: newAdminName,
        email: newAdminEmail,
        password: newAdminPassword,
        hospitalId: params.id as string
      })
      console.log('New admin created:', newAdmin) // Debug log
      
      if (!newAdmin) {
        throw new Error("No admin data received from server")
      }

      // Update the hospital details with the new admin
      setHospitalDetails(prev => {
        if (!prev) {
          console.log('No previous hospital details found when adding new admin') // Debug log
          return null
        }
        console.log('Updating hospital details with new admin:', newAdmin) // Debug log
        return {
          ...prev,
          admins: [...prev.admins, newAdmin]
        }
      })

      toast.success("Hospital admin created successfully")
      setNewAdminEmail("")
      setNewAdminPassword("")
      setNewAdminName("")
    } catch (error) {
      console.error("Failed to create hospital admin:", error)
      if (error instanceof Error) {
        console.error("Error details:", error.message)
        toast.error(`Failed to create hospital admin: ${error.message}`)
      } else {
        toast.error("Failed to create hospital admin")
      }
    } finally {
      setIsAssigningAdmin(false)
    }
  }

  const handleEditAdmin = async (admin: User) => {
    setEditingAdmin(admin)
    setNewAdminName(admin.name)
    setNewAdminEmail(admin.email)
  }

  const handleUpdateAdmin = async () => {
    if (!editingAdmin || !newAdminName || !newAdminEmail) {
      toast.error("Please fill in all fields")
      return
    }

    setIsAssigningAdmin(true)
    try {
      console.log('Updating admin with data:', {
        id: editingAdmin.id,
        name: newAdminName,
        email: newAdminEmail,
        hospitalId: params.id
      })
      
      const updatedAdmin = await apiClient.updateHospitalAdmin(editingAdmin.id, {
        name: newAdminName,
        email: newAdminEmail,
        hospitalId: params.id as string
      })
      console.log('Admin updated:', updatedAdmin)
      
      // Update the hospital details with the updated admin
      setHospitalDetails(prev => {
        if (!prev) return null
        return {
          ...prev,
          admins: prev.admins.map(admin => 
            admin.id === updatedAdmin.id ? updatedAdmin : admin
          )
        }
      })

      toast.success("Hospital admin updated successfully")
      setEditingAdmin(null)
      setNewAdminEmail("")
      setNewAdminName("")
    } catch (error) {
      console.error("Failed to update hospital admin:", error)
      if (error instanceof Error) {
        toast.error(`Failed to update hospital admin: ${error.message}`)
      } else {
        toast.error("Failed to update hospital admin")
      }
    } finally {
      setIsAssigningAdmin(false)
    }
  }

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm("Are you sure you want to delete this admin?")) return

    setIsDeletingAdmin(true)
    try {
      await apiClient.deleteHospitalAdmin(adminId)
      
      // Update the hospital details by removing the deleted admin
      setHospitalDetails(prev => {
        if (!prev) return null
        return {
          ...prev,
          admins: prev.admins.filter(admin => admin.id !== adminId)
        }
      })

      toast.success("Hospital admin deleted successfully")
    } catch (error) {
      console.error("Failed to delete hospital admin:", error)
      if (error instanceof Error) {
        toast.error(`Failed to delete hospital admin: ${error.message}`)
      } else {
        toast.error("Failed to delete hospital admin")
      }
    } finally {
      setIsDeletingAdmin(false)
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

  if (!hospitalDetails || !hospitalDetails.hospital) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Hospital not found</h3>
          <p className="text-slate-600">The hospital you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
        </div>
      </DashboardLayout>
    )
  }

  const { hospital } = hospitalDetails

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hospital Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{hospital?.name || 'Unnamed Hospital'}</h1>
              <div className="flex items-center mt-2">
                <MapPin className="h-4 w-4 mr-2" />
                <p className="text-emerald-100">{hospital?.address || 'No address provided'}</p>
              </div>
              <div className="flex items-center mt-1">
                <Calendar className="h-4 w-4 mr-2" />
                <p className="text-emerald-100">Established: {hospital?.establishedYear || 'N/A'}</p>
              </div>
            </div>
            <Building2 className="h-16 w-16 text-emerald-200" />
          </div>
        </div>

        {/* Hospital Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Doctors</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{hospitalDetails.statistics?.doctors || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{hospitalDetails.statistics?.patients || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{hospitalDetails.statistics?.prescriptions || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Hospital Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600">Phone</p>
                  <p className="font-medium">{hospital?.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600">Email</p>
                  <p className="font-medium">{hospital?.email || 'N/A'}</p>
                </div>
              </div>
              {hospital?.website && (
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-600">Website</p>
                    <a href={hospital.website} className="font-medium text-emerald-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      {hospital.website}
                    </a>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600">Emergency Contact</p>
                  <p className="font-medium">{hospital?.emergencyContact || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-600">License Number</p>
                <p className="font-medium">{hospital?.licenseNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Bed Capacity</p>
                <p className="font-medium">{hospital?.bedCapacity || 0} beds</p>
              </div>
              {hospital?.description && (
                <div>
                  <p className="text-sm text-slate-600">Description</p>
                  <p className="font-medium">{hospital.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Doctors List Section */}
        <Card>
          <CardHeader>
            <CardTitle>Hospital Doctors</CardTitle>
          </CardHeader>
          <CardContent>
            {doctors.length > 0 ? (
              <div className="space-y-4">
                {doctors.map((doctor) => (
                  <div key={doctor._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{doctor.name}</p>
                      <p className="text-sm text-slate-600">{doctor.email}</p>
                    </div>
                    <div className="text-sm text-slate-600">
                      {doctor.specialization} - {doctor.designation}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-slate-600">No doctors assigned to this hospital yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hospital Admins Section - Only visible to Super Admin */}
        {user?.role === UserRole.SUPER_ADMIN && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Hospital Administrators</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      {editingAdmin ? "Edit Admin" : "Create Admin"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingAdmin ? "Edit Hospital Administrator" : "Create Hospital Administrator"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingAdmin 
                          ? "Update the details for this hospital administrator."
                          : "Enter the details for the new hospital administrator."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          type="text"
                          value={newAdminName}
                          onChange={(e) => setNewAdminName(e.target.value)}
                          placeholder="Enter full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                          placeholder="Enter email address"
                        />
                      </div>
                      {!editingAdmin && (
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={newAdminPassword}
                            onChange={(e) => setNewAdminPassword(e.target.value)}
                            placeholder="Enter password"
                          />
                        </div>
                      )}
                      <Button
                        className="w-full"
                        onClick={editingAdmin ? handleUpdateAdmin : handleAssignAdmin}
                        disabled={isAssigningAdmin || !newAdminEmail || (!editingAdmin && !newAdminPassword) || !newAdminName}
                      >
                        {isAssigningAdmin 
                          ? (editingAdmin ? "Updating..." : "Creating...") 
                          : (editingAdmin ? "Update Admin" : "Create Admin")}
                      </Button>
                      {editingAdmin && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setEditingAdmin(null)
                            setNewAdminEmail("")
                            setNewAdminName("")
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {hospitalDetails?.admins && hospitalDetails.admins.length > 0 ? (
                <div className="space-y-4">
                  {hospitalDetails.admins.map((admin) => (
                    <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{admin.name}</p>
                        <p className="text-sm text-slate-600">{admin.email}</p>
                      </div>
                      <div className="text-sm text-slate-600">
                        {admin.role}
                      </div>
                      <div className="text-sm text-slate-600">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditAdmin(admin)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAdmin(admin.id)}
                          disabled={isDeletingAdmin}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-600">No administrators assigned to this hospital yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
} 