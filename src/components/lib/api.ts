import { User, Hospital, Doctor, PatientEnrollment, Prescription } from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token)
    }
  }

  removeToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> || {}),
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "An error occurred")
      }

      return data
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message)
      }
      throw new Error("An unexpected error occurred")
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const response = await this.request<{ success: boolean; token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    if (!response.success || !response.token || !response.user) {
      throw new Error("Invalid response from server")
    }

    this.setToken(response.token)
    return {
      token: response.token,
      user: response.user
    }
  }

  async register(userData: {
    name: string
    email: string
    password: string
    role: string
    hospitalId?: string
    specialization?: string
  }): Promise<{ token: string; user: User }> {
    const response = await this.request<{ success: boolean; token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })

    if (!response.success || !response.token || !response.user) {
      throw new Error("Invalid response from server")
    }

    return {
      token: response.token,
      user: response.user
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.request<{ success: boolean; user: User }>("/auth/me")
    if (!response.success || !response.user) {
      throw new Error("Failed to get current user")
    }
    return response.user
  }

  // Hospital endpoints
  async getHospitals(): Promise<Hospital[]> {
    const response = await this.request<{ success: boolean; data: Hospital[] }>("/hospitals")
    return response.data
  }

  async getHospital(id: string): Promise<Hospital> {
    const response = await this.request<{ success: boolean; data: Hospital }>(`/hospitals/${id}`)
    return response.data
  }

  async getHospitalDetails(id: string): Promise<{
    hospital: Hospital
    statistics: {
      doctors: number
      patients: number
      prescriptions: number
    }
    admins: User[]
  }> {
    const response = await this.request<{
      success: boolean
      data: {
        hospital: Hospital
        statistics: {
          doctors: number
          patients: number
          prescriptions: number
        }
        admins: User[]
      }
    }>(`/hospitals/${id}`)
    if (!response.success || !response.data) {
      throw new Error("Failed to fetch hospital details")
    }
    return response.data
  }

  async assignHospitalAdmin(hospitalId: string, email: string): Promise<User> {
    const response = await this.request<{ success: boolean; data: User }>(`/hospitals/${hospitalId}/admins`, {
      method: "POST",
      body: JSON.stringify({ email }),
    })
    return response.data
  }

  async createHospital(data: {
    name: string
    address: string
    phone: string
    email: string
    website?: string
    licenseNumber: string
    establishedYear: number
    bedCapacity: number
    emergencyContact: string
    description?: string
  }): Promise<Hospital> {
    const response = await this.request<{ success: boolean; data: Hospital }>("/hospitals", {
      method: "POST",
      body: JSON.stringify(data),
    })
    return response.data
  }

  async updateHospital(id: string, hospitalData: {
    name: string
    address: string
    phone: string
    email: string
    website?: string
    licenseNumber: string
    establishedYear: number
    bedCapacity: number
    emergencyContact: string
    description?: string
  }): Promise<Hospital> {
    const response = await this.request<{ success: boolean; data: Hospital }>(`/hospitals/${id}`, {
      method: "PUT",
      body: JSON.stringify(hospitalData),
    })
    return response.data
  }

  async deleteHospital(id: string): Promise<void> {
    await this.request<{ success: boolean }>(`/hospitals/${id}`, {
      method: "DELETE",
    })
  }

  // Doctor endpoints
  async getDoctors(hospitalId?: string): Promise<Doctor[]> {
    const query = hospitalId ? `?hospitalId=${hospitalId}` : ""
    const response = await this.request<{ success: boolean; data: Doctor[] }>(`/doctors${query}`)
    return response.data
  }

  async getDoctor(id: string): Promise<Doctor> {
    const response = await this.request<{ success: boolean; data: Doctor }>(`/doctors/${id}`)
    return response.data
  }

  async createDoctor(doctorData: {
    name: string
    email: string
    password: string
    specialization: string
    hospitalId: string
  }): Promise<Doctor> {
    const response = await this.request<{ success: boolean; data: Doctor }>("/doctors", {
      method: "POST",
      body: JSON.stringify(doctorData),
    })
    return response.data
  }

  async updateDoctor(id: string, doctorData: { name: string; specialization: string }): Promise<Doctor> {
    const response = await this.request<{ success: boolean; data: Doctor }>(`/doctors/${id}`, {
      method: "PUT",
      body: JSON.stringify(doctorData),
    })
    return response.data
  }

  async deleteDoctor(id: string): Promise<void> {
    await this.request<{ success: boolean }>(`/doctors/${id}`, {
      method: "DELETE",
    })
  }

  // Patient endpoints
  async getPatients(hospitalId?: string, doctorId?: string): Promise<PatientEnrollment[]> {
    const params = new URLSearchParams()
    if (hospitalId) params.append("hospitalId", hospitalId)
    if (doctorId) params.append("doctorId", doctorId)
    const query = params.toString() ? `?${params.toString()}` : ""

    const response = await this.request<{ success: boolean; data: PatientEnrollment[] }>(`/patients${query}`)
    return response.data
  }

  async getPatient(id: string): Promise<PatientEnrollment> {
    const response = await this.request<{ success: boolean; data: PatientEnrollment }>(`/patients/${id}`)
    return response.data
  }

  async createPatient(patientData: {
    name: string
    age: number
    gender: string
    doctorId?: string
    hospitalId?: string
    dateOfAdmission?: string
  }): Promise<PatientEnrollment> {
    const response = await this.request<{ success: boolean; data: PatientEnrollment }>("/patients", {
      method: "POST",
      body: JSON.stringify(patientData),
    })
    return response.data
  }

  async updatePatient(
    id: string,
    patientData: { name: string; age: number; gender: string; dateOfAdmission?: string },
  ): Promise<PatientEnrollment> {
    const response = await this.request<{ success: boolean; data: PatientEnrollment }>(`/patients/${id}`, {
      method: "PUT",
      body: JSON.stringify(patientData),
    })
    return response.data
  }

  async deletePatient(id: string): Promise<void> {
    await this.request<{ success: boolean }>(`/patients/${id}`, {
      method: "DELETE",
    })
  }

  // Prescription endpoints
  async getPrescriptions(patientId?: string, hospitalId?: string, doctorId?: string): Promise<Prescription[]> {
    const params = new URLSearchParams()
    if (patientId) params.append("patientId", patientId)
    if (hospitalId) params.append("hospitalId", hospitalId)
    if (doctorId) params.append("doctorId", doctorId)
    const query = params.toString() ? `?${params.toString()}` : ""

    const response = await this.request<{ success: boolean; data: Prescription[] }>(`/prescriptions${query}`)
    return response.data
  }

  async getPrescription(id: string): Promise<Prescription> {
    const response = await this.request<{ success: boolean; data: Prescription }>(`/prescriptions/${id}`)
    return response.data
  }

  async createPrescription(prescriptionData: {
    patientEnrollmentId: string
    medication: string
    dosage: string
    instructions: string
    doctorId?: string
  }): Promise<Prescription> {
    const response = await this.request<{ success: boolean; data: Prescription }>("/prescriptions", {
      method: "POST",
      body: JSON.stringify(prescriptionData),
    })
    return response.data
  }

  async updatePrescription(
    id: string,
    prescriptionData: { medication: string; dosage: string; instructions: string },
  ): Promise<Prescription> {
    const response = await this.request<{ success: boolean; data: Prescription }>(`/prescriptions/${id}`, {
      method: "PUT",
      body: JSON.stringify(prescriptionData),
    })
    return response.data
  }

  async deletePrescription(id: string): Promise<void> {
    await this.request<{ success: boolean }>(`/prescriptions/${id}`, {
      method: "DELETE",
    })
  }

  // Hospital Admin endpoints
  async getHospitalAdmins(): Promise<User[]> {
    try {
      console.log('API Client: Fetching hospital admins...') // Debug log
      const response = await this.request<{ success: boolean; data: User[] }>("/hospital-admins")
      console.log('API Client: Hospital admins response:', response) // Debug log
      
      if (!response.success || !Array.isArray(response.data)) {
        console.error('API Client: Invalid response format:', response)
        throw new Error('Invalid response format from server')
      }
      
      return response.data
    } catch (error) {
      console.error('API Client: Error fetching hospital admins:', error)
      throw error
    }
  }
  
  async createHospitalAdmin(adminData: {
    name: string
    email: string
    password: string
    hospitalId: string
  }): Promise<User> {
    try {
      console.log('API Client: Creating hospital admin with data:', adminData) // Debug log
      const response = await this.request<{ success: boolean; data: User }>("/hospital-admins", {
        method: "POST",
        body: JSON.stringify(adminData),
      })
      console.log('API Client: Create hospital admin response:', response) // Debug log
      
      if (!response.success || !response.data) {
        console.error('API Client: Invalid response format:', response)
        throw new Error('Invalid response format from server')
      }
      
      return response.data
    } catch (error) {
      console.error('API Client: Error creating hospital admin:', error)
      throw error
    }
  }

  async updateHospitalAdmin(
    id: string,
    adminData: {
      name: string
      email: string
      hospitalId: string
    },
  ): Promise<User> {
    const response = await this.request<{ success: boolean; data: User }>(`/hospital-admins/${id}`, {
      method: "PUT",
      body: JSON.stringify(adminData),
    })
    return response.data
  }

  async deleteHospitalAdmin(id: string): Promise<void> {
    await this.request(`/hospital-admins/${id}`, {
      method: "DELETE",
    })
  }

  async getMyHospital(): Promise<{
    hospital: Hospital
    statistics: {
      doctors: number
      patients: number
      prescriptions: number
    }
    recentDoctors: Doctor[]
    recentPatients: PatientEnrollment[]
  }> {
    const response = await this.request<{
      success: boolean
      data: {
        hospital: Hospital
        statistics: {
          doctors: number
          patients: number
          prescriptions: number
        }
        recentDoctors: Doctor[]
        recentPatients: PatientEnrollment[]
      }
    }>("/hospital-admins/my-hospital")
    return response.data
  }
}

export const apiClient = new ApiClient(API_BASE_URL)