import { API_BASE_URL } from './constants'
import { extractTenantSlug } from './tenant'
import type {
  Salon,
  ServiceCategory,
  Employee,
  Package,
  Appointment,
  ApiResponse,
  BookingContext,
  BookingContextAppointment,
  SalonHomepageResponse,
} from './types'

/**
 * Multi-tenant SaaS API helpers
 */

class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function fetchFromAPI<T>(url: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers || {})

  if (typeof window !== 'undefined') {
    const slugFromHost = extractTenantSlug(window.location.hostname)
    const slugFromQuery = new URLSearchParams(window.location.search).get('slug')
    const tenantSlug = slugFromHost || (slugFromQuery ? slugFromQuery.trim().toLowerCase() : null)
    if (tenantSlug && !headers.has('x-tenant-slug')) {
      headers.set('x-tenant-slug', tenantSlug)
    }
  }

  const response = await fetch(url, { ...options, headers })
  const isJson = response.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await response.json().catch(() => ({})) : null

  if (!response.ok) {
    throw new ApiError(data?.message || `API error: ${response.status}`, response.status)
  }
  return data as T
}

export async function getSalonStrict(): Promise<Salon | null> {
  const url = `${API_BASE_URL}/api/salon/public`
  try {
    const data = await fetchFromAPI<{ salon: any }>(url)
    return {
      id: data.salon.id.toString(),
      name: data.salon.name,
      description: '',
      logoUrl: data.salon.logoUrl || null,
      whatsappPhone: data.salon.whatsappPhone || '',
      headerMessage: 'Hizmetini Seç',
    }
  } catch (error) {
    if (error instanceof ApiError && (error.status === 400 || error.status === 404)) {
      return null
    }
    throw error
  }
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
      whatsappPhone: data.salon.whatsappPhone || '',
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
    services: Array<{ serviceId: string; employeeId?: string; duration?: string; personIndex?: number }>
    packageSelections?: Array<{ serviceId: string; customerPackageId: string }>
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
              personIndex: Number.isInteger(s.personIndex) ? s.personIndex : 1,
              duration: s.duration?.match(/\d+/)?.[0] || "30",
              staffPreference: s.employeeId
                ? { mode: 'SPECIFIC', preferredStaffId: Number(s.employeeId) }
                : { mode: 'ANY' },
          })),
          packageSelections: (data.packageSelections || []).map((row) => ({
            serviceId: row.serviceId,
            customerPackageId: row.customerPackageId,
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
  data: {
    fullName: string;
    phone: string;
    gender: string;
    birthDate: string;
    acceptMarketing: boolean;
    originChannel?: string | null;
    originPhone?: string | null;
    instagramId?: string | null;
    magicToken?: string | null;
  }
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
  numberOfPeople: number,
  serviceGroups?: number[][]
): Promise<{ available: boolean; slots?: string[] }> {
  try {
    const url = `${API_BASE_URL}/availability/slots`
    const peopleCount = Math.max(1, Number(numberOfPeople) || 1)
    const groups = Array.from({ length: peopleCount }, (_, index) => {
      const candidate = serviceGroups?.[index]
      const normalized = Array.isArray(candidate) && candidate.length > 0
        ? candidate.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)
        : [parseInt(serviceId)]
      return {
        personId: `p${index + 1}`,
        services: normalized.length ? normalized : [parseInt(serviceId)],
      }
    })
    const data = await fetchFromAPI<any>(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: date,
        groups,
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
    const appointments: BookingContextAppointment[] = (data.appointments || []).map((item: any) => ({
      id: String(item.id),
      startTime: item.startTime,
      endTime: item.endTime,
      status: String(item.status || ''),
      serviceId:
        item.serviceId !== null && item.serviceId !== undefined
          ? String(item.serviceId)
          : null,
      serviceName: item.serviceName || null,
      servicePrice: typeof item.servicePrice === 'number' ? Number(item.servicePrice) : null,
      staffName: item.staffName || null,
      canUpdate: Boolean(item.canUpdate),
      canCancel: Boolean(item.canCancel),
      canEvaluate: Boolean(item.canEvaluate),
      isFuture: Boolean(item.isFuture),
      groupKey: item.groupKey || '',
      rescheduledFromAppointmentId:
        item.rescheduledFromAppointmentId !== null && item.rescheduledFromAppointmentId !== undefined
          ? String(item.rescheduledFromAppointmentId)
          : null,
      rescheduleBatchId: item.rescheduleBatchId || null,
      customerRating: typeof item.customerRating === 'number' ? Number(item.customerRating) : null,
      customerReview: item.customerReview || null,
    }))

    return {
      customerId: data.customerId?.toString() || null,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerGender: data.customerGender,
      customerLanguage: data.customerLanguage || data.language || null,
      originChannel: data.originChannel || null,
      originPhone: data.originPhone || null,
      originInstagramId: data.originInstagramId || null,
      salonId: data.salonId.toString(),
      salonName: data.salonName,
      isKnownCustomer: data.isKnownCustomer,
      identityLinked: Boolean(data.identityLinked),
      identitySessionId: data.identitySessionId || null,
      appointments,
      activePackages: (data.activePackages || []).map((pkg: any) => ({
        id: String(pkg.id),
        name: pkg.name,
        expiresAt: pkg.expiresAt || null,
        serviceBalances: (pkg.serviceBalances || []).map((balance: any) => ({
          serviceId: String(balance.serviceId),
          serviceName: balance.serviceName || null,
          initialQuota: Number(balance.initialQuota || 0),
          remainingQuota: Number(balance.remainingQuota || 0),
        })),
      })),
    }
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 410)) {
      return null
    }
    console.error('getBookingContextByToken error:', error)
    return null
  }
}

export type ReschedulePreviewCandidate = {
  staffId: number
  name: string
  title?: string | null
  available: boolean
  reason?: string
}

export type ReschedulePreviewItem = {
  appointmentId: number
  serviceId: number
  serviceName: string
  currentStartTime: string
  currentEndTime: string
  newStartTime: string
  newEndTime: string
  preferenceMode: 'ANY' | 'SPECIFIC'
  preferredStaffId: number | null
  selectedStaffId: number | null
  needsManualChoice: boolean
  candidates: ReschedulePreviewCandidate[]
  reason?: string
}

export type ReschedulePreviewResponse = {
  items: ReschedulePreviewItem[]
  requiresManualSelection: boolean
  hasConflicts: boolean
  conflicts: Array<{ appointmentId: number; reason: string }>
}

export type RescheduleCommitResponse = {
  batchId: string
  previousAppointmentIds: number[]
  items: Array<{
    id: number
    startTime: string
    endTime: string
    staffId: number
    serviceId: number
  }>
}

export async function previewBookingReschedule(input: {
  token: string
  appointmentIds: number[]
  newStartTime: string
  assignments?: Array<{ appointmentId: number; staffId: number }>
}): Promise<ReschedulePreviewResponse> {
  const url = `${API_BASE_URL}/api/bookings/reschedule-preview`
  return fetchFromAPI<ReschedulePreviewResponse>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export async function commitBookingReschedule(input: {
  token: string
  appointmentIds: number[]
  newStartTime: string
  assignments?: Array<{ appointmentId: number; staffId: number }>
  idempotencyKey?: string
}): Promise<RescheduleCommitResponse> {
  const url = `${API_BASE_URL}/api/bookings/reschedule-commit`
  return fetchFromAPI<RescheduleCommitResponse>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export async function cancelBookingByToken(input: {
  token: string
  appointmentIds: number[]
}): Promise<{ cancelledAppointmentIds: number[]; count: number }> {
  const url = `${API_BASE_URL}/api/bookings/cancel-by-token`
  return fetchFromAPI<{ cancelledAppointmentIds: number[]; count: number }>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export async function submitBookingFeedback(input: {
  token: string
  appointmentId: number
  rating: number
  review?: string
}): Promise<{
  item: {
    id: number
    customerRating: number | null
    customerReview: string | null
    customerReviewedAt: string | null
  }
}> {
  const url = `${API_BASE_URL}/api/bookings/feedback`
  return fetchFromAPI<{
    item: {
      id: number
      customerRating: number | null
      customerReview: string | null
      customerReviewedAt: string | null
    }
  }>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
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

export async function getSalonHomepageBySlug(slug: string): Promise<SalonHomepageResponse> {
  const url = `${API_BASE_URL}/api/salons/${slug}/homepage`
  return fetchFromAPI<SalonHomepageResponse>(url)
}
