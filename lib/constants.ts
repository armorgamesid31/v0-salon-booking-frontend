import type { Salon, ServiceCategory, Employee, Package, Appointment } from './types'

// Dummy Salon Data - Multi-tenant için örnek
export const DUMMY_SALON: Salon = {
  id: 'salon-001',
  name: 'Paketlerim',
  description: 'Aktif paketler',
  headerMessage: 'Hizmetini Seç',
  logoUrl: '📦',
  phone: '+90 212 555 0123',
  address: 'İstanbul, Türkiye',
}

// Dummy Services
export const DUMMY_SERVICES: ServiceCategory[] = [
  {
    id: 'cat-1',
    name: 'Epilasyon & Tüy Alma',
    icon: '⚡',
    services: [
      { id: 's1', name: 'Tam Vücut', duration: '60 dk', originalPrice: 1800, salePrice: 1650 },
      { id: 's2', name: 'Sırt Lazer', duration: '30 dk', originalPrice: 1200, salePrice: 1100 },
      { id: 's3', name: 'Bacak Lazer', duration: '45 dk', originalPrice: 1500, salePrice: 1350 },
    ],
  },
  {
    id: 'cat-2',
    name: 'Cilt Bakımı & Yüz',
    icon: '❤️',
    services: [
      {
        id: 's4',
        name: 'Klasik Yüz Temizliği',
        duration: '60 dk',
        originalPrice: 300,
        salePrice: 250,
      },
      { id: 's5', name: 'Hydrafacial', duration: '50 dk', originalPrice: 800, salePrice: 700 },
    ],
  },
]

// Dummy Employees
export const DUMMY_EMPLOYEES: Employee[] = [
  { id: 'emp-1', name: 'Pınar', specialization: 'Epilasyon' },
  { id: 'emp-2', name: 'Fatma', specialization: 'Cilt Bakımı' },
  { id: 'emp-3', name: 'Ayşe', specialization: 'Masöz' },
]

// Dummy Packages
export const DUMMY_PACKAGES: Package[] = [
  { id: 'pkg-1', name: '5 Oturum Paketi', description: 'Lazer depilasyon 5 oturum', price: 5000, sessions: 5, expiryDays: 180 },
  {
    id: 'pkg-2',
    name: '10 Oturum Paketi',
    description: 'Lazer depilasyon 10 oturum',
    price: 9000,
    sessions: 10,
    expiryDays: 365,
  },
]

// Specialist services (uzman seçimi olan hizmetler)
export const SPECIALIST_SERVICES = ['s1', 's2', 's3', 's4', 's5']

// API endpoints - multi-tenant için
export const API_ENDPOINTS = {
  SALON: (salonId: string) => `/api/salons/${salonId}`,
  SERVICES: (salonId: string) => `/api/salons/${salonId}/services`,
  EMPLOYEES: (salonId: string) => `/api/salons/${salonId}/employees`,
  PACKAGES: (salonId: string) => `/api/salons/${salonId}/packages`,
  AVAILABILITY: (salonId: string, serviceId: string) => `/api/salons/${salonId}/services/${serviceId}/availability`,
  APPOINTMENTS: (salonId: string, customerId: string) => `/api/salons/${salonId}/customers/${customerId}/appointments`,
  CREATE_APPOINTMENT: (salonId: string) => `/api/salons/${salonId}/appointments`,
}

// Environment variable defaults
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

// Dummy appointment data
export const DUMMY_APPOINTMENTS: Appointment[] = []
