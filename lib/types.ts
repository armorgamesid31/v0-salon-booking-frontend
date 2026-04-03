// Salon
export interface Salon {
  id: string
  name: string
  description: string
  logoUrl?: string
  whatsappPhone?: string
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
  customerId: string | null
  customerName: string | null
  customerPhone: string
  customerGender?: 'male' | 'female' | 'other' | null
  customerLanguage?: string | null
  originChannel?: 'WHATSAPP' | 'INSTAGRAM' | string | null
  originPhone?: string | null
  originInstagramId?: string | null
  salonId: string
  salonName: string
  isKnownCustomer: boolean
  identityLinked?: boolean
  identitySessionId?: string | null
  appointments?: BookingContextAppointment[]
  activePackages?: ActiveCustomerPackage[]
}

export interface BookingContextAppointment {
  id: string
  startTime: string
  endTime: string
  status: string
  serviceId?: string | null
  serviceName?: string | null
  servicePrice?: number | null
  staffName?: string | null
  canUpdate?: boolean
  canCancel?: boolean
  canEvaluate?: boolean
  isFuture?: boolean
  groupKey?: string
  rescheduledFromAppointmentId?: string | null
  rescheduleBatchId?: string | null
  customerRating?: number | null
  customerReview?: string | null
}

export interface ActiveCustomerPackage {
  id: string
  name: string
  expiresAt?: string | null
  serviceBalances: Array<{
    serviceId: string
    serviceName?: string | null
    initialQuota: number
    remainingQuota: number
  }>
}

export interface HomepageWorkingHours {
  workStartHour: number
  workEndHour: number
  timezone: string
  workingDays?: number[]
}

export interface HomepageSalon {
  id: number
  slug: string
  name: string
  logoUrl?: string | null
  tagline?: string | null
  about?: string | null
  heroImageUrl?: string | null
  instagramUrl?: string | null
  workingHours?: HomepageWorkingHours
}

export interface HomepageCategory {
  id: number
  name: string
  marketingDescription?: string | null
  icon?: string | null
  coverImageUrl?: string | null
  displayOrder?: number | null
  serviceCount?: number
}

export interface HomepageExpert {
  id: number
  name: string
  title?: string | null
  bio?: string | null
  profileImageUrl?: string | null
}

export interface HomepageGalleryItem {
  id: number | string
  imageUrl: string
  altText?: string | null
  displayOrder?: number | null
}

export interface HomepageTestimonial {
  id: number | string
  templateType?: string | null
  generatedText: string
  isGenerated?: boolean | null
  expert?: {
    id: number
    name: string
    title?: string | null
  } | null
  category?: {
    id: number
    name: string
  } | null
}

export interface HomepageBooking {
  mode: 'INTERNAL' | 'WHATSAPP'
  whatsappPhone: string
  bookingUrl: string
}

export interface SalonHomepageResponse {
  salon: HomepageSalon
  categories: HomepageCategory[]
  experts: HomepageExpert[]
  gallery: HomepageGalleryItem[]
  testimonials: HomepageTestimonial[]
  booking: HomepageBooking
}
