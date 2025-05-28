export enum UserRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    HOSPITAL_ADMIN = "HOSPITAL_ADMIN",
    DOCTOR = "DOCTOR",
  }
  
  export interface User {
    id: string
    name: string
    email: string
    role: UserRole
    hospitalId?: string
    specialization?: string
    createdAt?: string
    hospital?: Hospital
  }
  
  export interface Hospital {
    _id: string
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
    createdAt: string
    updatedAt: string
  }
  
  export type Designation = 'General Physician' | 'Specialist' | 'Surgeon' | 'Consultant' | 'Resident'
  
  export interface Doctor {
    _id: string
    name: string
    email: string
    specialization: string
    designation: Designation
    hospitalId: string
    hospital?: Hospital
    createdAt: string
    updatedAt: string
  }
  
  export interface PatientEnrollment {
    _id: string
    name: string
    age: number
    gender: string
    doctorId?: string
    hospitalId?: string
    dateOfAdmission?: string
    createdAt: string
    updatedAt: string
  }
  
  export interface Prescription {
    _id: string
    patientEnrollmentId: string
    medication: string
    dosage: string
    instructions: string
    doctorId?: string
    createdAt: string
    updatedAt: string
  }
  
  export interface ApiResponse<T> {
    success: boolean
    data?: T
    message?: string
    error?: string
  }
  