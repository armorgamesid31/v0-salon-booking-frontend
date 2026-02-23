import { API_BASE_URL } from './constants'
import type { Salon, ServiceCategory, Employee, Package, Appointment, ApiResponse, BookingContext } from './types'

/**
 * Multi-tenant SaaS API helpers - Backend ile Uyumlu (Grouped Categories)
 */

// Generic fetch wrapper
async function fetchFromAPI<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `API error: ${response.status}`)
    }
    return response.json()
  } catch (error) {
    console.error('API fetch error:', error)
    throw error
  }
}

// Salon bilgisini getir
export async function getSalon(salonId: string): Promise<Salon> {
  const url = `${API_BASE_URL}/api/salon/public`
  try {
    const data = await fetchFromAPI<{ salon: any }>(url)
    return {
      id: data.salon.id.toString(),
      name: data.salon.name,
      description: '',
      headerMessage: 'Hizmetini Seç',
    }
  } catch (error) {
    console.warn('getSalon failed, using fallback:', error)
    return { id: salonId, name: 'Salon', description: '', headerMessage: 'Hizmetini Seç' }
  }
}

// Hizmetleri getir (Grouped by backend)
export async function getServices(salonId: string): Promise<ServiceCategory[]> {
  const url = `${API_BASE_URL}/api/salon/services/public`
  try {
    const data = await fetchFromAPI<{ categories: any[] }>(url)
    return data.categories.map(cat => ({
      id: cat.key,
      name: cat.name,
      icon: '', // Backend key üzerinden frontend'de maplenebilir
      services: cat.services.map((s: any) => ({
        id: s.id.toString(),
        name: s.name,
        duration: `${s.duration} dk`,
        originalPrice: s.price,
        salePrice: s.price,
        requiresSpecialist: s.requiresSpecialist
      }))
    }))
  } catch (error) {
    console.error('getServices error:', error)
    return []
  }
}

// Çalışanları getir
export async function getEmployees(salonId: string): Promise<Employee[]> {
  const url = `${API_BASE_URL}/api/salon/staff/public`
  try {
    const data = await fetchFromAPI<{ staff: any[] }>(url)
    return data.staff.map(p => ({
      id: p.id.toString(),
      name: p.name,
    }))
  } catch (error) {
    console.error('getEmployees error:', error)
    return []
  }
}

// Paketleri getir
export async function getPackages(salonId: string): Promise<Package[]> {
  return []
}

// Müsaitlik kontrol et
export async function checkAvailability(
  salonId: string,
  serviceId: string,
  date: string,
  numberOfPeople: number,
  employeeId?: string
): Promise<{ available: boolean; slots?: string[] }> {
  try {
    const url = `${API_BASE_URL}/availability/slots`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: date,
        groups: [
          {
            personId: 'p1',
            services: [parseInt(serviceId)]
          }
        ]
      }),
    })
    
    if (!response.ok) return { available: false }
    
    const data = await response.json()
    const personGroup = data.groups?.[0]
    if (personGroup && personGroup.slots.length > 0) {
      return {
        available: true,
        slots: personGroup.slots.map((s: any) => s.startTime)
      }
    }
    
    return { available: false }
  } catch (error) {
    console.error('checkAvailability error:', error)
    return { available: false }
  }
}

// Randevu oluştur
export async function createAppointment(
  salonId: string,
  customerId: string,
  data: {
    services: Array<{ serviceId: string; employeeId?: string }>
    date: string
    time: string
    numberOfPeople: number
    customerInfo: { name: string; phone: string; email?: string }
  }
): Promise<ApiResponse<Appointment>> {
  try {
    const url = `${API_BASE_URL}/api/bookings`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: parseInt(customerId),
        serviceId: parseInt(data.services[0].serviceId),
        staffId: data.services[0].employeeId ? parseInt(data.services[0].employeeId) : undefined,
        startTime: `${data.date}T${data.time}:00`, 
        customerName: data.customerInfo.name,
        customerPhone: data.customerInfo.phone,
      }),
    })
    
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.message || 'Appointment creation failed')
    }
    
    const result = await response.json()
    return { data: result }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create appointment',
    }
  }
}

// Geçmiş randevuları getir
export async function getAppointments(salonId: string, customerId: string): Promise<Appointment[]> {
  try {
    const url = `${API_BASE_URL}/api/salon/appointments?customerId=${customerId}`
    const data = await fetchFromAPI<{ appointments: any[] }>(url)
    return data.appointments || []
  } catch {
    return []
  }
}

// Yeni müşteri kaydı
export interface RegisterCustomerRequest {
  fullName: string
  phone: string
  gender: 'female' | 'male' | 'other'
  birthDate: string
  acceptMarketing: boolean
  salonId: string
}

export interface RegisterCustomerResponse {
  customerId: string
  success?: boolean
}

export async function registerCustomer(
  data: RegisterCustomerRequest
): Promise<RegisterCustomerResponse> {
  try {
    const url = `${API_BASE_URL}/api/customers/register`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: data.fullName,
        phone: data.phone,
        gender: data.gender,
        birthDate: data.birthDate,
        acceptMarketing: data.acceptMarketing,
      }),
    })
    
    if (!response.ok) throw new Error(`Register failed: ${response.status}`)
    const result = await response.json()
    return { 
      customerId: result.customerId.toString(), 
      success: true 
    }
  } catch (error) {
    console.error('registerCustomer error:', error)
    throw error
  }
}

// Magic Link - Token ile booking context getir
export async function getBookingContextByToken(token: string): Promise<BookingContext | null> {
  try {
    const url = `${API_BASE_URL}/api/booking/context?token=${token}`
    const data = await fetchFromAPI<any>(url)
    
    return {
      customerId: data.customerId?.toString() || null,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerGender: data.customerGender,
      salonId: data.salonId.toString(),
      salonName: data.salonName,
      isKnownCustomer: data.isKnownCustomer,
      appointments: data.appointments || [],
      activePackages: [],
    }
  } catch (error) {
    console.error('getBookingContextByToken error:', error)
    return null
  }
}
