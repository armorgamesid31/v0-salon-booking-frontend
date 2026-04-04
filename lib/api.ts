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
  payload: any

  constructor(message: string, status: number, payload?: any) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
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
    throw new ApiError(data?.message || `API error: ${response.status}`, response.status, data)
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

export type AvailabilityServiceSelection = {
  serviceId: number
  allowedStaffIds?: number[] | null
}

export type AvailabilityGroupInput = {
  personId: string
  services: AvailabilityServiceSelection[]
}

export type AvailabilityDisplayPersonSlot = {
  personId: string
  slotKey: string
  startTime: string
  endTime: string
  staffId: number
  serviceSequence: Array<{
    serviceId: number
    start: string
    end: string
    staffId: number
  }>
}

export type AvailabilityDisplaySlot = {
  displayKey: string
  label: string
  startTime: string
  endTime: string
  personSlots: AvailabilityDisplayPersonSlot[]
}

export type AvailabilitySlotsResult = {
  available: boolean
  date: string
  displaySlots: AvailabilityDisplaySlot[]
  lockToken?: { id: string; expiresAt: string } | null
}

export type WaitlistItem = {
  id: number
  customerId: number | null
  customerName: string
  customerPhone: string
  source: 'CUSTOMER' | 'ADMIN'
  status: 'PENDING' | 'OFFERED' | 'ACCEPTED' | 'CANCELLED' | 'EXPIRED'
  date: string
  timeWindowStart: string
  timeWindowEnd: string
  notes: string | null
  allowNearbyMatches: boolean
  nearbyToleranceMinutes: number
  createdAt: string
  latestOffer: null | {
    id: number
    status: 'PENDING' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'FAILED' | 'CANCELLED'
    channel: 'WHATSAPP' | 'WEB_LINK'
    slotDate: string
    slotStartTime: string
    slotEndTime: string
    expiresAt: string
    offerUrl: string | null
  }
  groups: AvailabilityGroupInput[]
}

export type WaitlistOfferDetails = {
  offerId: number
  token: string
  status: 'PENDING' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'FAILED' | 'CANCELLED'
  expiresAt: string
  slotDate: string
  slotStartTime: string
  slotEndTime: string
  customerName: string
  customerPhone: string
  services: Array<{
    serviceId: number
    start: string
    end: string
    staffId: number
  }>
}

export type BookingAlternatives = {
  date: string | null
  availableDates: string[]
  displaySlots: AvailabilityDisplaySlot[]
  lockToken?: { id: string; expiresAt: string } | null
}

export type RescheduleOptionsResponse = {
  date: string
  slots: Array<{
    time: string
    startTime: string
    endTime: string
    requiresManualSelection: boolean
    preview: ReschedulePreviewResponse
  }>
}

export async function createAppointment(
  salonId: string,
  customerId: string,
  data: {
    services: Array<{ serviceId: string; employeeId?: string; staffOptionIds?: string[]; duration?: string; personIndex?: number }>
    packageSelections?: Array<{ serviceId: string; customerPackageId: string }>
    referralShareToken?: string
    date: string
    time: string
    numberOfPeople: number
    availabilityLockToken?: string | null
    selectedSlots?: Array<{ personId: string; slotKey: string }>
    customerInfo: { name: string; phone: string; email?: string }
  }
): Promise<ApiResponse<Appointment & { pricingBreakdown?: any; appliedCampaigns?: any[] }> & {
  code?: string
  alternatives?: BookingAlternatives
}> {
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
              staffOptionIds: Array.isArray(s.staffOptionIds)
                ? s.staffOptionIds.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)
                : [],
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
          referralShareToken: data.referralShareToken || null,
          availabilityLockToken: data.availabilityLockToken || null,
          selectedSlots: Array.isArray(data.selectedSlots) ? data.selectedSlots : [],
          startTime: start.toISOString(),
          customerName: data.customerInfo.name,
          customerPhone: data.customerInfo.phone,
          source: 'CUSTOMER'
        }),
      })
      return { data: result }
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        error: error.message,
        code: typeof error.payload?.code === 'string' ? error.payload.code : undefined,
        alternatives: error.payload?.alternatives,
      }
    }
    return {
      error: error instanceof Error ? error.message : 'Failed to create appointment',
    }
  }
}

export async function registerCustomer(
  data: {
    fullName: string;
    rawPhone: string;
    normalizedPhone: string;
    countryIso: string;
    gender: string;
    birthDate: string;
    acceptMarketing: boolean;
    originChannel?: string | null;
    originPhone?: string | null;
    instagramId?: string | null;
    magicToken?: string | null;
    confirmDifferentWhatsappNumber?: boolean;
  }
): Promise<
  | { status: 'registered'; customerId: string; success: true }
  | {
      status: 'requires_whatsapp_confirmation'
      success: false
      whatsappPhone?: string | null
      originProfileName?: string | null
      enteredPhone?: string | null
    }
  | { status: 'verification_code_sent'; success: false; verificationId: string }
> {
  const url = `${API_BASE_URL}/api/customers/register`
  const result = await fetchFromAPI<any>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (result.status === 'registered' && result.customerId) {
    return {
      status: 'registered',
      customerId: result.customerId.toString(),
      success: true,
    }
  }
  if (result.status === 'requires_whatsapp_confirmation') {
    return {
      status: 'requires_whatsapp_confirmation',
      success: false,
      whatsappPhone: result.whatsappPhone || null,
      originProfileName: result.originProfileName || null,
      enteredPhone: result.enteredPhone || null,
    }
  }
  return {
    status: 'verification_code_sent',
    success: false,
    verificationId: String(result.verificationId || ''),
  }
}

export async function requestCustomerPhoneVerification(verificationId: string) {
  return fetchFromAPI<{ status: 'verification_code_sent'; verificationId: string }>(
    `${API_BASE_URL}/api/customers/verify-phone/request`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verificationId }),
    },
  )
}

export async function confirmCustomerPhoneVerification(input: { verificationId: string; code: string }) {
  return fetchFromAPI<{ status: 'registered'; customerId: number }>(
    `${API_BASE_URL}/api/customers/verify-phone/confirm`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  )
}

export async function getAvailableDates(input: {
  startDate: string
  endDate: string
  groups: AvailabilityGroupInput[]
}): Promise<{ availableDates: string[]; unavailableDates: string[] }> {
  const url = `${API_BASE_URL}/availability/dates`
  return fetchFromAPI(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export async function checkAvailability(
  salonId: string,
  serviceId: string,
  date: string,
  numberOfPeople: number,
  serviceGroups?: AvailabilityServiceSelection[][]
): Promise<AvailabilitySlotsResult> {
  try {
    const url = `${API_BASE_URL}/availability/slots`
    const peopleCount = Math.max(1, Number(numberOfPeople) || 1)
    const groups = Array.from({ length: peopleCount }, (_, index) => {
      const candidate = serviceGroups?.[index]
      const normalized = Array.isArray(candidate) && candidate.length > 0
        ? candidate
            .map((selection) => ({
              serviceId: Number(selection.serviceId),
              allowedStaffIds: Array.isArray(selection.allowedStaffIds)
                ? selection.allowedStaffIds
                    .map((id) => Number(id))
                    .filter((id, listIndex, list) => Number.isInteger(id) && id > 0 && list.indexOf(id) === listIndex)
                : null,
            }))
            .filter((selection) => Number.isInteger(selection.serviceId) && selection.serviceId > 0)
        : [{ serviceId: parseInt(serviceId, 10), allowedStaffIds: null }]
      return {
        personId: `p${index + 1}`,
        services: normalized.length ? normalized : [{ serviceId: parseInt(serviceId, 10), allowedStaffIds: null }],
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

    return {
      available: Array.isArray(data.displaySlots) && data.displaySlots.length > 0,
      date: data.date || date,
      displaySlots: Array.isArray(data.displaySlots) ? data.displaySlots : [],
      lockToken: data.lockToken || null,
    }
  } catch (error) {
    console.error('checkAvailability error:', error)
    return { available: false, date, displaySlots: [], lockToken: null }
  }
}

export async function createWaitlistRequest(input: {
  date: string
  timeWindowStart: string
  timeWindowEnd: string
  allowNearbyMatches?: boolean
  nearbyToleranceMinutes?: number
  groups: AvailabilityGroupInput[]
  customerId?: string | null
  customerName: string
  customerPhone: string
  customerCountryIso: string
  customerRawPhone: string
  customerNormalizedPhone: string
  notes?: string | null
}): Promise<{ item: WaitlistItem }> {
  return fetchFromAPI(`${API_BASE_URL}/api/waitlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      date: input.date,
      timeWindowStart: input.timeWindowStart,
      timeWindowEnd: input.timeWindowEnd,
      allowNearbyMatches: Boolean(input.allowNearbyMatches),
      nearbyToleranceMinutes: Number.isFinite(input.nearbyToleranceMinutes as number) ? input.nearbyToleranceMinutes : 60,
      groups: input.groups,
      customerId: input.customerId ? Number(input.customerId) : null,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerCountryIso: input.customerCountryIso,
      customerRawPhone: input.customerRawPhone,
      customerNormalizedPhone: input.customerNormalizedPhone,
      notes: input.notes || null,
    }),
  })
}

export async function getWaitlistOffer(token: string): Promise<WaitlistOfferDetails> {
  return fetchFromAPI(`${API_BASE_URL}/api/waitlist/offers/${encodeURIComponent(token)}`)
}

export async function acceptWaitlistOffer(token: string): Promise<{
  appointments: Array<{
    id: number
    startTime: string
    endTime: string
    staffId: number
    serviceId: number
  }>
}> {
  return fetchFromAPI(`${API_BASE_URL}/api/waitlist/offers/${encodeURIComponent(token)}/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function rejectWaitlistOffer(token: string): Promise<{ ok: true }> {
  return fetchFromAPI(`${API_BASE_URL}/api/waitlist/offers/${encodeURIComponent(token)}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
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
      listPrice: typeof item.listPrice === 'number' ? Number(item.listPrice) : null,
      discountTotal: typeof item.discountTotal === 'number' ? Number(item.discountTotal) : null,
      finalPrice: typeof item.finalPrice === 'number' ? Number(item.finalPrice) : null,
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
      originDisplayPhone: data.originDisplayPhone || null,
      originProfileName: data.originProfileName || null,
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
      campaigns: (data.campaigns || []).map((item: any) => ({
        id: String(item.id),
        name: String(item.name || ''),
        type: String(item.type || ''),
        deliveryMode: String(item.deliveryMode || 'MANUAL').toUpperCase() === 'AUTO' ? 'AUTO' : 'MANUAL',
        startsAt: item.startsAt || null,
        endsAt: item.endsAt || null,
        priority: Number(item.priority || 100),
      })),
      campaignWallet: (data.campaignWallet || []).map((item: any) => ({
        campaignId: String(item.campaignId),
        availableAmount: Number(item.availableAmount || 0),
      })),
      campaignEnrollments: (data.campaignEnrollments || []).map((item: any) => ({
        campaignId: String(item.campaignId),
        status: String(item.status || ''),
        enrolledAt: item.enrolledAt || null,
      })),
      campaignShareLinks: (data.campaignShareLinks || []).map((item: any) => ({
        campaignId: String(item.campaignId),
        token: String(item.token || ''),
        status: String(item.status || ''),
        expiresAt: item.expiresAt || null,
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

export async function previewBookingPricing(input: {
  customerId?: string | null
  startTime: string
  services: Array<{ serviceId: string }>
  packageSelections?: Array<{ serviceId: string; customerPackageId: string }>
}) {
  const url = `${API_BASE_URL}/api/bookings/pricing-preview`
  return fetchFromAPI<{
    currency: 'TRY'
    subtotal: number
    discountTotal: number
    finalTotal: number
    lines: Array<{
      serviceId: number
      listPrice: number
      discountTotal: number
      finalPrice: number
      packageCovered: boolean
      appliedCampaigns: Array<{
        campaignId: number
        campaignType: string
        campaignName: string
        amount: number
      }>
    }>
    appliedCampaigns: Array<{
      campaignId: number
      campaignType: string
      campaignName: string
      amount: number
    }>
  }>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export async function enrollReferralCampaign(input: { token: string; campaignId: string }) {
  const url = `${API_BASE_URL}/api/bookings/referral/enroll`
  return fetchFromAPI<{ enrollment: { campaignId: number; shareToken: string } }>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: input.token,
      campaignId: Number(input.campaignId),
    }),
  })
}

export async function getReferralShareLink(input: { token: string; campaignId: string }) {
  const url = `${API_BASE_URL}/api/bookings/referral/share-link`
  return fetchFromAPI<{ share: { campaignId: number; token: string } }>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: input.token,
      campaignId: Number(input.campaignId),
    }),
  })
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

export async function getBookingRescheduleOptions(input: {
  token: string
  appointmentIds: number[]
  date: string
  assignments?: Array<{ appointmentId: number; staffId: number }>
}): Promise<RescheduleOptionsResponse> {
  const url = `${API_BASE_URL}/api/bookings/reschedule-options`
  return fetchFromAPI<RescheduleOptionsResponse>(url, {
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
