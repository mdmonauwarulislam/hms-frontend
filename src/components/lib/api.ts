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
      throw error
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const response = await this.request<{ success: boolean; token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    
    console.log('Login response:', response) // Debug log

    if (!response || typeof response !== 'object') {
      throw new Error("Invalid response format from server")
    }

    if (!response.success || !response.token || !response.user) {
      console.error('Response validation failed:', { 
        hasSuccess: !!response.success,
        hasToken: !!response.token,
        hasUser: !!response.user,
        response
      })
      throw new Error("Invalid response from server")
    }

    // Set the token in the client
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
    return {
      token: response.token,
      user: response.user
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.request<{ success: boolean; user: User }>("/auth/me")
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

  async createHospital(hospitalData: { name: string; address: string }): Promise<Hospital> {
    const response = await this.request<{ success: boolean; data: Hospital }>("/hospitals", {
      method: "POST",
      body: JSON.stringify(hospitalData),
    })
    return response.data
  }

  async updateHospital(id: string, hospitalData: { name: string; address: string }): Promise<Hospital> {
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
}

export const apiClient = new ApiClient(API_BASE_URL)
