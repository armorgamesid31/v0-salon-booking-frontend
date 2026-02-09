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

// Dummy Services - 9 kategoriye organize edilmiş
export const DUMMY_SERVICES: ServiceCategory[] = [
  {
    id: 'cat-1',
    name: 'Yüz & Cilt Bakımı',
    icon: '🧖‍♀️',
    services: [
      {
        id: 's1',
        name: 'Klasik Yüz Temizliği',
        duration: '60 dk',
        originalPrice: 300,
        salePrice: 250,
      },
      { id: 's2', name: 'Hydrafacial', duration: '50 dk', originalPrice: 800, salePrice: 700 },
      {
        id: 's3',
        name: 'Mikro İğne ile Cilt Yenileme',
        duration: '45 dk',
        originalPrice: 500,
        salePrice: 450,
      },
    ],
  },
  {
    id: 'cat-2',
    name: 'Medikal Estetik',
    icon: '💉',
    services: [
      {
        id: 's4',
        name: 'Botoks Uygulaması',
        duration: '30 dk',
        originalPrice: 2000,
        salePrice: 1800,
      },
      { id: 's5', name: 'Dolgu Uygulaması', duration: '40 dk', originalPrice: 1500, salePrice: 1350 },
    ],
  },
  {
    id: 'cat-3',
    name: 'Lazer Epilasyon',
    icon: '🔦',
    services: [
      { id: 's6', name: 'Tam Vücut', duration: '60 dk', originalPrice: 1800, salePrice: 1650 },
      { id: 's7', name: 'Sırt Lazer', duration: '30 dk', originalPrice: 1200, salePrice: 1100 },
      { id: 's8', name: 'Bacak Lazer', duration: '45 dk', originalPrice: 1500, salePrice: 1350 },
      { id: 's9', name: 'Bikini Lazer', duration: '25 dk', originalPrice: 800, salePrice: 700 },
    ],
  },
  {
    id: 'cat-4',
    name: 'Ağda',
    icon: '🍯',
    services: [
      { id: 's10', name: 'Tam Vücut Ağda', duration: '50 dk', originalPrice: 600, salePrice: 550 },
      { id: 's11', name: 'Bacak Ağda', duration: '35 dk', originalPrice: 350, salePrice: 300 },
      { id: 's12', name: 'Bikini Ağda', duration: '20 dk', originalPrice: 250, salePrice: 200 },
    ],
  },
  {
    id: 'cat-5',
    name: 'Vücut, Şekillendirme & Masaj',
    icon: '🧘‍♀️',
    services: [
      { id: 's13', name: 'Masöz Masajı', duration: '60 dk', originalPrice: 400, salePrice: 350 },
      { id: 's14', name: 'Selülit Masajı', duration: '45 dk', originalPrice: 500, salePrice: 450 },
      { id: 's15', name: 'Vücut Şekillendirme Paketi', duration: '90 dk', originalPrice: 1500, salePrice: 1350 },
    ],
  },
  {
    id: 'cat-6',
    name: 'El, Ayak & Tırnak',
    icon: '💅',
    services: [
      { id: 's16', name: 'Manicure', duration: '30 dk', originalPrice: 150, salePrice: 100 },
      { id: 's17', name: 'Pedicure', duration: '35 dk', originalPrice: 200, salePrice: 150 },
      { id: 's18', name: 'Tırnak Tasarımı', duration: '40 dk', originalPrice: 250, salePrice: 200 },
    ],
  },
  {
    id: 'cat-7',
    name: 'Saç & Kuaför',
    icon: '💇‍♀️',
    services: [
      { id: 's19', name: 'Saç Boyası', duration: '120 dk', originalPrice: 600, salePrice: 550 },
      { id: 's20', name: 'Kalıcı Dalgalanma', duration: '90 dk', originalPrice: 800, salePrice: 750 },
      { id: 's21', name: 'Saç Keratini Tedavisi', duration: '60 dk', originalPrice: 500, salePrice: 450 },
    ],
  },
  {
    id: 'cat-8',
    name: 'Danışmanlık & Paketler',
    icon: '📦',
    services: [
      { id: 's22', name: 'Cilt Analizi', duration: '25 dk', originalPrice: 150, salePrice: 0 },
      { id: 's23', name: 'Stil Danışmanlığı', duration: '45 dk', originalPrice: 200, salePrice: 0 },
      { id: 's24', name: '5 Oturum Paketi', duration: 'Paket', originalPrice: 5000, salePrice: 4500 },
    ],
  },
  {
    id: 'cat-9',
    name: 'Diğer Hizmetler',
    icon: '✨',
    services: [
      { id: 's25', name: 'Çok Özel Hizmet 1', duration: '30 dk', originalPrice: 300, salePrice: 250 },
      { id: 's26', name: 'Çok Özel Hizmet 2', duration: '45 dk', originalPrice: 450, salePrice: 400 },
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
export const SPECIALIST_SERVICES = ['s4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12', 's13', 's14', 's15', 's19', 's20', 's21']

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
