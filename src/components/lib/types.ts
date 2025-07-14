export enum UserRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    HOSPITAL_ADMIN = "HOSPITAL_ADMIN",
    DOCTOR = "DOCTOR",
  }
  
  export interface User {
    _id: string
    name: string
    email: string
    role: string
    hospitalId?: string
    specialization?: string
  }
  
  export interface Hospital {
    id: string
    name: string
    address: string
    createdAt: string
  }
  
  export interface Doctor {
    id: string
    name: string
    email: string
    specialization: string
    hospitalId: string
  }
  
  export interface PatientEnrollment {
    id: string
    name: string
    age: number
    gender: string
    doctorId?: string
    hospitalId?: string
    dateOfAdmission?: string
  }
  
  export interface Prescription {
    id: string
    patientEnrollmentId: string
    medication: string
    dosage: string
    instructions: string
    doctorId?: string
  }
  
  export interface ApiResponse<T> {
    data?: T
    message?: string
    error?: string
  }
  