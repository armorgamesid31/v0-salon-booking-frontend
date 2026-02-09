import { API_BASE_URL, DUMMY_SALON, DUMMY_SERVICES, DUMMY_EMPLOYEES, DUMMY_PACKAGES } from './constants'
import type { Salon, ServiceCategory, Employee, Package, Appointment, ApiResponse } from './types'

/**
 * Multi-tenant SaaS API helpers
 * Backend'e bağlanırken sadece endpoint'leri değiştirin
 */

// Generic fetch wrapper
async function fetchFromAPI<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`API error: ${response.status}`)
    return response.json()
  } catch (error) {
    console.error('API fetch error:', error)
    throw error
  }
}

// Salon bilgisini getir
export async function getSalon(salonId: string): Promise<Salon> {
  try {
    const url = `${API_BASE_URL}/api/salons/${salonId}`
    return await fetchFromAPI<Salon>(url)
  } catch {
    // Dummy data fallback - geliştirme sırasında kullanılır
    return DUMMY_SALON
  }
}

// Hizmetleri getir
export async function getServices(salonId: string): Promise<ServiceCategory[]> {
  try {
    const url = `${API_BASE_URL}/api/salons/${salonId}/services`
    return await fetchFromAPI<ServiceCategory[]>(url)
  } catch {
    return DUMMY_SERVICES
  }
}

// Çalışanları getir
export async function getEmployees(salonId: string): Promise<Employee[]> {
  try {
    const url = `${API_BASE_URL}/api/salons/${salonId}/employees`
    return await fetchFromAPI<Employee[]>(url)
  } catch {
    return DUMMY_EMPLOYEES
  }
}

// Paketleri getir
export async function getPackages(salonId: string): Promise<Package[]> {
  try {
    const url = `${API_BASE_URL}/api/salons/${salonId}/packages`
    return await fetchFromAPI<Package[]>(url)
  } catch {
    return DUMMY_PACKAGES
  }
}

// Müsaitlik kontrol et (multi-person ve çalışan seçimi için)
export async function checkAvailability(
  salonId: string,
  serviceId: string,
  date: string,
  numberOfPeople: number,
  employeeId?: string
): Promise<{ available: boolean; slots?: string[] }> {
  try {
    const params = new URLSearchParams({
      date,
      numberOfPeople: numberOfPeople.toString(),
      ...(employeeId && { employeeId }),
    })
    const url = `${API_BASE_URL}/api/salons/${salonId}/services/${serviceId}/availability?${params}`
    return await fetchFromAPI(url)
  } catch {
    // Dummy availability - her saati müsait göster
    return {
      available: true,
      slots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
    }
  }
}

// Randevu oluştur (multi-person support)
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
    const url = `${API_BASE_URL}/api/salons/${salonId}/appointments`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, ...data }),
    })
    if (!response.ok) throw new Error('Appointment creation failed')
    return response.json()
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create appointment',
    }
  }
}

// Geçmiş randevuları getir
export async function getAppointments(salonId: string, customerId: string): Promise<Appointment[]> {
  try {
    const url = `${API_BASE_URL}/api/salons/${salonId}/customers/${customerId}/appointments`
    return await fetchFromAPI<Appointment[]>(url)
  } catch {
    return []
  }
}
