// Salon
export interface Salon {
  id: string
  name: string
  description: string
  logoUrl?: string
  headerMessage?: string
  phone?: string
  address?: string
  categoryOrder?: string[] | null
  workingHours?: {
    day: string
    open: string
    close: string
  }[]
}

// Service
export interface ServiceItem {
  id: string
  name: string
  duration: string
  originalPrice: number
  salePrice?: number
  tags?: string[]
  requiresSpecialist?: boolean
}

export interface ServiceCategory {
  id: string
  name: string
  icon: string
  services: ServiceItem[]
}

// Employee/Specialist
export interface Employee {
  id: string
  name: string
  specialization?: string
  overridePrice?: number
  overrideDuration?: number
  availability?: {
    day: string
    slots: string[]
  }[]
}

// Package
export interface Package {
  id: string
  name: string
  description: string
  price: number
  sessions: number
  expiryDays: number
}

// Customer
export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  gender?: 'male' | 'female'
  appointments?: Appointment[]
}

// Appointment
export interface Appointment {
  id: string
  customerId: string
  salonId: string
  serviceId: string
  employeeId?: string
  date: string
  time: string
  duration: string
  price: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: string
}

// API Response
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// Booking Context (Magic Link)
export interface BookingContext {
  customerId: string
  customerName: string
  customerPhone: string
  customerGender?: 'male' | 'female'
  salonId: string
  salonName: string
  isKnownCustomer: boolean
  appointments?: Appointment[]
  activePackages?: any[]
}
