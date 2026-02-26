import { API_BASE_URL } from './constants'
import type { Salon, ServiceCategory, Employee, Package, Appointment, ApiResponse, BookingContext } from './types'

/**
 * Multi-tenant SaaS API helpers
 */

async function fetchFromAPI<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options)
  const isJson = response.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await response.json().catch(() => ({})) : null

  if (!response.ok) {
    throw new Error(data?.message || `API error: ${response.status}`)
  }
  return data as T
}

export async function getSalon(salonId: string): Promise<Salon> {
  const url = `${API_BASE_URL}/api/salon/public`
  try {
    const data = await fetchFromAPI<{ salon: any }>(url)
    return {
      id: data.salon.id.toString(),
      name: data.salon.name,
      description: '',
      logoUrl: data.salon.logoUrl || null,
      headerMessage: 'Hizmetini Seç',
    }
  } catch (error) {
    console.warn('getSalon failed, using fallback:', error)
    return { 
      id: salonId, 
      name: 'Salon', 
      description: '', 
      headerMessage: 'Hizmetini Seç',
      logoUrl: undefined
    }
  }
}

export async function getServices(salonId: string, gender?: string): Promise<ServiceCategory[]> {
  const params = new URLSearchParams();
  if (gender) params.append('gender', gender);
  
  const url = `${API_BASE_URL}/api/salon/services/public?${params.toString()}`
  try {
    const data = await fetchFromAPI<{ categories: any[] }>(url)
    return data.categories.map(cat => ({
      id: cat.key,
      name: cat.name,
      icon: cat.key,
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

export async function getStaffForService(serviceId: string): Promise<Employee[]> {
  const url = `${API_BASE_URL}/api/salon/services/${serviceId}/staff`
  try {
    const data = await fetchFromAPI<{ staff: any[] }>(url)
    return data.staff.map(p => ({
      id: p.id.toString(),
      name: p.name,
      overridePrice: p.price,
      overrideDuration: p.duration
    }))
  } catch (error) {
    console.error('getStaffForService error:', error)
    return []
  }
}

export async function createAppointment(
  salonId: string,
  customerId: string,
  data: {
    services: Array<{ serviceId: string; employeeId?: string; duration?: string }>
    date: string
    time: string
    numberOfPeople: number
    customerInfo: { name: string; phone: string; email?: string }
  }
): Promise<ApiResponse<Appointment>> {
    try {
      const url = `${API_BASE_URL}/api/bookings`
      
      const [hours, minutes] = data.time.split(':');
      const start = new Date(data.date);
      start.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const durationMatch = data.services[0].duration?.match(/\d+/) || ["30"];
      const durationMinutes = parseInt(durationMatch[0]);
      const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

      const result = await fetchFromAPI<any>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: parseInt(customerId),
          services: data.services.map(s => ({
              serviceId: s.serviceId,
              staffId: s.employeeId,
              duration: s.duration?.match(/\d+/)?.[0] || "30"
          })),
          startTime: start.toISOString(),
          customerName: data.customerInfo.name,
          customerPhone: data.customerInfo.phone,
          source: 'CUSTOMER'
        }),
      })
      return { data: result }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create appointment',
    }
  }
}

export async function registerCustomer(
  data: { fullName: string; phone: string; gender: string; birthDate: string; acceptMarketing: boolean }
): Promise<{ customerId: string; success: boolean }> {
  const url = `${API_BASE_URL}/api/customers/register`
  const result = await fetchFromAPI<any>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return { 
    customerId: result.customerId.toString(), 
    success: true 
  }
}

export async function checkAvailability(
  salonId: string,
  serviceId: string,
  date: string,
  numberOfPeople: number
): Promise<{ available: boolean; slots?: string[] }> {
  try {
    const url = `${API_BASE_URL}/availability/slots`
    const data = await fetchFromAPI<any>(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: date,
        groups: [{ personId: 'p1', services: [parseInt(serviceId)] }]
      }),
    })
    
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

export async function getEmployees(salonId: string): Promise<Employee[]> {
  const url = `${API_BASE_URL}/api/salon/staff/public`
  try {
    const data = await fetchFromAPI<{ staff: any[] }>(url)
    return data.staff.map(p => ({ id: p.id.toString(), name: p.name }))
  } catch { return [] }
}

export async function getAppointments(salonId: string, customerId: string): Promise<Appointment[]> {
  try {
    const url = `${API_BASE_URL}/api/salon/appointments?customerId=${customerId}`
    const data = await fetchFromAPI<{ appointments: any[] }>(url)
    return data.appointments || []
  } catch { return [] }
}

export async function getPackages(salonId: string): Promise<Package[]> { return [] }
