'use client'

import React, { useState, useEffect, Suspense, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ChevronDown,
  Search,
  Zap,
  Sparkles,
  Heart,
  Scissors,
  Droplet,
  Flower,
  Wand2,
  Plus,
  Calendar,
  Clock,
  X,
  Check,
  AlertCircle,
  Hand,
  Lightbulb,
  MessageCircle,
  Megaphone,
  ClipboardList,
  CalendarCheck2,
  RefreshCcw,
  Ban,
  PencilLine,
  Star,
} from 'lucide-react'
import type { ServiceItem as ImportedServiceItem, ServiceCategory, Employee, ActiveCustomerPackage, BookingContextAppointment } from '@/lib/types'
import {
  getBookingContextByToken,
  registerCustomer,
  requestCustomerPhoneVerification,
  confirmCustomerPhoneVerification,
  getSalon,
  getServices,
  getStaffForService,
  getAvailableDates,
  checkAvailability,
  createAppointment,
  createWaitlistRequest,
  getWaitlistOffer,
  acceptWaitlistOffer,
  rejectWaitlistOffer,
  enrollReferralCampaign,
  getReferralShareLink,
  previewBookingPricing,
  getBookingRescheduleOptions,
  previewBookingReschedule,
  commitBookingReschedule,
  cancelBookingByToken,
  submitBookingFeedback,
  type AvailabilityDisplaySlot,
  type AvailabilityServiceSelection,
  type ReschedulePreviewResponse,
  type WaitlistOfferDetails,
} from '@/lib/api'
import LanguageSelector from '@/components/language-selector'
import { BOOKING_TEXT, DEFAULT_LANGUAGE, detectBrowserLanguage, LOCALE_MAP, normalizeLanguage, type LanguageCode } from '@/lib/i18n'
import { DUMMY_SALON } from '@/lib/constants'
import { extractTenantSlug } from '@/lib/tenant'
import { getRuntimeContent, getRuntimeText, type RuntimeContentMap } from '@/lib/runtime-content'
import {
  countryIsoToPrefix,
  formatPhoneForDisplayFromDigits,
  getDefaultCountryForLanguage,
  getPhoneCountryOptions,
  parsePhoneInput,
} from '@/lib/phone'

// Fixed icons helper
const getIconComponent = (categoryKey: string) => {
  switch (categoryKey) {
    case 'FACIAL': return <Sparkles className="w-5 h-5" />
    case 'MEDICAL': return <Wand2 className="w-5 h-5" />
    case 'LASER': return <Zap className="w-5 h-5" />
    case 'WAX': return <Droplet className="w-5 h-5" />
    case 'BODY': return <Heart className="w-5 h-5" />
    case 'NAIL': return <Hand className="w-5 h-5" />
    case 'HAIR': return <Scissors className="w-5 h-5" />
    case 'CONSULTATION': return <Lightbulb className="w-5 h-5" />
    case 'OTHER': return <Flower className="w-5 h-5" />
    default: return <Sparkles className="w-5 h-5" />
  }
}

interface BookingDashboardProps {
  forcedLanguage?: string
}

type RescheduleModalState = {
  appointmentIds: number[]
  date: string
  time: string
  loading: boolean
  suggestionsLoading: boolean
  suggestedSlots: Array<{
    time: string
    startTime: string
    endTime: string
    requiresManualSelection: boolean
    preview: ReschedulePreviewResponse
  }>
  preview: ReschedulePreviewResponse | null
  assignments: Record<number, number>
  error: string | null
}

type DateOption = {
  key: string
  day: number
  label: string
  fullDate: string
  status: 'loading' | 'available' | 'full'
}

type WaitlistModalState = {
  open: boolean
  submitting: boolean
  successMessage: string | null
  error: string | null
  timeWindowStart: string
  timeWindowEnd: string
  allowNearbyMatches: boolean
  notes: string
  customerName: string
  customerPhone: string
  customerCountryIso: string
}

type RegistrationStep = 'form' | 'whatsapp-confirm' | 'otp'

type SelectedServiceEntry = {
  entryId: string
  service: ImportedServiceItem
  source: 'MANUAL' | 'PACKAGE'
  packageId?: string
  personIndex: number
}

type PersonPickerState = {
  source: 'MANUAL' | 'PACKAGE'
  serviceId: string
  packageId?: string
  serviceName?: string | null
  categoryName?: string
  serviceData: ImportedServiceItem
  requiresSpecialist: boolean
}

type SpecialistBatchModalState = {
  entries: Array<{ entryId: string; personIndex: number }>
  serviceName: string
  staff: Employee[]
  cursor: number
  choices: Record<string, { mode: 'ANY' | 'SPECIFIC'; staffIds: string[] }>
}

const getMagicToken = (params: URLSearchParams): string | null => {
  const direct = params.get('token')
  if (direct) return direct

  for (const [key, value] of params.entries()) {
    if (!value && key && key.length >= 8 && key !== 'salonId' && key !== 'slug' && key !== 'lang') {
      return key
    }
  }

  return null
}

const TOKEN_STORAGE_KEY = 'booking_magic_token'

const looksLikeToken = (value: string | null | undefined): value is string => {
  const candidate = (value || '').trim()
  return /^[A-Za-z0-9_-]{8,}$/.test(candidate)
}

const parseTokenFromRawSearch = (rawSearch: string): string | null => {
  const search = (rawSearch || '').replace(/^\?/, '')
  if (!search) return null

  const chunks = search.split('&').map((p) => p.trim()).filter(Boolean)
  for (const chunk of chunks) {
    const [rawKey, rawValue] = chunk.split('=')
    const key = decodeURIComponent(rawKey || '')
    const value = decodeURIComponent(rawValue || '')

    if (key === 'token' && looksLikeToken(value)) {
      return value
    }

    if (looksLikeToken(key) && !value && key !== 'lang' && key !== 'slug' && key !== 'salonId') {
      return key
    }
  }

  return null
}

const toInputDate = (iso: string): string => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const toInputTime = (iso: string): string => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

const toDateOption = (isoDate: string, language: LanguageCode): DateOption => {
  const date = new Date(`${isoDate}T00:00:00`)
  return {
    key: isoDate,
    day: date.getDate(),
    label: new Intl.DateTimeFormat(LOCALE_MAP[language], { weekday: 'short' }).format(date),
    fullDate: isoDate,
    status: 'loading',
  }
}

const appointmentStatusMeta = (
  status: string,
  labels: {
    statusBooked: string
    statusConfirmed: string
    statusUpdated: string
    statusCompleted: string
    statusCancelled: string
    statusNoShow: string
    statusDefault: string
  },
) => {
  const normalized = String(status || '').trim().toUpperCase()
  if (normalized === 'COMPLETED') {
    return {
      label: labels.statusCompleted,
      className: 'border-emerald-400/35 bg-emerald-500/10 text-emerald-700',
    }
  }
  if (normalized === 'CANCELLED') {
    return {
      label: labels.statusCancelled,
      className: 'border-slate-400/35 bg-slate-500/10 text-slate-700',
    }
  }
  if (normalized === 'NO_SHOW') {
    return {
      label: labels.statusNoShow,
      className: 'border-amber-400/35 bg-amber-500/10 text-amber-700',
    }
  }
  if (normalized === 'CONFIRMED') {
    return {
      label: labels.statusConfirmed,
      className: 'border-sky-400/35 bg-sky-500/10 text-sky-700',
    }
  }
  if (normalized === 'UPDATED') {
    return {
      label: labels.statusUpdated,
      className: 'border-violet-400/35 bg-violet-500/10 text-violet-700',
    }
  }
  return {
    label: labels.statusBooked || labels.statusDefault,
    className: 'border-primary/35 bg-primary/10 text-primary',
  }
}

const packageUsageKey = (packageId: string, serviceId: string) => `${packageId}:${serviceId}`

const canUpdateAppointment = (item: BookingContextAppointment) => {
  const status = String(item.status || '').trim().toUpperCase()
  const computed = status === 'BOOKED' || status === 'CONFIRMED' || status === 'UPDATED'
  return Boolean(item.canUpdate) || computed
}

const canCancelAppointment = (item: BookingContextAppointment) => {
  const status = String(item.status || '').trim().toUpperCase()
  const computed = status === 'BOOKED' || status === 'CONFIRMED' || status === 'UPDATED'
  return Boolean(item.canCancel) || computed
}

const canEvaluateAppointment = (item: BookingContextAppointment) => {
  const status = String(item.status || '').trim().toUpperCase()
  const isPast = new Date(item.endTime).getTime() <= Date.now()
  const computed = isPast && status === 'COMPLETED'
  return Boolean(item.canEvaluate) || computed
}

const SalonDashboardContent = ({ forcedLanguage }: BookingDashboardProps) => {
  const searchParams = useSearchParams()
  const searchParamsString = searchParams.toString()
  const [stableMagicToken, setStableMagicToken] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [specialistModal, setSpecialistModal] = useState<{entryId: string, personIndex: number, service: ImportedServiceItem, staff: Employee[]} | null>(null)
  const [personPicker, setPersonPicker] = useState<PersonPickerState | null>(null)
  const [personPickerSelections, setPersonPickerSelections] = useState<number[]>([])
  const [specialistBatchModal, setSpecialistBatchModal] = useState<SpecialistBatchModalState | null>(null)
  const [selectedSpecialistIds, setSelectedSpecialistIds] = useState<Record<string, string>>({})
  const [selectedSpecialistOptionIds, setSelectedSpecialistOptionIds] = useState<Record<string, string[]>>({})
  const [packageUsageByKey, setPackageUsageByKey] = useState<Record<string, number>>({})
  const [selectedServices, setSelectedServices] = useState<SelectedServiceEntry[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [selectedGender, setSelectedGender] = useState<'female' | 'male'>('female')
  const [numberOfPeople, setNumberOfPeople] = useState<number>(1)
  const [isKnownCustomer, setIsKnownCustomer] = useState<boolean>(false)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [salonId, setSalonId] = useState<string>('')
  const [originChannel, setOriginChannel] = useState<string | null>(null)
  const [originPhone, setOriginPhone] = useState<string | null>(null)
  const [originDisplayPhone, setOriginDisplayPhone] = useState<string | null>(null)
  const [originProfileName, setOriginProfileName] = useState<string | null>(null)
  const [originInstagramId, setOriginInstagramId] = useState<string | null>(null)
  const [salonData, setSalonData] = useState<any>(null)
  const [availableServices, setAvailableServices] = useState<ServiceCategory[]>([])
  const [activePackages, setActivePackages] = useState<ActiveCustomerPackage[]>([])
  const [activeCampaigns, setActiveCampaigns] = useState<Array<{
    id: string
    name: string
    type: string
    deliveryMode: 'AUTO' | 'MANUAL'
    startsAt?: string | null
    endsAt?: string | null
    priority?: number
  }>>([])
  const [campaignWallet, setCampaignWallet] = useState<Array<{ campaignId: string; availableAmount: number }>>([])
  const [campaignEnrollments, setCampaignEnrollments] = useState<Array<{ campaignId: string; status: string }>>([])
  const [campaignShareLinks, setCampaignShareLinks] = useState<Array<{ campaignId: string; token: string; status: string }>>([])
  const [recentAppointments, setRecentAppointments] = useState<BookingContextAppointment[]>([])
  const [rescheduleModal, setRescheduleModal] = useState<RescheduleModalState | null>(null)
  const [availableSlots, setAvailableSlots] = useState<AvailabilityDisplaySlot[]>([])
  const [language, setLanguage] = useState<LanguageCode>(DEFAULT_LANGUAGE)
  const [runtimeContent, setRuntimeContent] = useState<RuntimeContentMap>({})
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>('form')
  const [registrationError, setRegistrationError] = useState<string | null>(null)
  const [registrationSubmitting, setRegistrationSubmitting] = useState(false)
  const [registrationVerificationId, setRegistrationVerificationId] = useState<string | null>(null)
  const [registrationOtpCode, setRegistrationOtpCode] = useState('')
  const [registrationOtpSending, setRegistrationOtpSending] = useState(false)
  const [registrationWhatsappConfirmChecked, setRegistrationWhatsappConfirmChecked] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [feedbackModal, setFeedbackModal] = useState<{
    appointmentId: number
    rating: number
    review: string
    saving: boolean
    error: string | null
  } | null>(null)
  const [cancelConfirmModal, setCancelConfirmModal] = useState<{
    appointmentIds: number[]
    loading: boolean
    error: string | null
  } | null>(null)
  const [isBooking, setIsBooking] = useState(false)
  const [lastAppointmentDetails, setLastAppointmentDetails] = useState<any>(null)
  const [logoError, setLogoError] = useState(false)
  const [packagesOpen, setPackagesOpen] = useState(false)
  const [campaignsOpen, setCampaignsOpen] = useState(false)
  const [appointmentsOpen, setAppointmentsOpen] = useState(false)
  const [expandedAppointmentGroupKey, setExpandedAppointmentGroupKey] = useState<string | null>(null)
  const [dateOptions, setDateOptions] = useState<DateOption[]>([])
  const [availabilityLockToken, setAvailabilityLockToken] = useState<string | null>(null)
  const [selectedDisplaySlot, setSelectedDisplaySlot] = useState<AvailabilityDisplaySlot | null>(null)
  const [waitlistModal, setWaitlistModal] = useState<WaitlistModalState>({
    open: false,
    submitting: false,
    successMessage: null,
    error: null,
    timeWindowStart: '10:00',
    timeWindowEnd: '18:00',
    allowNearbyMatches: false,
    notes: '',
    customerName: '',
    customerPhone: '',
    customerCountryIso: 'TR',
  })
  const [waitlistOfferToken, setWaitlistOfferToken] = useState<string | null>(null)
  const [waitlistOffer, setWaitlistOffer] = useState<WaitlistOfferDetails | null>(null)
  const [waitlistOfferLoading, setWaitlistOfferLoading] = useState(false)
  const [waitlistOfferError, setWaitlistOfferError] = useState<string | null>(null)
  const [waitlistOfferActionLoading, setWaitlistOfferActionLoading] = useState(false)
  const [waitlistOfferActionMessage, setWaitlistOfferActionMessage] = useState<string | null>(null)
  const [pricingPreview, setPricingPreview] = useState<null | {
    subtotal: number
    discountTotal: number
    finalTotal: number
    appliedCampaigns: Array<{ campaignId: number; campaignName: string; amount: number }>
  }>(null)
  const [campaignActionBusyId, setCampaignActionBusyId] = useState<string | null>(null)

  const [registrationForm, setRegistrationForm] = useState({
    fullName: '',
    phone: '',
    countryIso: 'TR',
    gender: 'female' as 'female' | 'male',
    birthDate: '',
    acceptMarketing: false,
  })
  const text = useMemo(() => {
    const fallback = BOOKING_TEXT[language]
    const dashboardFallback = fallback.dashboard || BOOKING_TEXT.en.dashboard!

    return {
      ...fallback,
      welcomeDefault: getRuntimeText(runtimeContent, 'common.welcomeDefault', fallback.welcomeDefault),
      welcomeBack: (name: string) => {
        const template = getRuntimeText(runtimeContent, 'common.welcomeBackTemplate', '')
        return template ? template.replace('{name}', name) : fallback.welcomeBack(name)
      },
      people: getRuntimeText(runtimeContent, 'common.people', fallback.people),
      searchPlaceholder: getRuntimeText(runtimeContent, 'common.searchPlaceholder', fallback.searchPlaceholder),
      add: getRuntimeText(runtimeContent, 'common.add', fallback.add),
      added: getRuntimeText(runtimeContent, 'common.added', fallback.added),
      selectDate: getRuntimeText(runtimeContent, 'common.selectDate', fallback.selectDate),
      selectTime: getRuntimeText(runtimeContent, 'common.selectTime', fallback.selectTime),
      noAppointment: getRuntimeText(runtimeContent, 'common.noAppointment', fallback.noAppointment),
      confirmAppointment: getRuntimeText(runtimeContent, 'common.confirmAppointment', fallback.confirmAppointment),
      selectSpecialist: getRuntimeText(runtimeContent, 'common.selectSpecialist', fallback.selectSpecialist),
      confirmSelection: getRuntimeText(runtimeContent, 'common.confirmSelection', fallback.confirmSelection),
      completeProfile: getRuntimeText(runtimeContent, 'common.completeProfile', fallback.completeProfile),
      fullName: getRuntimeText(runtimeContent, 'common.fullName', fallback.fullName),
      phone: getRuntimeText(runtimeContent, 'common.phone', fallback.phone),
      registerContinue: getRuntimeText(runtimeContent, 'common.registerContinue', fallback.registerContinue),
      approvalTitle: getRuntimeText(runtimeContent, 'common.approvalTitle', fallback.approvalTitle),
      dateAndTime: getRuntimeText(runtimeContent, 'common.dateAndTime', fallback.dateAndTime),
      details: getRuntimeText(runtimeContent, 'common.details', fallback.details),
      services: getRuntimeText(runtimeContent, 'common.services', fallback.services),
      completeBooking: getRuntimeText(runtimeContent, 'common.completeBooking', fallback.completeBooking),
      bookingInProgress: getRuntimeText(runtimeContent, 'common.bookingInProgress', fallback.bookingInProgress),
      successTitle: getRuntimeText(runtimeContent, 'common.successTitle', fallback.successTitle),
      successInfo: getRuntimeText(runtimeContent, 'common.successInfo', fallback.successInfo),
      successButton: getRuntimeText(runtimeContent, 'common.successButton', fallback.successButton),
      openWhatsapp: getRuntimeText(runtimeContent, 'common.openWhatsapp', fallback.openWhatsapp),
      loading: getRuntimeText(runtimeContent, 'common.loading', fallback.loading),
      fillInfoError: getRuntimeText(runtimeContent, 'errors.fillInfo', fallback.fillInfoError),
      genericError: getRuntimeText(runtimeContent, 'errors.generic', fallback.genericError),
      bookingFailed: getRuntimeText(runtimeContent, 'errors.bookingFailed', fallback.bookingFailed),
      dashboard: {
        ...dashboardFallback,
        packagesTitle: getRuntimeText(runtimeContent, 'booking.packagesTitle', dashboardFallback.packagesTitle),
        appointmentsTitle: getRuntimeText(runtimeContent, 'booking.appointmentsTitle', dashboardFallback.appointmentsTitle),
        packageNoActive: getRuntimeText(runtimeContent, 'booking.packageNoActive', dashboardFallback.packageNoActive),
        appointmentsEmpty: getRuntimeText(runtimeContent, 'booking.appointmentsEmpty', dashboardFallback.appointmentsEmpty),
      },
    }
  }, [language, runtimeContent])

  const selectedDateStatus = useMemo(() => {
    if (!selectedDate) return null
    return dateOptions.find((option) => option.fullDate === selectedDate)?.status || null
  }, [dateOptions, selectedDate])

  const phoneCountryOptions = useMemo(() => getPhoneCountryOptions(language), [language])
  const registrationPhoneMeta = useMemo(
    () => parsePhoneInput(registrationForm.phone, registrationForm.countryIso),
    [registrationForm.countryIso, registrationForm.phone],
  )
  const waitlistPhoneMeta = useMemo(
    () => parsePhoneInput(waitlistModal.customerPhone, waitlistModal.customerCountryIso),
    [waitlistModal.customerCountryIso, waitlistModal.customerPhone],
  )
  const registrationCountryLabel = useMemo(() => {
    const option = phoneCountryOptions.find((item) => item.iso === registrationForm.countryIso)
    return option?.label || `${registrationForm.countryIso}${countryIsoToPrefix(registrationForm.countryIso) ? ` (${countryIsoToPrefix(registrationForm.countryIso)})` : ''}`
  }, [phoneCountryOptions, registrationForm.countryIso])
  const registrationCanContinue = useMemo(() => {
    return (
      registrationForm.fullName.trim().length >= 2 &&
      registrationPhoneMeta.isValid &&
      registrationPhoneMeta.isMobile &&
      Boolean(registrationForm.birthDate) &&
      Boolean(registrationForm.gender)
    )
  }, [registrationForm.birthDate, registrationForm.fullName, registrationForm.gender, registrationPhoneMeta.isMobile, registrationPhoneMeta.isValid])

  const waitlistDefaultStart = useMemo(() => {
    if (selectedDisplaySlot?.startTime) return selectedDisplaySlot.startTime
    if (availableSlots[0]?.startTime) return availableSlots[0].startTime
    return '10:00'
  }, [availableSlots, selectedDisplaySlot])

  const waitlistDefaultEnd = useMemo(() => {
    if (selectedDisplaySlot?.endTime) return selectedDisplaySlot.endTime
    if (availableSlots[availableSlots.length - 1]?.endTime) return availableSlots[availableSlots.length - 1].endTime
    return '18:00'
  }, [availableSlots, selectedDisplaySlot])

  useEffect(() => {
    const fromSearchParams = getMagicToken(searchParams)
    const fromRawSearch = typeof window !== 'undefined' ? parseTokenFromRawSearch(window.location.search) : null
    const fromStorage = typeof window !== 'undefined' ? window.sessionStorage.getItem(TOKEN_STORAGE_KEY) : null

    const resolved = fromSearchParams || fromRawSearch || fromStorage
    if (resolved && looksLikeToken(resolved)) {
      setStableMagicToken(resolved)
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(TOKEN_STORAGE_KEY, resolved)
      }
    }
  }, [searchParamsString, searchParams])

  useEffect(() => {
    const tokenFromQuery = searchParams.get('waitlistOffer')
    setWaitlistOfferToken(tokenFromQuery && looksLikeToken(tokenFromQuery) ? tokenFromQuery : null)
  }, [searchParams])

  useEffect(() => {
    setWaitlistModal((prev) => ({
      ...prev,
      customerName: customerName || registrationForm.fullName,
      customerPhone: registrationForm.phone,
      customerCountryIso: registrationForm.countryIso,
    }))
  }, [customerName, registrationForm.countryIso, registrationForm.fullName, registrationForm.phone])

  useEffect(() => {
    if (!waitlistModal.open) return
    setWaitlistModal((prev) => ({
      ...prev,
      timeWindowStart: waitlistDefaultStart,
      timeWindowEnd: waitlistDefaultEnd,
      error: null,
      successMessage: null,
    }))
  }, [waitlistDefaultEnd, waitlistDefaultStart, waitlistModal.open])

  useEffect(() => {
    if (forcedLanguage) {
      setLanguage(normalizeLanguage(forcedLanguage))
      return
    }

    const queryLang = searchParams.get('lang')
    const savedLang = typeof window !== 'undefined' ? window.localStorage.getItem('preferredLanguage') : null
    const lang = normalizeLanguage(queryLang || savedLang || detectBrowserLanguage())
    setLanguage(lang)
  }, [searchParams, forcedLanguage])

  useEffect(() => {
    const preferredCountryIso = getDefaultCountryForLanguage(language)
    setRegistrationForm((prev) => (prev.countryIso === preferredCountryIso ? prev : { ...prev, countryIso: preferredCountryIso, phone: '' }))
    setWaitlistModal((prev) => (prev.customerCountryIso === preferredCountryIso ? prev : { ...prev, customerCountryIso: preferredCountryIso }))
  }, [language])

  useEffect(() => {
    let active = true
    if (!waitlistOfferToken) {
      setWaitlistOffer(null)
      setWaitlistOfferError(null)
      setWaitlistOfferActionMessage(null)
      return
    }

    setWaitlistOfferLoading(true)
    setWaitlistOfferError(null)
    void getWaitlistOffer(waitlistOfferToken)
      .then((offer) => {
        if (!active) return
        setWaitlistOffer(offer)
      })
      .catch((error: any) => {
        if (!active) return
        setWaitlistOffer(null)
        setWaitlistOfferError(error?.message || 'Failed to load waitlist offer.')
      })
      .finally(() => {
        if (active) setWaitlistOfferLoading(false)
      })

    return () => {
      active = false
    }
  }, [waitlistOfferToken])

  useEffect(() => {
    let active = true

    const params = new URLSearchParams(searchParamsString)
    const tenantSlug = extractTenantSlug(window.location.hostname) || params.get('slug') || undefined
    const requestedSalonId = salonId || params.get('salonId') || undefined

    getRuntimeContent({
      surface: 'booking_page',
      page: 'booking_dashboard',
      locale: language,
      tenantSlug,
      salonId: requestedSalonId,
    }).then((content) => {
      if (active) {
        setRuntimeContent(content)
      }
    })

    return () => {
      active = false
    }
  }, [language, salonId, searchParamsString])

  useEffect(() => {
    if (isKnownCustomer && customerName) {
      setWelcomeMessage(text.welcomeBack(customerName))
      return
    }
    setWelcomeMessage(text.welcomeDefault)
  }, [isKnownCustomer, customerName, text, language])

  // Calculate current price based on overrides
  const fallbackTotalPrice = selectedServices.reduce((sum, entry) => {
    if (entry.source === 'PACKAGE') {
      return sum
    }
    const service = entry.service
    return sum + (service.salePrice || service.originalPrice || 0)
  }, 0);
  const totalPrice = typeof pricingPreview?.finalTotal === 'number' ? pricingPreview.finalTotal : fallbackTotalPrice

  const flatServiceCatalog = useMemo(() => {
    return availableServices.flatMap((category) =>
      category.services.map((service) => ({
        categoryName: category.name,
        service,
      })),
    )
  }, [availableServices])

  const selectedServiceGroups = useMemo<AvailabilityServiceSelection[][]>(() => {
    return Array.from({ length: numberOfPeople }, (_, index) => {
      const personIndex = index + 1
      return selectedServices
        .filter((entry) => entry.personIndex === personIndex)
        .map((entry) => {
          const specialistIds = selectedSpecialistOptionIds[entry.entryId] || (selectedSpecialistIds[entry.entryId] ? [selectedSpecialistIds[entry.entryId]] : [])
          const normalizedIds = specialistIds
            .map((id) => Number(id))
            .filter((id, listIndex, list) => Number.isInteger(id) && id > 0 && list.indexOf(id) === listIndex)

          return {
            serviceId: Number(entry.service.id),
            allowedStaffIds: normalizedIds.length ? normalizedIds : null,
          }
        })
        .filter((selection) => Number.isInteger(selection.serviceId) && selection.serviceId > 0)
    })
  }, [numberOfPeople, selectedServices, selectedSpecialistIds, selectedSpecialistOptionIds])

  useEffect(() => {
    setPackageUsageByKey({})
  }, [activePackages.length, customerId])

  const loadSalonAndServices = async (sId: string, gender: string) => {
    try {
      const [salon, services] = await Promise.all([
        getSalon(sId),
        getServices(sId, gender),
      ])
      setSalonData(salon)
      setAvailableServices(services)
    } catch (err) {
      console.error('Critical load error:', err)
    }
  }

  const applyBookingContext = async (context: Awaited<ReturnType<typeof getBookingContextByToken>>): Promise<void> => {
    if (!context) return
    if (!forcedLanguage && context.customerLanguage) {
      const normalized = normalizeLanguage(context.customerLanguage)
      setLanguage(normalized)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('preferredLanguage', normalized)
      }
    }
    setSalonId(context.salonId)
    setIsKnownCustomer(context.isKnownCustomer)
    setOriginChannel(context.originChannel || null)
    setOriginPhone(context.originPhone || null)
    setOriginDisplayPhone(context.originDisplayPhone || context.originPhone || null)
    setOriginProfileName(context.originProfileName || null)
    setOriginInstagramId(context.originInstagramId || null)
    setActivePackages(context.activePackages || [])
    setActiveCampaigns(context.campaigns || [])
    setCampaignWallet(context.campaignWallet || [])
    setCampaignEnrollments((context.campaignEnrollments || []).map((item) => ({ campaignId: item.campaignId, status: item.status })))
    setCampaignShareLinks((context.campaignShareLinks || []).map((item) => ({ campaignId: item.campaignId, token: item.token, status: item.status })))
    setRecentAppointments(context.appointments || [])
    if (context.isKnownCustomer && context.customerId) {
      setCustomerId(context.customerId)
      setCustomerName(context.customerName || '')
    } else {
      setCustomerId(null)
      setCustomerName('')
    }
    if (!context.isKnownCustomer) {
      const normalizedGender = context.customerGender === 'male' ? 'male' : 'female'
      setRegistrationForm((prev) => ({
        ...prev,
        fullName: context.customerName || prev.fullName,
        phone: formatPhoneForDisplayFromDigits(context.customerPhone || '', prev.countryIso) || prev.phone,
        gender: normalizedGender || prev.gender,
      }))
    }
    const gender = context.customerGender === 'male' ? 'male' : 'female'
    setSelectedGender(gender)
    await loadSalonAndServices(context.salonId, gender)
  }

  const reloadBookingContext = async (): Promise<void> => {
    if (!stableMagicToken) return
    const context = await getBookingContextByToken(stableMagicToken)
    if (context) {
      await applyBookingContext(context)
    }
  }

  // Fetch initial salon and services data
  useEffect(() => {
    const token = stableMagicToken

    if (token) {
      getBookingContextByToken(token).then((context) => {
        if (context) {
          void applyBookingContext(context)
          return
        }
        const fallbackSalonId = searchParams.get('salonId') || '1'
        setSalonId(fallbackSalonId)
        setIsKnownCustomer(false)
        setCustomerId(null)
        setCustomerName('')
        setActivePackages([])
        setActiveCampaigns([])
        setCampaignWallet([])
        setCampaignEnrollments([])
        setCampaignShareLinks([])
        setRecentAppointments([])
        void loadSalonAndServices(fallbackSalonId, selectedGender)
      })
    } else {
      const sId = searchParams.get('salonId') || '1'
      setSalonId(sId)
      setIsKnownCustomer(false)
      setCustomerId(null)
      setCustomerName('')
      setActivePackages([])
      setActiveCampaigns([])
      setCampaignWallet([])
      setCampaignEnrollments([])
      setCampaignShareLinks([])
      setRecentAppointments([])
      void loadSalonAndServices(sId, selectedGender)
    }
  }, [searchParams, forcedLanguage, stableMagicToken])

  // Refetch services when gender changes
  useEffect(() => {
      if (salonId) {
          getServices(salonId, selectedGender).then(setAvailableServices)
          setSelectedServices([])
          setPackageUsageByKey({})
          setSelectedSpecialistIds({})
          setSelectedSpecialistOptionIds({})
          setSelectedDate(null)
          setSelectedTimeSlot(null)
      }
  }, [selectedGender, salonId])

  useEffect(() => {
    let active = true

    if (!selectedServices.length || !salonId) {
      setDateOptions([])
      setSelectedDate(null)
      setAvailableSlots([])
      setAvailabilityLockToken(null)
      setSelectedDisplaySlot(null)
      setSelectedTimeSlot(null)
      return
    }

    const startDate = new Date()
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 29)
    const allDates = Array.from({ length: 30 }, (_, index) => {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + index)
      return date.toISOString().split('T')[0]
    })
    const groups = selectedServiceGroups
      .map((services, index) => ({ personId: `p${index + 1}`, services }))
      .filter((group) => group.services.length > 0)

    setDateOptions(allDates.map((dateValue) => toDateOption(dateValue, language)))
    setSelectedDate((prev) => (prev && allDates.includes(prev) ? prev : allDates[0] || null))
    setAvailableSlots([])
    setAvailabilityLockToken(null)
    setSelectedDisplaySlot(null)
    setSelectedTimeSlot(null)

    const fetchChunk = async (chunkDates: string[]) => {
      if (!chunkDates.length) return
      const result = await getAvailableDates({
        startDate: chunkDates[0],
        endDate: chunkDates[chunkDates.length - 1],
        groups,
      })
      if (!active) return

      const availableSet = new Set(result.availableDates || [])
      const unavailableSet = new Set(result.unavailableDates || [])
      setDateOptions((prev) =>
        prev.map((option) => {
          if (!chunkDates.includes(option.fullDate)) return option
          if (availableSet.has(option.fullDate)) return { ...option, status: 'available' as const }
          if (unavailableSet.has(option.fullDate)) return { ...option, status: 'full' as const }
          return option
        }),
      )
    }

    void (async () => {
      try {
        const chunks = Array.from({ length: Math.ceil(allDates.length / 7) }, (_, index) =>
          allDates.slice(index * 7, index * 7 + 7),
        )

        const [firstChunk, ...remainingChunks] = chunks
        if (firstChunk?.length) {
          await fetchChunk(firstChunk)
        }

        await Promise.all(remainingChunks.map((chunk) => fetchChunk(chunk)))
      } catch {
        if (!active) return
        setDateOptions((prev) => prev.map((option) => ({ ...option, status: 'loading' })))
      }
    })()

    return () => {
      active = false
    }
  }, [language, numberOfPeople, salonId, selectedServiceGroups, selectedServices.length])

  useEffect(() => {
    let active = true

    if (!selectedDate || !selectedServices.length || !salonId) {
      setAvailableSlots([])
      setAvailabilityLockToken(null)
      setSelectedDisplaySlot(null)
      setSelectedTimeSlot(null)
      return
    }

    const fallbackServiceId = selectedServices[0].service.id
    void checkAvailability(salonId, fallbackServiceId, selectedDate, numberOfPeople, selectedServiceGroups).then((result) => {
      if (!active) return
      setAvailableSlots(result.displaySlots || [])
      setAvailabilityLockToken(result.lockToken?.id || null)
      setSelectedDisplaySlot((prev) => {
        if (!prev) return null
        return result.displaySlots.find((slot) => slot.displayKey === prev.displayKey) || null
      })
      setSelectedTimeSlot((prev) => {
        if (!prev) return null
        return result.displaySlots.some((slot) => slot.label === prev) ? prev : null
      })
    })

    return () => {
      active = false
    }
  }, [numberOfPeople, salonId, selectedDate, selectedServiceGroups, selectedServices])

  useEffect(() => {
    setSelectedServices((prev) => {
      const filtered = prev.filter((entry) => entry.personIndex <= numberOfPeople)
      const validEntryIds = new Set(filtered.map((entry) => entry.entryId))
      setSelectedSpecialistIds((prevMap) => {
        const next: Record<string, string> = {}
        for (const [entryId, staffId] of Object.entries(prevMap)) {
          if (validEntryIds.has(entryId)) {
            next[entryId] = staffId
          }
        }
        return next
      })
      setSelectedSpecialistOptionIds((prevMap) => {
        const next: Record<string, string[]> = {}
        for (const [entryId, ids] of Object.entries(prevMap)) {
          if (validEntryIds.has(entryId)) {
            next[entryId] = ids
          }
        }
        return next
      })
      return filtered
    })
  }, [numberOfPeople])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (!salonId || !selectedServices.length) {
        if (!cancelled) setPricingPreview(null)
        return
      }

      try {
        const dateIso =
          selectedDate && selectedTimeSlot
            ? (() => {
                const d = new Date(`${selectedDate}T00:00:00`)
                const [h, m] = selectedTimeSlot.split(':').map((n) => Number(n))
                d.setHours(h || 0, m || 0, 0, 0)
                return d.toISOString()
              })()
            : new Date().toISOString()

        const pricing = await previewBookingPricing({
          customerId,
          startTime: dateIso,
          services: selectedServices.map((entry) => ({ serviceId: entry.service.id })),
          packageSelections: selectedServices
            .filter((entry) => entry.source === 'PACKAGE' && Boolean(entry.packageId))
            .map((entry) => ({
              serviceId: entry.service.id,
              customerPackageId: String(entry.packageId),
            })),
        })
        if (!cancelled) {
          setPricingPreview({
            subtotal: pricing.subtotal,
            discountTotal: pricing.discountTotal,
            finalTotal: pricing.finalTotal,
            appliedCampaigns: pricing.appliedCampaigns || [],
          })
        }
      } catch {
        if (!cancelled) setPricingPreview(null)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [salonId, customerId, selectedServices, selectedDate, selectedTimeSlot])

  const handleCampaignJoin = async (campaignId: string) => {
    if (!stableMagicToken) {
      alert('Magic token is required.')
      return
    }
    setCampaignActionBusyId(`join:${campaignId}`)
    try {
      const result = await enrollReferralCampaign({
        token: stableMagicToken,
        campaignId,
      })
      setCampaignEnrollments((prev) => {
        const others = prev.filter((item) => String(item.campaignId) !== String(campaignId))
        return [...others, { campaignId: String(campaignId), status: 'ENROLLED' }]
      })
      setCampaignShareLinks((prev) => {
        const others = prev.filter((item) => String(item.campaignId) !== String(campaignId))
        return [...others, { campaignId: String(campaignId), token: result.enrollment.shareToken, status: 'ACTIVE' }]
      })
    } catch (error: any) {
      alert(error?.message || 'Campaign join failed.')
    } finally {
      setCampaignActionBusyId(null)
    }
  }

  const handleCampaignShare = async (campaignId: string) => {
    if (!stableMagicToken) {
      alert('Magic token is required.')
      return
    }
    setCampaignActionBusyId(`share:${campaignId}`)
    try {
      const existing = campaignShareLinks.find((item) => String(item.campaignId) === String(campaignId))
      const shareToken =
        existing?.token ||
        (
          await getReferralShareLink({
            token: stableMagicToken,
            campaignId,
          })
        ).share.token
      const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?ref=${encodeURIComponent(shareToken)}` : shareToken
      if (navigator?.share) {
        await navigator.share({
          title: 'Referral campaign',
          text: 'Join with my referral link',
          url: shareUrl,
        })
      } else if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        alert('Share link copied.')
      } else {
        alert(shareUrl)
      }
    } catch (error: any) {
      alert(error?.message || 'Campaign share failed.')
    } finally {
      setCampaignActionBusyId(null)
    }
  }

  const calculateTotalDuration = () => {
    return selectedServices.reduce((sum, entry) => {
        return sum + (parseInt(entry.service.duration) || 0);
    }, 0);
  }

  const countSelectedService = (serviceId: string, source?: 'MANUAL' | 'PACKAGE', personIndex?: number) => {
    return selectedServices.filter(
      (entry) =>
        entry.service.id === serviceId &&
        (!source || entry.source === source) &&
        (!personIndex || entry.personIndex === personIndex),
    ).length
  }

  const buildEntryId = (serviceId: string) =>
    `${serviceId}:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 8)}`

  const isPackageServiceSelected = (packageId: string, serviceId: string, personIndex?: number) => {
    return selectedServices.some(
      (entry) =>
        entry.source === 'PACKAGE' &&
        String(entry.packageId) === String(packageId) &&
        String(entry.service.id) === String(serviceId) &&
        (personIndex ? entry.personIndex === personIndex : true),
    )
  }

  const personLabel = (personIndex: number) =>
    language === 'tr' ? `Kisi ${personIndex}` : `Person ${personIndex}`

  const handleServiceToggle = async (service: any, categoryName: string, personIndex?: number) => {
    const serviceData: ImportedServiceItem = {
      id: service.id,
      name: `${categoryName} - ${service.name}`,
      originalPrice: service.originalPrice || service.salePrice || 0,
      salePrice: service.salePrice,
      duration: service.duration,
      requiresSpecialist: service.requiresSpecialist
    }
    if (numberOfPeople > 1 && !personIndex) {
      const selectedManualEntries = selectedServices.filter(
        (entry) => entry.source === 'MANUAL' && String(entry.service.id) === String(service.id),
      )
      if (selectedManualEntries.length > 0) {
        const removeIds = new Set(selectedManualEntries.map((entry) => entry.entryId))
        setSelectedServices((prev) => prev.filter((entry) => !removeIds.has(entry.entryId)))
        setSelectedSpecialistIds((map) => {
          const copy = { ...map }
          for (const id of removeIds) {
            delete copy[id]
          }
          return copy
        })
        setSelectedSpecialistOptionIds((map) => {
          const copy = { ...map }
          for (const id of removeIds) {
            delete copy[id]
          }
          return copy
        })
        setSelectedDate(null)
        setSelectedTimeSlot(null)
        return
      }
      setPersonPicker({
        source: 'MANUAL',
        serviceId: String(service.id),
        serviceName: service.name,
        categoryName,
        serviceData,
        requiresSpecialist: Boolean(service.requiresSpecialist),
      })
      setPersonPickerSelections([])
      return
    }

    const targetPersonIndex = personIndex || 1

    const manualCount = countSelectedService(service.id, 'MANUAL', targetPersonIndex)
    if (manualCount > 0) {
      setSelectedServices((prev) => {
        const index = prev.findIndex(
          (entry) => entry.service.id === service.id && entry.source === 'MANUAL' && entry.personIndex === targetPersonIndex,
        )
        if (index === -1) return prev
        const next = [...prev]
        const removed = next[index]
        if (removed) {
          setSelectedSpecialistIds((map) => {
            const copy = { ...map }
            delete copy[removed.entryId]
            return copy
          })
          setSelectedSpecialistOptionIds((map) => {
            const copy = { ...map }
            delete copy[removed.entryId]
            return copy
          })
        }
        next.splice(index, 1)
        return next
      })
    } else {
      const entryId = buildEntryId(service.id)
      setSelectedServices((prev) => [
        ...prev,
        {
          entryId,
          service: serviceData,
          source: 'MANUAL',
          personIndex: targetPersonIndex,
        },
      ])
      // If specialist is required, only show modal if there's more than one choice.
      // If only one staff member exists, they will be auto-assigned.
      const staff = await getStaffForService(service.id.toString());
      if (service.requiresSpecialist || staff.length > 1) {
        if (staff && staff.length > 1) {
          setSpecialistModal({ entryId, personIndex: targetPersonIndex, service: serviceData, staff });
        } else if (staff && staff.length === 1) {
          setSelectedSpecialistIds((prev) => ({ ...prev, [entryId]: String(staff[0].id) }))
          setSelectedSpecialistOptionIds((prev) => ({ ...prev, [entryId]: [String(staff[0].id)] }))
        }
      }
    }
    setSelectedDate(null)
    setSelectedTimeSlot(null)
  }

  const handleAddFromPackage = async (input: { packageId: string; serviceId: string; serviceName?: string | null; personIndex?: number }) => {
    const { packageId, serviceId, personIndex } = input
    const targetPersonIndex = personIndex || 1

    if (numberOfPeople > 1 && !personIndex) {
      const selectedPackageEntries = selectedServices.filter(
        (entry) =>
          entry.source === 'PACKAGE' &&
          String(entry.packageId) === String(packageId) &&
          String(entry.service.id) === String(serviceId),
      )
      if (selectedPackageEntries.length > 0) {
        const removeIds = new Set(selectedPackageEntries.map((entry) => entry.entryId))
        setSelectedServices((prev) => prev.filter((entry) => !removeIds.has(entry.entryId)))
        setSelectedSpecialistIds((map) => {
          const copy = { ...map }
          for (const id of removeIds) {
            delete copy[id]
          }
          return copy
        })
        setSelectedSpecialistOptionIds((map) => {
          const copy = { ...map }
          for (const id of removeIds) {
            delete copy[id]
          }
          return copy
        })
        const usageKey = packageUsageKey(packageId, serviceId)
        setPackageUsageByKey((prev) => ({
          ...prev,
          [usageKey]: Math.max(0, (prev[usageKey] || 0) - selectedPackageEntries.length),
        }))
        setSelectedDate(null)
        setSelectedTimeSlot(null)
        return
      }
    }

    if (personIndex && isPackageServiceSelected(packageId, serviceId, targetPersonIndex)) {
      setSelectedServices((prev) => {
        const idx = prev.findIndex(
          (entry) =>
            entry.source === 'PACKAGE' &&
            String(entry.packageId) === String(packageId) &&
            String(entry.service.id) === String(serviceId) &&
            entry.personIndex === targetPersonIndex,
        )
        if (idx === -1) return prev
        const next = [...prev]
        const removed = next[idx]
        if (removed) {
          setSelectedSpecialistIds((map) => {
            const copy = { ...map }
            delete copy[removed.entryId]
            return copy
          })
          setSelectedSpecialistOptionIds((map) => {
            const copy = { ...map }
            delete copy[removed.entryId]
            return copy
          })
        }
        next.splice(idx, 1)
        return next
      })
      const usageKey = packageUsageKey(packageId, serviceId)
      setPackageUsageByKey((prev) => ({
        ...prev,
        [usageKey]: Math.max(0, (prev[usageKey] || 0) - 1),
      }))
      setSelectedDate(null)
      setSelectedTimeSlot(null)
      return
    }

    let matched = flatServiceCatalog.find((row) => row.service.id === serviceId)
    if (!matched && salonId) {
      try {
        const unfiltered = await getServices(salonId)
        const unfilteredFlat = unfiltered.flatMap((category) =>
          category.services.map((service) => ({ categoryName: category.name, service })),
        )
        matched = unfilteredFlat.find((row) => row.service.id === serviceId)
      } catch {
        // no-op, handled by alert below
      }
    }
    if (!matched) {
      alert(text.dashboard.packageServiceLoadFailed)
      return
    }

    const usageKey = packageUsageKey(packageId, serviceId)
    const pkg = activePackages.find((p) => p.id === packageId)
    const balance = pkg?.serviceBalances.find((b) => b.serviceId === serviceId)
    const dynamicRemaining = balance
      ? Math.max(0, balance.remainingQuota - (packageUsageByKey[usageKey] || 0))
      : 0
    if (dynamicRemaining <= 0) {
      alert(text.dashboard.noQuotaLeftForPackageService)
      return
    }

    const serviceData: ImportedServiceItem = {
      id: matched.service.id,
      name: `${matched.categoryName} - ${matched.service.name}`,
      originalPrice: matched.service.originalPrice || matched.service.salePrice || 0,
      salePrice: matched.service.salePrice,
      duration: matched.service.duration,
      requiresSpecialist: matched.service.requiresSpecialist,
    }

    if (numberOfPeople > 1 && !personIndex) {
      setPersonPicker({
        source: 'PACKAGE',
        packageId,
        serviceId,
        serviceName: input.serviceName,
        categoryName: matched.categoryName,
        serviceData,
        requiresSpecialist: Boolean(matched.service.requiresSpecialist),
      })
      setPersonPickerSelections([])
      return
    }

    const entryId = buildEntryId(serviceId)
    setSelectedServices((prev) => [
      ...prev,
      {
        entryId,
        service: serviceData,
        source: 'PACKAGE',
        packageId,
        personIndex: targetPersonIndex,
      },
    ])
    setPackageUsageByKey((prev) => ({
      ...prev,
      [usageKey]: (prev[usageKey] || 0) + 1,
    }))
    const staff = await getStaffForService(String(matched.service.id))
    if (matched.service.requiresSpecialist || staff.length > 1) {
      if (staff && staff.length > 1) {
        setSpecialistModal({ entryId, personIndex: targetPersonIndex, service: serviceData, staff })
      } else if (staff && staff.length === 1) {
        setSelectedSpecialistIds((prev) => ({ ...prev, [entryId]: String(staff[0].id) }))
        setSelectedSpecialistOptionIds((prev) => ({ ...prev, [entryId]: [String(staff[0].id)] }))
      }
    }
    setSelectedDate(null)
    setSelectedTimeSlot(null)
  }

  const togglePersonInPicker = (personIndex: number) => {
    setPersonPickerSelections((prev) =>
      prev.includes(personIndex) ? prev.filter((id) => id !== personIndex) : [...prev, personIndex].sort((a, b) => a - b),
    )
  }

  const applyPendingSelection = async () => {
    if (!personPicker || personPickerSelections.length === 0) return
    const pending = personPicker

    const selectedPersonIds = [...personPickerSelections].sort((a, b) => a - b)
    let remainingForPackage = 0
    if (pending.source === 'PACKAGE') {
      const usageKey = packageUsageKey(String(pending.packageId || ''), pending.serviceId)
      const pkg = activePackages.find((p) => String(p.id) === String(pending.packageId || ''))
      const balance = pkg?.serviceBalances.find((b) => String(b.serviceId) === String(pending.serviceId))
      remainingForPackage = balance
        ? Math.max(0, Number(balance.remainingQuota) - (packageUsageByKey[usageKey] || 0))
        : 0
    }

    const toAdd: Array<{ entryId: string; personIndex: number }> = []
    const toRemove: SelectedServiceEntry[] = []

    for (const personIndex of selectedPersonIds) {
      const existing = selectedServices.find(
        (entry) =>
          entry.personIndex === personIndex &&
          entry.source === pending.source &&
          String(entry.service.id) === String(pending.serviceId) &&
          (pending.source === 'PACKAGE' ? String(entry.packageId) === String(pending.packageId || '') : true),
      )

      if (existing) {
        toRemove.push(existing)
        if (pending.source === 'PACKAGE') {
          remainingForPackage += 1
        }
        continue
      }

      if (pending.source === 'PACKAGE' && remainingForPackage <= 0) {
        continue
      }

      const entryId = buildEntryId(pending.serviceId)
      toAdd.push({ entryId, personIndex })
      if (pending.source === 'PACKAGE') {
        remainingForPackage -= 1
      }
    }

    if (!toAdd.length && !toRemove.length) {
      alert(text.dashboard.noQuotaLeftForPackageService)
      return
    }

    const removeIds = new Set(toRemove.map((entry) => entry.entryId))
    setSelectedServices((prev) => {
      const kept = prev.filter((entry) => !removeIds.has(entry.entryId))
      const additions: SelectedServiceEntry[] = toAdd.map((row) => ({
        entryId: row.entryId,
        source: pending.source,
        packageId: pending.source === 'PACKAGE' ? String(pending.packageId || '') : undefined,
        personIndex: row.personIndex,
        service: pending.serviceData,
      }))
      return [...kept, ...additions]
    })

    if (pending.source === 'PACKAGE') {
      const usageKey = packageUsageKey(String(pending.packageId || ''), pending.serviceId)
      setPackageUsageByKey((prev) => ({
        ...prev,
        [usageKey]: Math.max(0, (prev[usageKey] || 0) + toAdd.length - toRemove.length),
      }))
    }

    if (removeIds.size > 0) {
      setSelectedSpecialistIds((prev) => {
        const next = { ...prev }
        for (const id of removeIds) {
          delete next[id]
        }
        return next
      })
      setSelectedSpecialistOptionIds((prev) => {
        const next = { ...prev }
        for (const id of removeIds) {
          delete next[id]
        }
        return next
      })
    }

    setSelectedDate(null)
    setSelectedTimeSlot(null)
    setPersonPicker(null)
    setPersonPickerSelections([])

    if (toAdd.length === 0) {
      return
    }

    const staff = await getStaffForService(pending.serviceId)
    const shouldAskSpecialist = Boolean(pending.requiresSpecialist || pending.serviceData.requiresSpecialist || staff.length > 1)
    if (!shouldAskSpecialist) return
    if (!staff || !staff.length) return

    const choices: Record<string, { mode: 'ANY' | 'SPECIFIC'; staffIds: string[] }> = {}
    for (const entry of toAdd) {
      choices[entry.entryId] = { mode: 'ANY', staffIds: [] }
    }
    setSpecialistBatchModal({
      entries: toAdd,
      serviceName: pending.serviceData.name,
      staff,
      cursor: 0,
      choices,
    })
  }

  const toggleSpecialistChoiceForCurrent = (type: 'ANY' | 'STAFF', staffId?: string, targetEntryId?: string) => {
    setSpecialistBatchModal((prev) => {
      if (!prev) return prev
      const current = targetEntryId
        ? prev.entries.find((entry) => entry.entryId === targetEntryId)
        : prev.entries[prev.cursor]
      if (!current) return prev
      const existing = prev.choices[current.entryId] || { mode: 'ANY' as const, staffIds: [] }

      if (type === 'ANY') {
        return {
          ...prev,
          choices: {
            ...prev.choices,
            [current.entryId]: { mode: 'ANY', staffIds: [] },
          },
        }
      }

      if (!staffId) return prev
      const currentSet = new Set(existing.staffIds)
      if (currentSet.has(staffId)) {
        currentSet.delete(staffId)
      } else {
        currentSet.add(staffId)
      }
      const nextIds = Array.from(currentSet)
      return {
        ...prev,
        choices: {
          ...prev.choices,
          [current.entryId]: nextIds.length ? { mode: 'SPECIFIC', staffIds: nextIds } : { mode: 'ANY', staffIds: [] },
        },
      }
    })
  }

  const goToNextSpecialistPerson = () => {
    setSpecialistBatchModal((prev) => {
      if (!prev) return prev
      if (prev.cursor >= prev.entries.length - 1) return prev
      return { ...prev, cursor: prev.cursor + 1 }
    })
  }

  const goToPreviousSpecialistPerson = () => {
    setSpecialistBatchModal((prev) => {
      if (!prev) return prev
      if (prev.cursor <= 0) return prev
      return { ...prev, cursor: prev.cursor - 1 }
    })
  }

  const commitSpecialistBatchSelection = () => {
    if (!specialistBatchModal) return
    const nextIds: Record<string, string> = {}
    const nextOptions: Record<string, string[]> = {}
    const clearIds: string[] = []

    for (const entry of specialistBatchModal.entries) {
      const choice = specialistBatchModal.choices[entry.entryId] || { mode: 'ANY' as const, staffIds: [] }
      if (choice.mode === 'SPECIFIC' && choice.staffIds.length) {
        nextIds[entry.entryId] = choice.staffIds[0]
        nextOptions[entry.entryId] = [...choice.staffIds]
      } else {
        clearIds.push(entry.entryId)
        nextOptions[entry.entryId] = []
      }
    }

    setSelectedSpecialistIds((prev) => {
      const next = { ...prev, ...nextIds }
      for (const id of clearIds) {
        delete next[id]
      }
      return next
    })
    setSelectedSpecialistOptionIds((prev) => ({ ...prev, ...nextOptions }))
    setSpecialistBatchModal(null)
  }

  const openWaitlistModal = () => {
    setWaitlistModal((prev) => ({
      ...prev,
      open: true,
      submitting: false,
      successMessage: null,
      error: null,
      timeWindowStart: waitlistDefaultStart,
      timeWindowEnd: waitlistDefaultEnd,
      allowNearbyMatches: prev.allowNearbyMatches,
      customerName: customerName || registrationForm.fullName,
      customerPhone: registrationForm.phone,
    }))
  }

  const submitWaitlistRequest = async () => {
    if (!selectedDate || !selectedServiceGroups.length) return

    const customerNameValue = (waitlistModal.customerName || '').trim()
    if (!customerNameValue || !waitlistModal.customerPhone.trim()) {
      setWaitlistModal((prev) => ({ ...prev, error: 'Name and phone are required for the waitlist.' }))
      return
    }
    if (!waitlistPhoneMeta.isValid || !waitlistPhoneMeta.isMobile || !waitlistPhoneMeta.normalizedDigits) {
      setWaitlistModal((prev) => ({ ...prev, error: 'Please enter a valid mobile number.' }))
      return
    }
    if (waitlistModal.timeWindowStart >= waitlistModal.timeWindowEnd) {
      setWaitlistModal((prev) => ({ ...prev, error: 'Please choose a valid time window.' }))
      return
    }

    setWaitlistModal((prev) => ({ ...prev, submitting: true, error: null, successMessage: null }))
    try {
      const response = await createWaitlistRequest({
        date: selectedDate,
        timeWindowStart: waitlistModal.timeWindowStart,
        timeWindowEnd: waitlistModal.timeWindowEnd,
        allowNearbyMatches: waitlistModal.allowNearbyMatches,
        nearbyToleranceMinutes: 60,
        groups: selectedServiceGroups.map((services, index) => ({
          personId: `p${index + 1}`,
          services,
        })),
        customerId,
        customerName: customerNameValue,
        customerPhone: waitlistPhoneMeta.normalizedDigits,
        customerCountryIso: waitlistModal.customerCountryIso,
        customerRawPhone: waitlistModal.customerPhone,
        customerNormalizedPhone: waitlistPhoneMeta.normalizedDigits,
        notes: waitlistModal.notes.trim() || null,
      })

      setWaitlistModal((prev) => ({
        ...prev,
        submitting: false,
        successMessage:
          response.item.latestOffer?.status === 'SENT'
            ? 'A matching slot opened immediately and an offer was sent.'
            : 'You joined the waitlist successfully. We will contact you if a slot opens.',
      }))
    } catch (error: any) {
      setWaitlistModal((prev) => ({
        ...prev,
        submitting: false,
        error: error?.message || 'Waitlist request could not be created.',
      }))
    }
  }

  const finalizeRegisteredCustomer = (customerIdValue: string) => {
    setCustomerId(customerIdValue)
    setCustomerName(registrationForm.fullName)
    setIsKnownCustomer(true)
    setShowRegistrationModal(false)
    setRegistrationStep('form')
    setRegistrationVerificationId(null)
    setRegistrationOtpCode('')
    setRegistrationWhatsappConfirmChecked(false)
    setShowConfirmationModal(true)
  }

  const submitRegistration = async (confirmDifferentWhatsappNumber = false) => {
    if (!registrationCanContinue) {
      setRegistrationError(text.fillInfoError)
      return
    }
    if (!registrationPhoneMeta.e164 || !registrationPhoneMeta.normalizedDigits || !registrationPhoneMeta.isMobile) {
      setRegistrationError('Please enter a valid mobile number.')
      return
    }

    setRegistrationSubmitting(true)
    setRegistrationError(null)
    try {
      const res = await registerCustomer({
        fullName: registrationForm.fullName,
        rawPhone: registrationForm.phone,
        normalizedPhone: registrationPhoneMeta.normalizedDigits,
        countryIso: registrationForm.countryIso,
        gender: registrationForm.gender,
        birthDate: registrationForm.birthDate,
        acceptMarketing: registrationForm.acceptMarketing,
        originChannel,
        originPhone,
        instagramId: originInstagramId,
        magicToken: stableMagicToken,
        confirmDifferentWhatsappNumber,
      })

      if (res.status === 'registered') {
        finalizeRegisteredCustomer(res.customerId)
        return
      }

      if (res.status === 'requires_whatsapp_confirmation') {
        setRegistrationWhatsappConfirmChecked(false)
        setRegistrationStep('whatsapp-confirm')
        return
      }

      setRegistrationVerificationId(res.verificationId)
      setRegistrationOtpCode('')
      setRegistrationStep('otp')
    } catch (err: any) {
      setRegistrationError(err?.message || text.genericError)
    } finally {
      setRegistrationSubmitting(false)
    }
  }

  const resendRegistrationCode = async () => {
    if (!registrationVerificationId) return
    setRegistrationOtpSending(true)
    setRegistrationError(null)
    try {
      await requestCustomerPhoneVerification(registrationVerificationId)
    } catch (err: any) {
      setRegistrationError(err?.message || text.genericError)
    } finally {
      setRegistrationOtpSending(false)
    }
  }

  const confirmRegistrationCode = async () => {
    if (!registrationVerificationId || registrationOtpCode.trim().length < 6) {
      setRegistrationError('Please enter the 6-digit code.')
      return
    }
    setRegistrationSubmitting(true)
    setRegistrationError(null)
    try {
      const result = await confirmCustomerPhoneVerification({
        verificationId: registrationVerificationId,
        code: registrationOtpCode.trim(),
      })
      finalizeRegisteredCustomer(String(result.customerId))
    } catch (err: any) {
      setRegistrationError(err?.message || text.genericError)
    } finally {
      setRegistrationSubmitting(false)
    }
  }

  const handleWaitlistOfferDecision = async (decision: 'accept' | 'reject') => {
    if (!waitlistOfferToken) return
    setWaitlistOfferActionLoading(true)
    setWaitlistOfferActionMessage(null)
    try {
      if (decision === 'accept') {
        await acceptWaitlistOffer(waitlistOfferToken)
        setWaitlistOfferActionMessage('Offer accepted. Your appointment has been created.')
        const refreshed = await getWaitlistOffer(waitlistOfferToken).catch(() => null)
        if (refreshed) setWaitlistOffer(refreshed)
      } else {
        await rejectWaitlistOffer(waitlistOfferToken)
        setWaitlistOfferActionMessage('Offer rejected. We will continue with the next person on the list.')
        const refreshed = await getWaitlistOffer(waitlistOfferToken).catch(() => null)
        if (refreshed) setWaitlistOffer(refreshed)
      }
    } catch (error: any) {
      setWaitlistOfferActionMessage(error?.message || 'This offer could not be processed.')
    } finally {
      setWaitlistOfferActionLoading(false)
    }
  }

  const handleConfirmAppointment = async () => {
    if (!customerId || !selectedDate || !selectedTimeSlot || !selectedDisplaySlot || !availabilityLockToken || selectedServices.length === 0) return;
    
    setIsBooking(true);
    try {
        const dateStr = selectedDate

        const res = await createAppointment(salonId, customerId, {
            services: selectedServices.map(entry => ({
                serviceId: entry.service.id,
                employeeId: (selectedSpecialistOptionIds[entry.entryId] || []).length === 1
                  ? selectedSpecialistOptionIds[entry.entryId][0]
                  : undefined,
                staffOptionIds: selectedSpecialistOptionIds[entry.entryId] || (selectedSpecialistIds[entry.entryId] ? [selectedSpecialistIds[entry.entryId]] : []),
                duration: entry.service.duration,
                personIndex: entry.personIndex,
            })),
            packageSelections: selectedServices
              .filter((entry) => entry.source === 'PACKAGE' && Boolean(entry.packageId))
              .map((entry) => ({
                serviceId: entry.service.id,
                customerPackageId: String(entry.packageId),
            })),
            referralShareToken: searchParams.get('ref') || undefined,
            availabilityLockToken,
            selectedSlots: selectedDisplaySlot.personSlots.map((slot) => ({
              personId: slot.personId,
              slotKey: slot.slotKey,
            })),
            date: dateStr,
            time: selectedTimeSlot,
            numberOfPeople,
            customerInfo: {
                name: customerName || registrationForm.fullName,
                phone: registrationForm.phone
            }
        });

        if (res.data) {
            setLastAppointmentDetails({
                date: dateStr,
                time: selectedTimeSlot,
                services: selectedServices
            });
            setShowConfirmationModal(false);
            setShowSuccessModal(true);
            setSelectedServices([]);
            setPackageUsageByKey({});
            setSelectedSpecialistIds({})
            setSelectedSpecialistOptionIds({})
            setSelectedDate(null);
            setSelectedTimeSlot(null);
            setSelectedDisplaySlot(null);
            setAvailabilityLockToken(null);
            if (stableMagicToken) {
              await reloadBookingContext();
            }
        } else {
            if (res.code === 'SLOT_NOT_AVAILABLE' && res.alternatives) {
              const alternatives = res.alternatives
              const availableSet = new Set(alternatives.availableDates || [])
              setDateOptions((prev) =>
                prev.map((option) => ({
                  ...option,
                  status: availableSet.has(option.fullDate)
                    ? 'available'
                    : option.fullDate === alternatives.date
                      ? 'full'
                      : option.status,
                })),
              )
              if (alternatives.date) {
                setSelectedDate(alternatives.date)
              }
              setAvailableSlots(alternatives.displaySlots || [])
              setAvailabilityLockToken(alternatives.lockToken?.id || null)
              setSelectedDisplaySlot(null)
              setSelectedTimeSlot(null)
            }
            alert(res.error || text.bookingFailed);
        }
    } catch (err) {
        alert(text.genericError);
    } finally {
        setIsBooking(false);
    }
  }

  const customerAppointmentGroups = useMemo(() => {
    const sorted = [...recentAppointments].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    )
    const map = new Map<string, BookingContextAppointment[]>()
    for (const item of sorted) {
      const key = item.groupKey || `single:${item.id}`
      const rows = map.get(key) || []
      rows.push(item)
      map.set(key, rows)
    }
    return Array.from(map.entries()).map(([key, items]) => ({
      key,
      items,
      updatableItems: items.filter((item) => canUpdateAppointment(item)),
      cancelableItems: items.filter((item) => canCancelAppointment(item)),
      evaluableItems: items.filter((item) => canEvaluateAppointment(item)),
    }))
  }, [recentAppointments])

  const openRescheduleModalForGroup = (groupItems: BookingContextAppointment[]) => {
    if (!groupItems.length) return
    if (!stableMagicToken) {
      alert(text.dashboard.secureLinkRequiredUpdate)
      return
    }
    const sorted = [...groupItems].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    )
    const first = sorted[0]
    const appointmentIds = sorted
      .map((item) => Number(item.id))
      .filter((id) => Number.isInteger(id) && id > 0)
    if (!appointmentIds.length) return
    setRescheduleModal({
      appointmentIds,
      date: toInputDate(first.startTime),
      time: toInputTime(first.startTime),
      loading: false,
      suggestionsLoading: false,
      suggestedSlots: [],
      preview: null,
      assignments: {},
      error: null,
    })
  }

  const loadRescheduleOptions = async () => {
    if (!rescheduleModal || !stableMagicToken || !rescheduleModal.date) return
    setRescheduleModal((prev) => (prev ? { ...prev, suggestionsLoading: true } : prev))
    try {
      const assignments = Object.entries(rescheduleModal.assignments)
        .map(([appointmentId, staffId]) => ({
          appointmentId: Number(appointmentId),
          staffId: Number(staffId),
        }))
        .filter((row) => Number.isInteger(row.appointmentId) && row.appointmentId > 0 && Number.isInteger(row.staffId) && row.staffId > 0)

      const options = await getBookingRescheduleOptions({
        token: stableMagicToken,
        appointmentIds: rescheduleModal.appointmentIds,
        date: rescheduleModal.date,
        assignments,
      })

      setRescheduleModal((prev) =>
        prev
          ? {
              ...prev,
              suggestionsLoading: false,
              suggestedSlots: options.slots || [],
            }
          : prev,
      )
    } catch {
      setRescheduleModal((prev) => (prev ? { ...prev, suggestionsLoading: false, suggestedSlots: [] } : prev))
    }
  }

  useEffect(() => {
    if (!rescheduleModal?.date || !stableMagicToken) return
    void loadRescheduleOptions()
  }, [rescheduleModal?.date, stableMagicToken])


  const runReschedulePreview = async () => {
    if (!rescheduleModal || !stableMagicToken) return
    const base = new Date(`${rescheduleModal.date}T${rescheduleModal.time}:00`)
    if (Number.isNaN(base.getTime())) {
      setRescheduleModal((prev) => (prev ? { ...prev, error: text.dashboard.selectValidDateTime } : prev))
      return
    }
    setRescheduleModal((prev) => (prev ? { ...prev, loading: true, error: null } : prev))
    try {
      const assignments = Object.entries(rescheduleModal.assignments)
        .map(([appointmentId, staffId]) => ({
          appointmentId: Number(appointmentId),
          staffId: Number(staffId),
        }))
        .filter((row) => Number.isInteger(row.appointmentId) && row.appointmentId > 0 && Number.isInteger(row.staffId) && row.staffId > 0)

      const preview = await previewBookingReschedule({
        token: stableMagicToken,
        appointmentIds: rescheduleModal.appointmentIds,
        newStartTime: base.toISOString(),
        assignments,
      })

      let error: string | null = null
      if (preview.hasConflicts && preview.conflicts.length) {
        error = preview.conflicts[0].reason || text.dashboard.rescheduleSlotUnavailable
      }
      setRescheduleModal((prev) => (prev ? { ...prev, preview, loading: false, error } : prev))
    } catch (err: any) {
      setRescheduleModal((prev) => (prev ? { ...prev, loading: false, error: err?.message || text.dashboard.reschedulePreviewFailed } : prev))
    }
  }

  const commitRescheduleFromModal = async () => {
    if (!rescheduleModal || !stableMagicToken) return
    const base = new Date(`${rescheduleModal.date}T${rescheduleModal.time}:00`)
    if (Number.isNaN(base.getTime())) {
      setRescheduleModal((prev) => (prev ? { ...prev, error: text.dashboard.selectValidDateTime } : prev))
      return
    }

    const preview = rescheduleModal.preview
    if (!preview) {
      await runReschedulePreview()
      return
    }
    if (preview.hasConflicts) {
      setRescheduleModal((prev) => (prev ? { ...prev, error: preview.conflicts[0]?.reason || text.dashboard.rescheduleConflict } : prev))
      return
    }

    const requiredManual = preview.items.filter((item) => item.needsManualChoice)
    for (const item of requiredManual) {
      if (!rescheduleModal.assignments[item.appointmentId]) {
        setRescheduleModal((prev) =>
          prev ? { ...prev, error: `${text.dashboard.chooseSpecialistPrompt} (${item.serviceName})` } : prev,
        )
        return
      }
    }

    setRescheduleModal((prev) => (prev ? { ...prev, loading: true, error: null } : prev))
    try {
      const assignments = Object.entries(rescheduleModal.assignments)
        .map(([appointmentId, staffId]) => ({
          appointmentId: Number(appointmentId),
          staffId: Number(staffId),
        }))
        .filter((row) => Number.isInteger(row.appointmentId) && row.appointmentId > 0 && Number.isInteger(row.staffId) && row.staffId > 0)

      await commitBookingReschedule({
        token: stableMagicToken,
        appointmentIds: rescheduleModal.appointmentIds,
        newStartTime: base.toISOString(),
        assignments,
        idempotencyKey: `cust-${Date.now()}`,
      })
      setRescheduleModal(null)
      await reloadBookingContext()
    } catch (err: any) {
      setRescheduleModal((prev) => (prev ? { ...prev, loading: false, error: err?.message || text.dashboard.rescheduleFailed } : prev))
    }
  }

  const handleRepeatGroup = (groupItems: BookingContextAppointment[]) => {
    const serviceIds = groupItems
      .map((item) => String(item.serviceId || ''))
      .filter((id) => id)
    if (!serviceIds.length) {
      alert(text.dashboard.noServiceToRepeat)
      return
    }

    const selections: SelectedServiceEntry[] = []
    for (const serviceId of serviceIds) {
      const matched = flatServiceCatalog.find((row) => row.service.id === serviceId)
      if (matched) {
        selections.push({
          entryId: buildEntryId(matched.service.id),
          source: 'MANUAL',
          personIndex: 1,
          service: {
            id: matched.service.id,
            name: `${matched.categoryName} - ${matched.service.name}`,
            originalPrice: matched.service.originalPrice || matched.service.salePrice || 0,
            salePrice: matched.service.salePrice,
            duration: matched.service.duration,
            requiresSpecialist: matched.service.requiresSpecialist,
          },
        })
      }
    }

    if (!selections.length) {
      alert(text.dashboard.serviceFilterMismatch)
      return
    }

    setSelectedServices(selections)
    setPackageUsageByKey({})
    setSelectedSpecialistIds({})
    setSelectedSpecialistOptionIds({})
    setSelectedDate(null)
    setSelectedTimeSlot(null)
    const bookingArea = document.querySelector('[data-scroll-target="date-time"]')
    bookingArea?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleCancelGroup = async (groupItems: BookingContextAppointment[]) => {
    if (!stableMagicToken) {
      alert(text.dashboard.secureLinkRequiredCancel)
      return
    }
    const appointmentIds = groupItems
      .map((item) => Number(item.id))
      .filter((id) => Number.isInteger(id) && id > 0)
    if (!appointmentIds.length) return
    setCancelConfirmModal({
      appointmentIds,
      loading: false,
      error: null,
    })
  }

  const confirmCancelAppointments = async () => {
    if (!stableMagicToken || !cancelConfirmModal) return
    setCancelConfirmModal((prev) => (prev ? { ...prev, loading: true, error: null } : prev))
    try {
      await cancelBookingByToken({
        token: stableMagicToken,
        appointmentIds: cancelConfirmModal.appointmentIds,
      })
      setCancelConfirmModal(null)
      await reloadBookingContext()
    } catch (err: any) {
      setCancelConfirmModal((prev) =>
        prev ? { ...prev, loading: false, error: err?.message || text.dashboard.cancellationFailed } : prev,
      )
    }
  }

  const openEvaluateModal = (groupItems: BookingContextAppointment[]) => {
    if (!stableMagicToken) {
      alert(text.dashboard.secureLinkRequiredFeedback)
      return
    }
    const candidate = groupItems.find((item) => canEvaluateAppointment(item))
    if (!candidate) return
    setFeedbackModal({
      appointmentId: Number(candidate.id),
      rating: 5,
      review: '',
      saving: false,
      error: null,
    })
  }

  const submitEvaluate = async () => {
    if (!feedbackModal || !stableMagicToken) return
    setFeedbackModal((prev) => (prev ? { ...prev, saving: true, error: null } : prev))
    try {
      await submitBookingFeedback({
        token: stableMagicToken,
        appointmentId: feedbackModal.appointmentId,
        rating: feedbackModal.rating,
        review: feedbackModal.review,
      })
      setFeedbackModal(null)
      await reloadBookingContext()
    } catch (err: any) {
      setFeedbackModal((prev) => (prev ? { ...prev, saving: false, error: err?.message || text.dashboard.feedbackSaveFailed } : prev))
    }
  }


  const filteredCategories = availableServices.map((cat) => ({
    ...cat,
    services: cat.services.filter(
      (service) => service.name.toLowerCase().includes(searchQuery.toLowerCase()) || cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.services.length > 0)

  if (!salonData) return <div className="flex h-screen items-center justify-center">{text.loading}</div>
  const whatsappPhone = (salonData?.whatsappPhone || '').replace(/[^\d]/g, '')
  const whatsappUrl = whatsappPhone ? `https://wa.me/${whatsappPhone}` : ''

  const handleLanguageChange = (next: LanguageCode) => {
    setLanguage(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('preferredLanguage', next)
    }

    if (forcedLanguage && pathname) {
      const parts = pathname.split('/').filter(Boolean)
      if (parts.length > 0) {
        parts[0] = next
        const nextPath = `/${parts.join('/')}`
        const queryParams = new URLSearchParams(searchParams.toString())
        if (stableMagicToken && !queryParams.get('token')) {
          queryParams.set('token', stableMagicToken)
        }
        const query = queryParams.toString()
        router.push(`${nextPath}${query ? `?${query}` : ''}`)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background pb-40">
      <div className="bg-background">
        <div className="max-w-2xl mx-auto px-4 pt-8 pb-6">
          <div className="flex flex-col items-center justify-center mb-4">
            <div className="mb-2">
                {salonData.logoUrl && !logoError ? (
                    <img 
                        src={salonData.logoUrl} 
                        alt={salonData.name} 
                        className="h-20 w-auto object-contain"
                        onError={() => setLogoError(true)}
                    />
                ) : (
                    <div className="text-4xl flex items-center justify-center w-20 h-20 bg-muted rounded-full shadow-sm">
                        💇‍♀️
                    </div>
                )}
            </div>
            <h1 className="text-xl font-bold">{salonData.name}</h1>
          </div>
          <div className="text-center">
            <p className="text-sm md:text-base text-foreground">{welcomeMessage}</p>
          </div>
          <div className="mt-3 flex justify-end">
            <LanguageSelector value={language} onChange={handleLanguageChange} />
          </div>

          {waitlistOfferToken ? (
            <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Waitlist Offer</p>
                  {waitlistOfferLoading ? (
                    <p className="mt-1 text-sm text-muted-foreground">Loading your offer...</p>
                  ) : waitlistOfferError ? (
                    <p className="mt-1 text-sm text-red-600">{waitlistOfferError}</p>
                  ) : waitlistOffer ? (
                    <>
                      <p className="mt-1 text-sm text-foreground">
                        {waitlistOffer.slotDate} • {waitlistOffer.slotStartTime} - {waitlistOffer.slotEndTime}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        This offer stays active until {new Date(waitlistOffer.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          disabled={waitlistOfferActionLoading || !['PENDING', 'SENT'].includes(waitlistOffer.status)}
                          onClick={() => void handleWaitlistOfferDecision('accept')}
                        >
                          {waitlistOfferActionLoading ? 'Processing...' : 'Accept Offer'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={waitlistOfferActionLoading || !['PENDING', 'SENT'].includes(waitlistOffer.status)}
                          onClick={() => void handleWaitlistOfferDecision('reject')}
                        >
                          Reject
                        </Button>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">Current status: {waitlistOffer.status}</p>
                    </>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">No active offer found for this link.</p>
                  )}
                  {waitlistOfferActionMessage ? (
                    <p className="mt-2 text-sm text-emerald-700">{waitlistOfferActionMessage}</p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
          <div className="bg-card rounded-2xl border-2 border-border p-4 space-y-4">
              <div className="flex items-center justify-center gap-4 bg-muted/30 rounded-xl px-4 py-2.5 border border-muted">
                <button onClick={() => setNumberOfPeople(Math.max(1, numberOfPeople - 1))} className="text-foreground font-bold text-lg leading-none">−</button>
                <div className="flex flex-col items-center px-4">
                  <span className="text-lg font-bold text-foreground">{numberOfPeople}</span>
                  <span className="text-xs text-muted-foreground font-medium leading-tight">{text.people}</span>
                </div>
                <button onClick={() => setNumberOfPeople(Math.min(4, numberOfPeople + 1))} className="font-bold text-lg leading-none" disabled={numberOfPeople >= 4}>+</button>
              </div>

              <div className={`flex items-center justify-center gap-4 rounded-xl p-2 transition-all duration-300 ${selectedGender === 'female' ? 'bg-pink-100 dark:bg-pink-950/30' : 'bg-blue-100 dark:bg-blue-950/30'}`}>
                <button onClick={() => setSelectedGender('female')} className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-2xl font-semibold ${selectedGender === 'female' ? 'bg-pink-300/60 shadow-md scale-105' : 'opacity-70'}`}>👩</button>
                <button onClick={() => setSelectedGender('male')} className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-2xl font-semibold ${selectedGender === 'male' ? 'bg-blue-300/60 shadow-md scale-105' : 'opacity-70'}`}>👨</button>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input type="text" placeholder={text.searchPlaceholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-xl bg-muted/30 text-foreground placeholder-muted-foreground focus:outline-none focus:bg-muted/50 transition-colors" />
              </div>

              {isKnownCustomer ? (
                <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/8 to-background p-4 space-y-3">
                  <button
                    type="button"
                    onClick={() => setCampaignsOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between gap-2"
                  >
                    <div className="flex items-start gap-2 text-left">
                      <div className="mt-0.5 rounded-lg bg-primary/15 p-1.5 text-primary">
                        <Megaphone className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-primary">Campaigns</p>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1.5">
                      <span className="rounded-full border border-primary/25 bg-background px-2.5 py-1 text-[11px] font-semibold text-primary">
                        {activeCampaigns.length}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-primary transition-transform ${campaignsOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {campaignsOpen && activeCampaigns.length ? (
                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                      {activeCampaigns.map((campaign) => {
                        const enrollment = campaignEnrollments.find((item) => String(item.campaignId) === String(campaign.id))
                        const share = campaignShareLinks.find((item) => String(item.campaignId) === String(campaign.id))
                        const wallet = campaignWallet.find((item) => String(item.campaignId) === String(campaign.id))
                        const isReferral = String(campaign.type).toUpperCase() === 'REFERRAL'
                        return (
                          <div key={campaign.id} className="rounded-xl border border-primary/20 bg-background/80 p-3 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-foreground">{campaign.name}</p>
                              <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                {campaign.type}
                              </span>
                            </div>
                            {wallet && wallet.availableAmount > 0 ? (
                              <p className="text-[11px] text-emerald-700 font-semibold">Wallet: {wallet.availableAmount.toFixed(0)}₺</p>
                            ) : null}
                            {isReferral ? (
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={enrollment ? 'outline' : 'default'}
                                  disabled={campaignActionBusyId === `join:${campaign.id}`}
                                  onClick={() => void handleCampaignJoin(campaign.id)}
                                >
                                  {enrollment ? 'Joined' : 'Join'}
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  disabled={campaignActionBusyId === `share:${campaign.id}`}
                                  onClick={() => void handleCampaignShare(campaign.id)}
                                >
                                  Share
                                </Button>
                                {share?.token ? (
                                  <span className="text-[10px] text-muted-foreground truncate">#{share.token.slice(0, 12)}</span>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        )
                      })}
                    </div>
                  ) : campaignsOpen ? (
                    <div className="rounded-lg border border-dashed border-primary/25 bg-background/70 px-3 py-3 text-xs text-muted-foreground">
                      No active campaign.
                    </div>
                  ) : null}
                </div>
              ) : null}

              {isKnownCustomer ? (
                <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/8 to-background p-4 space-y-3">
                  <button
                    type="button"
                    onClick={() => setPackagesOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between gap-2"
                  >
                    <div className="flex items-start gap-2 text-left">
                      <div className="mt-0.5 rounded-lg bg-primary/15 p-1.5 text-primary">
                        <ClipboardList className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-primary">{text.dashboard.packagesTitle}</p>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1.5">
                      <span className="rounded-full border border-primary/25 bg-background px-2.5 py-1 text-[11px] font-semibold text-primary">
                        {activePackages.length}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-primary transition-transform ${packagesOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {packagesOpen && activePackages.length ? (
                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {activePackages.map((pkg) => (
                        <div key={pkg.id} className="rounded-xl border border-primary/20 bg-background/80 p-3 space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{pkg.name}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {pkg.expiresAt
                                  ? text.dashboard.packageExpiresLabel(new Date(pkg.expiresAt).toLocaleDateString(LOCALE_MAP[language], {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                    }))
                                  : text.dashboard.packageNoExpiry}
                              </p>
                            </div>
                            <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                              {text.dashboard.packageServiceCountLabel(pkg.serviceBalances.length)}
                            </span>
                          </div>

                          <div className="space-y-2">
                            {pkg.serviceBalances.map((balance) => {
                              const usageKey = packageUsageKey(String(pkg.id), String(balance.serviceId))
                              const dynamicRemaining = Math.max(0, balance.remainingQuota - (packageUsageByKey[usageKey] || 0))
                              const ratio = balance.initialQuota > 0 ? dynamicRemaining / balance.initialQuota : 0
                              const ratioPercent = Math.max(0, Math.min(100, Math.round(ratio * 100)))
                              const selected = isPackageServiceSelected(String(pkg.id), String(balance.serviceId))
                              const disabled = !selected && dynamicRemaining <= 0
                              return (
                                <div
                                  key={`${pkg.id}:${balance.serviceId}`}
                                  className="w-full rounded-lg border border-border bg-card px-2.5 py-2 text-left transition-colors hover:border-primary/35 hover:bg-primary/5"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs font-semibold text-foreground inline-flex items-center gap-1.5">
                                      <Sparkles className="h-3.5 w-3.5 text-primary/80" />
                                      {balance.serviceName || `#${balance.serviceId}`}
                                    </p>
                                    <div className="inline-flex items-center gap-2">
                                      <p className="text-[11px] font-semibold text-primary">
                                        {dynamicRemaining}/{balance.initialQuota}
                                      </p>
                                      <Button
                                        type="button"
                                        size="sm"
                                        disabled={disabled}
                                        onClick={() =>
                                          void handleAddFromPackage({
                                            packageId: pkg.id,
                                            serviceId: balance.serviceId,
                                            serviceName: balance.serviceName || null,
                                          })
                                        }
                                        className="h-7 rounded-full px-3 text-[10px] font-semibold"
                                        variant={selected ? 'default' : 'outline'}
                                      >
                                        {selected ? text.dashboard.packageRemove : text.dashboard.packageAdd}
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                                    <div className="h-full rounded-full bg-primary/70" style={{ width: `${ratioPercent}%` }} />
                                  </div>
                                  <p className="mt-1 text-[10px] text-muted-foreground">
                                    {dynamicRemaining > 0 ? text.dashboard.packageQuotaHintUse : text.dashboard.packageQuotaHintEmpty}
                                  </p>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : packagesOpen ? (
                    <div className="rounded-lg border border-dashed border-primary/25 bg-background/70 px-3 py-3 text-xs text-muted-foreground">
                      {text.dashboard.packageNoActive}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {isKnownCustomer ? (
                <div className="rounded-2xl border border-border bg-card/70 p-4 space-y-3">
                  <button
                    type="button"
                    onClick={() =>
                      setAppointmentsOpen((prev) => {
                        const next = !prev
                        if (!next) {
                          setExpandedAppointmentGroupKey(null)
                        }
                        return next
                      })
                    }
                    className="w-full flex items-center justify-between"
                  >
                    <div className="flex items-start gap-2 text-left">
                      <div className="mt-0.5 rounded-lg bg-primary/15 p-1.5 text-primary">
                        <CalendarCheck2 className="h-4 w-4" />
                      </div>
                      <div>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-foreground">{text.dashboard.appointmentsTitle}</p>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1.5">
                      <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                        {customerAppointmentGroups.length}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${appointmentsOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {appointmentsOpen && customerAppointmentGroups.length ? (
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {[...customerAppointmentGroups].reverse().map((group) => {
                        const first = group.items[0]
                        const last = group.items[group.items.length - 1]
                        const isExpanded = expandedAppointmentGroupKey === group.key
                        const statuses = Array.from(new Set(group.items.map((item) => String(item.status || '').toUpperCase())))
                        const serviceNames = Array.from(new Set(group.items.map((item) => item.serviceName).filter(Boolean)))
                        const staffNames = Array.from(new Set(group.items.map((item) => item.staffName).filter(Boolean)))
                        const statusPills = statuses.map((status) => appointmentStatusMeta(status, text.dashboard))
                        const groupTotal = group.items.reduce(
                          (sum, item) => sum + (item.finalPrice ?? item.servicePrice ?? 0),
                          0,
                        )
                        return (
                        <div key={group.key} className="rounded-xl border border-border bg-background p-3 text-xs space-y-2">
                          <button
                            type="button"
                            onClick={() => setExpandedAppointmentGroupKey((prev) => (prev === group.key ? null : group.key))}
                            className="w-full flex items-start justify-between gap-2 text-left"
                          >
                            <div>
                              <p className="font-semibold text-foreground">
                                {new Date(first.startTime).toLocaleDateString(LOCALE_MAP[language], {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {new Date(first.startTime).toLocaleTimeString(LOCALE_MAP[language], { hour: '2-digit', minute: '2-digit' })}
                                {' - '}
                                {new Date(last.endTime).toLocaleTimeString(LOCALE_MAP[language], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <p className="text-[11px] font-semibold text-foreground mt-0.5">
                                {text.dashboard.totalLabel}: {groupTotal > 0 ? `${groupTotal}₺` : text.dashboard.paymentFreeLabel}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex flex-wrap justify-end gap-1">
                              {statusPills.map((pill, index) => (
                                <span
                                  key={`${group.key}:status:${index}`}
                                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${pill.className}`}
                                >
                                  {pill.label}
                                </span>
                              ))}
                              </div>
                              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </button>

                          {isExpanded && serviceNames.length ? (
                            <div className="flex flex-wrap gap-1">
                              {serviceNames.map((serviceName) => (
                                <span
                                  key={`${group.key}:service:${serviceName}`}
                                  className="rounded-full border border-border bg-muted/30 px-2 py-0.5 text-[10px] text-foreground"
                                >
                                  {serviceName}
                                </span>
                              ))}
                            </div>
                          ) : null}

                          {isExpanded && staffNames.length ? (
                            <p className="text-[11px] text-muted-foreground">
                              {text.dashboard.specialistLabel}: {staffNames.join(', ')}
                            </p>
                          ) : null}

                          {isExpanded && group.items.some((item) => item.rescheduledFromAppointmentId) ? (
                            <p className="text-[10px] font-medium text-violet-600">{text.dashboard.includesRescheduledRecord}</p>
                          ) : null}

                          {isExpanded ? (
                          <div className="pt-1 space-y-1.5">
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleRepeatGroup(group.items)}
                                className="inline-flex items-center justify-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] font-semibold text-foreground hover:bg-muted/40"
                              >
                                <RefreshCcw className="h-3.5 w-3.5" />
                                {text.dashboard.actionRepeat}
                              </button>
                              {group.cancelableItems.length ? (
                                <button
                                  type="button"
                                  onClick={() => void handleCancelGroup(group.cancelableItems)}
                                  className="inline-flex items-center justify-center gap-1 rounded-lg border border-rose-300/50 bg-rose-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-500/15"
                                >
                                  <Ban className="h-3.5 w-3.5" />
                                  {text.dashboard.actionCancel}
                                </button>
                              ) : null}
                            </div>

                            {group.updatableItems.length ? (
                            <button
                              type="button"
                              onClick={() => openRescheduleModalForGroup(group.updatableItems)}
                              className="w-full inline-flex items-center justify-center gap-1 rounded-lg border border-primary/35 bg-primary/10 px-2.5 py-1.5 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/20"
                            >
                              <PencilLine className="h-3.5 w-3.5" />
                              {text.dashboard.actionUpdate}
                            </button>
                            ) : null}

                            {group.evaluableItems.length ? (
                              <button
                                type="button"
                                onClick={() => openEvaluateModal(group.evaluableItems)}
                                className="w-full inline-flex items-center justify-center gap-1 rounded-lg border border-amber-300/50 bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-500/15"
                              >
                                <Star className="h-3.5 w-3.5" />
                                {text.dashboard.actionEvaluate}
                              </button>
                            ) : null}
                          </div>
                          ) : null}
                        </div>
                        )
                      })}
                    </div>
                  ) : appointmentsOpen ? (
                    <div className="rounded-lg border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">
                      {text.dashboard.appointmentsEmpty}
                    </div>
                  ) : null}
                </div>
              ) : null}
          </div>

          <div className="space-y-3">
            {filteredCategories.map((category) => (
              <Card key={category.id} className="bg-muted/40 border-muted/60 overflow-hidden hover:border-primary/30 transition-all">
                <button onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)} className="w-full px-4 py-3 flex items-center justify-between bg-muted/50 hover:bg-muted/60">
                  <div className="flex items-center gap-3">
                    <div className="text-primary">{getIconComponent(category.id)}</div>
                    <div className="text-left"><p className="font-semibold text-foreground text-sm">{category.name}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">{category.services.length}</span>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${expandedCategory === category.id ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {expandedCategory === category.id && (
                  <CardContent className="pt-4 pb-4 px-4 border-t border-border space-y-3">
                    {category.services.map((service) => {
                      const totalCount = countSelectedService(service.id)
                      const packageCount = countSelectedService(service.id, 'PACKAGE')
                      const isSelected = totalCount > 0
                      const displayPrice = service.salePrice || service.originalPrice;
                      return (
                        <div key={service.id} className="w-full text-left">
                          <div className={`p-3 rounded-lg border-2 transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-foreground text-sm">{service.name}</p>
                                  {isSelected && <Check className="w-4 h-4 text-primary" />}
                                  {packageCount > 0 ? (
                                    <span className="text-[10px] rounded-full bg-primary/15 text-primary px-2 py-0.5">
                                      {text.dashboard.packageBadge} x{packageCount}
                                    </span>
                                  ) : null}
                                  {totalCount > packageCount ? (
                                    <span className="text-[10px] rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                                      {text.dashboard.manualBadge} x{totalCount - packageCount}
                                    </span>
                                  ) : null}
                                </div>
                                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Clock className="w-3 h-3" />{service.duration}</span>
                              </div>
                              <div className="text-right">
                                {displayPrice && displayPrice > 0 && <p className="text-sm font-bold text-secondary">{displayPrice}₺</p>}
                                <Button size="sm" onClick={() => handleServiceToggle(service, category.name)} variant={isSelected ? 'default' : 'outline'} className="mt-2 rounded-full text-xs font-semibold">
                                  {isSelected ? text.dashboard.removeManual : text.add}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>

        {selectedServices.length > 0 && (
          <div className="space-y-6 mt-8 pb-40" data-scroll-target="date-time">
            <div className="max-w-2xl mx-auto px-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4"><Calendar className="w-4 h-4 text-primary" /> {text.selectDate}</h3>
              <div className="flex gap-2 pb-2 overflow-x-auto">
                {dateOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setSelectedDate(opt.fullDate)}
                    className={`min-w-[56px] px-3 py-3 rounded-lg font-semibold text-sm flex flex-col items-center gap-1 border ${
                      selectedDate === opt.fullDate
                        ? 'border-primary bg-primary text-primary-foreground'
                        : opt.status === 'available'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                          : opt.status === 'full'
                            ? 'border-amber-200 bg-amber-50 text-amber-900'
                            : 'border-border bg-muted text-muted-foreground'
                    }`}
                  >
                    <span className="text-xs">{opt.label}</span>
                    <span className="text-base font-bold">{opt.day}</span>
                    <span className={`text-[10px] font-medium leading-none ${
                      selectedDate === opt.fullDate
                        ? 'text-primary-foreground/80'
                        : opt.status === 'available'
                          ? 'text-emerald-700'
                          : opt.status === 'full'
                            ? 'text-amber-700'
                            : 'text-muted-foreground'
                    }`}>
                      {opt.status === 'available' ? 'Open' : opt.status === 'full' ? 'Full' : '...'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {selectedDate && (
              <div className="mb-4 space-y-3 px-4 max-w-2xl mx-auto">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> {text.selectTime}</h3>
                {availableSlots.length === 0 ? (
                    <div className="p-8 text-center bg-muted/20 rounded-xl border border-dashed border-muted">
                      <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {selectedDateStatus === 'loading'
                          ? 'Checking available hours for this day...'
                          : selectedDateStatus === 'full'
                            ? 'No free slot on this day yet. This day can later be used for the waitlist.'
                            : text.noAppointment}
                      </p>
                      <div className="mt-4">
                        <Button type="button" variant="outline" onClick={openWaitlistModal}>
                          Join Waitlist
                        </Button>
                      </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-4 gap-2">
                          {availableSlots.map((slot) => (
                              <button key={slot.displayKey} onClick={() => { setSelectedTimeSlot(slot.label); setSelectedDisplaySlot(slot) }} className={`p-2 rounded-lg text-xs font-semibold ${selectedDisplaySlot?.displayKey === slot.displayKey ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>{slot.label}</button>
                          ))}
                      </div>
                      <div className="rounded-xl border border-border bg-muted/10 p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">Need a different time?</p>
                          <p className="text-xs text-muted-foreground">You can join the waitlist for a specific time window, even if this day still has other open slots.</p>
                        </div>
                        <Button type="button" variant="outline" onClick={openWaitlistModal}>
                          Join Waitlist
                        </Button>
                      </div>
                    </div>
                )}
              </div>
            )}
          </div>
        )}

        {selectedServices.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-xl z-50">
            <div className="max-w-2xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                  <p className="text-2xl font-bold text-foreground leading-none">{totalPrice}₺</p>
                  <p className="text-xs text-muted-foreground">{calculateTotalDuration()} dk</p>
                  {pricingPreview ? (
                    <div className="text-[11px] text-muted-foreground">
                      {pricingPreview.discountTotal > 0 ? (
                        <span>Discount: -{pricingPreview.discountTotal.toFixed(0)}₺</span>
                      ) : (
                        <span>No campaign discount</span>
                      )}
                    </div>
                  ) : null}
                </div>
                <Button onClick={() => {
                    if (!selectedDate || !selectedTimeSlot || !selectedDisplaySlot) {
                      document.querySelector('[data-scroll-target="date-time"]')?.scrollIntoView({ behavior: "smooth" })
                    } else {
                      if (isKnownCustomer) setShowConfirmationModal(true)
                      else {
                        setRegistrationStep('form')
                        setRegistrationError(null)
                        setRegistrationVerificationId(null)
                        setRegistrationOtpCode('')
                        setRegistrationWhatsappConfirmChecked(false)
                        setShowRegistrationModal(true)
                      }
                    }
                  }} className={`px-6 py-3 font-bold text-sm rounded-full ${selectedDate && selectedTimeSlot && selectedDisplaySlot ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'}`} disabled={!selectedDate || !selectedTimeSlot || !selectedDisplaySlot}>{text.confirmAppointment}</Button>
              </div>
            </div>
          </div>
        )}

      {personPicker ? (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in">
          <div className="bg-card w-full rounded-t-2xl p-6 space-y-4 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">{language === 'tr' ? 'Kisi Sec' : 'Select Person'}</h3>
              <button type="button" onClick={() => setPersonPicker(null)} className="text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {language === 'tr' ? 'Hizmetin eklenecegi kisiyi secin:' : 'Choose the person for:'} {personPicker.serviceName || `#${personPicker.serviceId}`}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: numberOfPeople }, (_, index) => (
                <button
                  key={`person-picker-${index + 1}`}
                  type="button"
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                    personPickerSelections.includes(index + 1)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-foreground'
                  }`}
                  onClick={() => togglePersonInPicker(index + 1)}
                >
                  {personLabel(index + 1)}
                </button>
              ))}
            </div>
            <Button
              type="button"
              disabled={!personPickerSelections.length}
              onClick={() => void applyPendingSelection()}
              className="w-full rounded-full bg-primary text-primary-foreground"
            >
              {personPicker.requiresSpecialist
                ? language === 'tr'
                  ? 'Uzman Secimine Devam Et'
                  : 'Continue to Specialist Selection'
                : text.add}
            </Button>
          </div>
        </div>
      ) : null}

      {specialistBatchModal ? (
        <div className="fixed inset-0 bg-black/50 flex items-end z-[55] animate-in fade-in">
          <div className="bg-card w-full rounded-t-2xl p-6 space-y-4 animate-in slide-in-from-bottom max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">{specialistBatchModal.serviceName}</h3>
              <button type="button" onClick={() => setSpecialistBatchModal(null)} className="text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {(language === 'tr' ? 'Kisi bazli uzman tercihi' : 'Specialist preference by person')} • {personLabel(specialistBatchModal.entries[specialistBatchModal.cursor]?.personIndex || 1)}
            </p>
            <div className="overflow-hidden rounded-xl border border-border/70 bg-muted/10">
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${specialistBatchModal.cursor * 100}%)` }}
              >
                {specialistBatchModal.entries.map((entry) => {
                  const choice = specialistBatchModal.choices[entry.entryId] || { mode: 'ANY' as const, staffIds: [] }
                  return (
                    <div key={entry.entryId} className="w-full shrink-0 p-3 space-y-2">
                      <p className="text-[11px] font-semibold text-muted-foreground">
                        {personLabel(entry.personIndex)}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          toggleSpecialistChoiceForCurrent('ANY', undefined, entry.entryId)
                        }}
                        className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-sm font-semibold ${
                          choice.mode === 'ANY' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-foreground'
                        }`}
                      >
                        <span>{language === 'tr' ? 'Fark Etmez' : 'Any Specialist'}</span>
                      </button>
                      {specialistBatchModal.staff.map((staff) => (
                        <button
                          key={`${entry.entryId}-${staff.id}`}
                          type="button"
                          onClick={() => {
                            toggleSpecialistChoiceForCurrent('STAFF', String(staff.id), entry.entryId)
                          }}
                          className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                            choice.mode === 'SPECIFIC' && choice.staffIds.includes(String(staff.id))
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border bg-background text-foreground'
                          }`}
                        >
                          <span>{staff.name}</span>
                          {choice.mode === 'SPECIFIC' && choice.staffIds.includes(String(staff.id)) ? <Check className="h-4 w-4" /> : null}
                        </button>
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              {specialistBatchModal.entries.map((entry, index) => (
                <button
                  key={`step-dot-${entry.entryId}`}
                  type="button"
                  onClick={() => setSpecialistBatchModal((prev) => (prev ? { ...prev, cursor: index } : prev))}
                  className={`h-2.5 w-2.5 rounded-full transition-colors ${
                    specialistBatchModal.cursor === index ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={specialistBatchModal.cursor === 0}
                onClick={goToPreviousSpecialistPerson}
                className="flex-1 rounded-full"
              >
                {language === 'tr' ? 'Geri' : 'Back'}
              </Button>
              {specialistBatchModal.cursor < specialistBatchModal.entries.length - 1 ? (
                <Button type="button" onClick={goToNextSpecialistPerson} className="flex-1 rounded-full bg-primary text-primary-foreground">
                  {language === 'tr' ? 'Sonraki Kisi' : 'Next Person'}
                </Button>
              ) : (
                <Button type="button" onClick={commitSpecialistBatchSelection} className="flex-1 rounded-full bg-primary text-primary-foreground">
                  {language === 'tr' ? 'Ekle' : 'Add'}
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Specialist Selection Modal */}
      {specialistModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in">
          <div className="bg-card w-full rounded-t-2xl p-6 space-y-4 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">{specialistModal.service.name} • {personLabel(specialistModal.personIndex)}</h3>
              <button onClick={() => setSpecialistModal(null)} className="text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedSpecialistIds((prev) => {
                    const next = { ...prev }
                    delete next[specialistModal.entryId]
                    return next
                  })
                  setSelectedSpecialistOptionIds((prev) => ({ ...prev, [specialistModal.entryId]: [] }))
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg border-2 ${
                  !selectedSpecialistOptionIds[specialistModal.entryId]?.length ? 'border-primary bg-primary/10' : 'border-muted'
                }`}
              >
                <span className="text-sm font-medium text-foreground">{language === 'tr' ? 'Fark Etmez' : 'Any Specialist'}</span>
              </button>
              {specialistModal.staff.map((staff) => (
                <button
                  key={staff.id}
                  type="button"
                  onClick={() => {
                    const sid = String(staff.id)
                    setSelectedSpecialistOptionIds((prev) => {
                      const existing = prev[specialistModal.entryId] || []
                      const set = new Set(existing)
                      if (set.has(sid)) {
                        set.delete(sid)
                      } else {
                        set.add(sid)
                      }
                      const ids = Array.from(set)
                      setSelectedSpecialistIds((map) => {
                        const next = { ...map }
                        if (ids.length) {
                          next[specialistModal.entryId] = ids[0]
                        } else {
                          delete next[specialistModal.entryId]
                        }
                        return next
                      })
                      return { ...prev, [specialistModal.entryId]: ids }
                    })
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border-2 ${
                    (selectedSpecialistOptionIds[specialistModal.entryId] || []).includes(String(staff.id))
                      ? 'border-primary bg-primary/10'
                      : 'border-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">{staff.name}</span>
                  </div>
                  <div className="text-right">
                      {staff.overridePrice && <p className="text-xs font-bold text-secondary">{staff.overridePrice}₺</p>}
                      {staff.overrideDuration && <p className="text-[10px] text-muted-foreground">{staff.overrideDuration} dk</p>}
                  </div>
                </button>
              ))}
            </div>
            <Button onClick={() => setSpecialistModal(null)} className="w-full bg-primary text-primary-foreground rounded-full py-3">{text.confirmSelection}</Button>
          </div>
        </div>
      )}

      {rescheduleModal ? (
        <div className="fixed inset-0 bg-black/50 flex items-end z-[60] animate-in fade-in">
          <div className="bg-card w-full rounded-t-2xl p-6 space-y-4 animate-in slide-in-from-bottom max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">{text.dashboard.rescheduleTitle}</h3>
              <button
                type="button"
                onClick={() => (rescheduleModal.loading ? undefined : setRescheduleModal(null))}
                className="text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              {text.dashboard.rescheduleDescription}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1 text-xs">
                <span className="text-muted-foreground">{text.dashboard.dateLabel}</span>
                <input
                  type="date"
                  value={rescheduleModal.date}
                  onChange={(event) =>
                    setRescheduleModal((prev) => (prev ? { ...prev, date: event.target.value, preview: null, error: null } : prev))
                  }
                  className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm"
                />
              </label>
              <label className="space-y-1 text-xs">
                <span className="text-muted-foreground">{text.dashboard.timeLabel}</span>
                <input
                  type="time"
                  value={rescheduleModal.time}
                  onChange={(event) =>
                    setRescheduleModal((prev) => (prev ? { ...prev, time: event.target.value, preview: null, error: null } : prev))
                  }
                  className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm"
                />
              </label>
            </div>

            {rescheduleModal.suggestionsLoading ? (
              <div className="rounded-lg border border-border bg-muted/10 px-3 py-2 text-xs text-muted-foreground">
                {text.dashboard.checkingLabel}
              </div>
            ) : rescheduleModal.suggestedSlots.length ? (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {language === 'tr' ? 'Onerilen saatler' : 'Suggested slots'}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {rescheduleModal.suggestedSlots.map((slot) => (
                    <button
                      key={slot.startTime}
                      type="button"
                      onClick={() =>
                        setRescheduleModal((prev) =>
                          prev
                            ? {
                                ...prev,
                                time: slot.time,
                                preview: slot.preview,
                                error: slot.preview.hasConflicts && slot.preview.conflicts.length
                                  ? slot.preview.conflicts[0].reason || text.dashboard.rescheduleSlotUnavailable
                                  : null,
                              }
                            : prev,
                        )
                      }
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                        rescheduleModal.time === slot.time ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted/10 text-foreground'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => void runReschedulePreview()}
              disabled={rescheduleModal.loading}
              className="w-full rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary disabled:opacity-60"
            >
              {rescheduleModal.loading ? text.dashboard.checkingLabel : text.dashboard.checkAvailabilityLabel}
            </button>

            {rescheduleModal.error ? (
              <p className="rounded-md border border-red-300/40 bg-red-500/10 px-3 py-2 text-xs text-red-700">{rescheduleModal.error}</p>
            ) : null}

            {rescheduleModal.preview ? (
              <div className="space-y-2">
                {rescheduleModal.preview.items.map((item) => {
                  const availableCandidates = item.candidates.filter((candidate) => candidate.available)
                  const selectedCandidateId = rescheduleModal.assignments[item.appointmentId] || item.selectedStaffId || null
                  return (
                    <div key={item.appointmentId} className="rounded-lg border border-border bg-muted/10 p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{item.serviceName}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {new Date(item.newStartTime).toLocaleTimeString(LOCALE_MAP[language], { hour: '2-digit', minute: '2-digit' })}
                          {' - '}
                          {new Date(item.newEndTime).toLocaleTimeString(LOCALE_MAP[language], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {item.needsManualChoice ? (
                        <div className="space-y-1">
                          <p className="text-[11px] text-muted-foreground">{text.dashboard.chooseSpecialistPrompt}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {availableCandidates.map((candidate) => (
                              <button
                                key={`${item.appointmentId}-${candidate.staffId}`}
                                type="button"
                                onClick={() =>
                                  setRescheduleModal((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          assignments: {
                                            ...prev.assignments,
                                            [item.appointmentId]: candidate.staffId,
                                          },
                                        }
                                      : prev,
                                  )
                                }
                                className={`rounded-full border px-2 py-1 text-[11px] ${
                                  selectedCandidateId === candidate.staffId
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-border bg-background text-foreground'
                                }`}
                              >
                                {candidate.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : selectedCandidateId ? (
                        <p className="text-[11px] text-muted-foreground">
                          {text.dashboard.specialistLabel}: {item.candidates.find((candidate) => candidate.staffId === selectedCandidateId)?.name || `#${selectedCandidateId}`}
                        </p>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            ) : null}

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                disabled={rescheduleModal.loading}
                onClick={() => setRescheduleModal(null)}
                className="flex-1 rounded-full"
              >
                {text.dashboard.cancelButton}
              </Button>
              <Button
                type="button"
                disabled={rescheduleModal.loading}
                onClick={() => void commitRescheduleFromModal()}
                className="flex-1 rounded-full bg-primary text-primary-foreground"
              >
                {rescheduleModal.loading ? text.dashboard.savingLabel : text.dashboard.confirmUpdateLabel}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {waitlistModal.open ? (
        <div className="fixed inset-0 bg-black/50 flex items-end z-[64] animate-in fade-in">
          <div className="bg-card w-full rounded-t-2xl p-6 space-y-4 animate-in slide-in-from-bottom max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Join Waitlist</h3>
              <button
                type="button"
                onClick={() => (waitlistModal.submitting ? undefined : setWaitlistModal((prev) => ({ ...prev, open: false })))}
                className="text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              We will keep this specific day and time window on file. If a slot opens, we will send you an offer valid for 15 minutes.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Day</span>
                <input value={selectedDate || ''} disabled className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm" />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">People</span>
                <input value={String(numberOfPeople)} disabled className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm" />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">From</span>
                <input
                  type="time"
                  value={waitlistModal.timeWindowStart}
                  onChange={(event) => setWaitlistModal((prev) => ({ ...prev, timeWindowStart: event.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">To</span>
                <input
                  type="time"
                  value={waitlistModal.timeWindowEnd}
                  onChange={(event) => setWaitlistModal((prev) => ({ ...prev, timeWindowEnd: event.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </label>
            </div>

            <label className="flex items-start gap-3 rounded-xl border border-border bg-muted/10 p-3">
              <input
                type="checkbox"
                checked={waitlistModal.allowNearbyMatches}
                onChange={(event) => setWaitlistModal((prev) => ({ ...prev, allowNearbyMatches: event.target.checked }))}
                className="mt-1"
              />
              <span className="text-sm">
                <span className="font-medium text-foreground">Nearby time is okay too</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  If checked, we can also offer a slot up to 60 minutes earlier or later. We still try your exact time window first.
                </span>
              </span>
            </label>

            <div className="space-y-2 rounded-xl border border-border bg-muted/10 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Selected services</p>
              <div className="flex flex-wrap gap-2">
                {selectedServices.map((entry) => (
                  <span key={entry.entryId} className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium">
                    {entry.service.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm space-y-1">
                <span className="text-muted-foreground">Full name</span>
                <input
                  value={waitlistModal.customerName}
                  onChange={(event) => setWaitlistModal((prev) => ({ ...prev, customerName: event.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm space-y-1">
                <span className="text-muted-foreground">Phone</span>
                <div className="flex gap-2">
                  <select
                    value={waitlistModal.customerCountryIso}
                    onChange={(event) => setWaitlistModal((prev) => ({ ...prev, customerCountryIso: event.target.value, customerPhone: '' }))}
                    className="w-[48%] rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    {phoneCountryOptions.map((option) => (
                      <option key={option.iso} value={option.iso}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={waitlistModal.customerPhone}
                    onChange={(event) => {
                      const next = parsePhoneInput(event.target.value, waitlistModal.customerCountryIso)
                      setWaitlistModal((prev) => ({ ...prev, customerPhone: next.display || event.target.value }))
                    }}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    placeholder={waitlistModal.customerCountryIso === 'TR' ? '(531) 200 68 07' : 'Phone number'}
                  />
                </div>
                {waitlistModal.customerPhone && (!waitlistPhoneMeta.isValid || !waitlistPhoneMeta.isMobile) ? (
                  <p className="text-xs text-red-600">Please enter a valid mobile number.</p>
                ) : null}
              </label>
              <label className="block text-sm space-y-1">
                <span className="text-muted-foreground">Note (optional)</span>
                <textarea
                  value={waitlistModal.notes}
                  onChange={(event) => setWaitlistModal((prev) => ({ ...prev, notes: event.target.value }))}
                  className="w-full min-h-[88px] rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  placeholder="For example: after 17:00 is easier for me."
                />
              </label>
            </div>

            {waitlistModal.error ? (
              <p className="rounded-md border border-red-300/40 bg-red-500/10 px-3 py-2 text-xs text-red-700">{waitlistModal.error}</p>
            ) : null}
            {waitlistModal.successMessage ? (
              <p className="rounded-md border border-emerald-300/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700">{waitlistModal.successMessage}</p>
            ) : null}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={waitlistModal.submitting}
                onClick={() => setWaitlistModal((prev) => ({ ...prev, open: false }))}
                className="flex-1 rounded-full"
              >
                Close
              </Button>
              <Button
                type="button"
                disabled={waitlistModal.submitting}
                onClick={() => void submitWaitlistRequest()}
                className="flex-1 rounded-full bg-primary text-primary-foreground"
              >
                {waitlistModal.submitting ? 'Saving...' : 'Join Waitlist'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {cancelConfirmModal ? (
        <div className="fixed inset-0 bg-black/50 flex items-end z-[64] animate-in fade-in">
          <div className="bg-card w-full rounded-t-2xl p-6 space-y-4 animate-in slide-in-from-bottom max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">{language === 'tr' ? 'Randevu Iptali' : 'Cancel Appointment'}</h3>
              <button
                type="button"
                onClick={() => (cancelConfirmModal.loading ? undefined : setCancelConfirmModal(null))}
                className="text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">{text.dashboard.cancelConfirm}</p>
            {cancelConfirmModal.error ? (
              <p className="rounded-md border border-red-300/40 bg-red-500/10 px-3 py-2 text-xs text-red-700">
                {cancelConfirmModal.error}
              </p>
            ) : null}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={cancelConfirmModal.loading}
                onClick={() => setCancelConfirmModal(null)}
                className="flex-1 rounded-full"
              >
                {language === 'tr' ? 'Vazgec' : 'Keep Appointment'}
              </Button>
              <Button
                type="button"
                disabled={cancelConfirmModal.loading}
                onClick={() => {
                  void confirmCancelAppointments()
                }}
                className="flex-1 rounded-full bg-rose-600 text-white hover:bg-rose-700"
              >
                {cancelConfirmModal.loading ? (language === 'tr' ? 'Iptal ediliyor...' : 'Cancelling...') : text.dashboard.actionCancel}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {feedbackModal ? (
        <div className="fixed inset-0 bg-black/50 flex items-end z-[65] animate-in fade-in">
          <div className="bg-card w-full rounded-t-2xl p-6 space-y-4 animate-in slide-in-from-bottom max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Rate Your Appointment</h3>
              <button
                type="button"
                onClick={() => (feedbackModal.saving ? undefined : setFeedbackModal(null))}
                className="text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Share your experience to help the salon improve.
            </p>

            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  disabled={feedbackModal.saving}
                  onClick={() =>
                    setFeedbackModal((prev) => (prev ? { ...prev, rating: value } : prev))
                  }
                  className="rounded-lg border border-border bg-card p-2"
                >
                  <Star
                    className={`h-5 w-5 ${
                      value <= feedbackModal.rating ? 'fill-amber-400 text-amber-500' : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={feedbackModal.review}
              onChange={(event) =>
                setFeedbackModal((prev) => (prev ? { ...prev, review: event.target.value } : prev))
              }
              placeholder="Optional comment"
              rows={4}
              className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm"
            />

            {feedbackModal.error ? (
              <p className="rounded-md border border-red-300/40 bg-red-500/10 px-3 py-2 text-xs text-red-700">
                {feedbackModal.error}
              </p>
            ) : null}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={feedbackModal.saving}
                onClick={() => setFeedbackModal(null)}
                className="flex-1 rounded-full"
              >
                Close
              </Button>
              <Button
                type="button"
                disabled={feedbackModal.saving}
                onClick={() => {
                  void submitEvaluate()
                }}
                className="flex-1 rounded-full bg-primary text-primary-foreground"
              >
                {feedbackModal.saving ? 'Saving...' : 'Submit Review'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Registration Modal */}
      {showRegistrationModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50 animate-in fade-in">
          <div className="bg-card w-full rounded-t-3xl p-5 space-y-4 animate-in slide-in-from-bottom max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 sticky top-0 bg-card pb-2">
              <div>
                <h2 className="text-xl font-bold">{text.completeProfile}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Register once. After this, your future appointments can be completed with a single tap.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (registrationSubmitting) return
                  setShowRegistrationModal(false)
                  setRegistrationError(null)
                  setRegistrationStep('form')
                  setRegistrationVerificationId(null)
                  setRegistrationOtpCode('')
                  setRegistrationWhatsappConfirmChecked(false)
                }}
                className="text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {registrationStep === 'form' ? (
              <div className="space-y-3">
                {(originChannel === 'WHATSAPP' || originChannel === 'INSTAGRAM') && (originProfileName || originDisplayPhone || originPhone) ? (
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
                    <p className="font-semibold">
                      {originChannel === 'WHATSAPP' ? 'This link came from WhatsApp.' : 'This link came from Instagram.'}
                    </p>
                    {originProfileName ? <p className="mt-1 text-muted-foreground">Profile: {originProfileName}</p> : null}
                    {originDisplayPhone || originPhone ? (
                      <p className="text-muted-foreground">Number: {formatPhoneForDisplayFromDigits(originDisplayPhone || originPhone || '', registrationForm.countryIso) || originDisplayPhone || originPhone}</p>
                    ) : null}
                  </div>
                ) : null}

                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">{text.fullName}</span>
                  <input
                    type="text"
                    value={registrationForm.fullName}
                    onChange={(e) => {
                      setRegistrationError(null)
                      setRegistrationForm((p) => ({ ...p, fullName: e.target.value }))
                    }}
                    placeholder={text.fullName}
                    className="w-full px-3 py-3 rounded-xl bg-muted/30 text-sm border border-muted"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">{text.phone}</span>
                  <div className="flex gap-2">
                    <select
                      value={registrationForm.countryIso}
                      onChange={(e) => {
                        setRegistrationError(null)
                        setRegistrationForm((p) => ({ ...p, countryIso: e.target.value, phone: '' }))
                      }}
                      className="w-[48%] px-3 py-3 rounded-xl bg-muted/30 text-sm border border-muted"
                    >
                      {phoneCountryOptions.map((option) => (
                        <option key={option.iso} value={option.iso}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={registrationForm.phone}
                      onChange={(e) => {
                        setRegistrationError(null)
                        const next = parsePhoneInput(e.target.value, registrationForm.countryIso)
                        setRegistrationForm((p) => ({ ...p, phone: next.display || e.target.value }))
                      }}
                      placeholder={registrationForm.countryIso === 'TR' ? '(531) 200 68 07' : 'Phone number'}
                      className="flex-1 px-3 py-3 rounded-xl bg-muted/30 text-sm border border-muted"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {registrationCountryLabel} selected. We only accept valid mobile numbers for this country.
                  </p>
                  {registrationForm.phone && (!registrationPhoneMeta.isValid || !registrationPhoneMeta.isMobile) ? (
                    <p className="text-xs text-red-600">Please enter a valid mobile number for the selected country.</p>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Gender</span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => setRegistrationForm((p) => ({ ...p, gender: 'female' }))}
                        variant={registrationForm.gender === 'female' ? 'default' : 'outline'}
                        className="flex-1"
                      >
                        Woman
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setRegistrationForm((p) => ({ ...p, gender: 'male' }))}
                        variant={registrationForm.gender === 'male' ? 'default' : 'outline'}
                        className="flex-1"
                      >
                        Man
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Birth date</span>
                    <input
                      type="date"
                      value={registrationForm.birthDate}
                      onChange={(e) => setRegistrationForm((p) => ({ ...p, birthDate: e.target.value }))}
                      className="w-full px-3 py-3 rounded-xl bg-muted/30 text-sm border border-muted"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {registrationStep === 'whatsapp-confirm' ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-amber-300/40 bg-amber-500/10 px-4 py-3 text-sm">
                  <p className="font-semibold text-foreground">The number you entered does not match the WhatsApp number that opened this link.</p>
                  {originProfileName ? <p className="mt-2 text-muted-foreground">WhatsApp profile: {originProfileName}</p> : null}
                  {originDisplayPhone || originPhone ? (
                    <p className="text-muted-foreground">WhatsApp number: {formatPhoneForDisplayFromDigits(originDisplayPhone || originPhone || '', registrationForm.countryIso) || originDisplayPhone || originPhone}</p>
                  ) : null}
                  <p className="text-muted-foreground">Entered number: {registrationPhoneMeta.display || registrationForm.phone}</p>
                </div>
                <label className="flex items-start gap-3 rounded-2xl border border-border bg-muted/10 px-4 py-3 text-sm">
                  <input
                    type="checkbox"
                    checked={registrationWhatsappConfirmChecked}
                    onChange={(e) => setRegistrationWhatsappConfirmChecked(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span className="text-muted-foreground">I understand that I am registering with a different number and it will not be auto-verified from WhatsApp.</span>
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setRegistrationStep('form')}
                    className="flex-1 rounded-full"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    disabled={!registrationWhatsappConfirmChecked || registrationSubmitting}
                    onClick={() => void submitRegistration(true)}
                    className="flex-1 rounded-full py-3 bg-primary text-primary-foreground font-semibold disabled:opacity-60"
                  >
                    {registrationSubmitting ? text.loading : 'Continue with this number'}
                  </Button>
                </div>
              </div>
            ) : null}

            {registrationStep === 'otp' ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
                  We sent a 6-digit verification code to your WhatsApp number. Please enter it to finish your registration.
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={registrationOtpCode}
                  onChange={(e) => {
                    setRegistrationError(null)
                    setRegistrationOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }}
                  placeholder="123456"
                  className="w-full px-3 py-3 rounded-xl bg-muted/30 text-center tracking-[0.4em] text-lg border border-muted"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={registrationOtpSending}
                    onClick={() => void resendRegistrationCode()}
                    className="flex-1 rounded-full"
                  >
                    {registrationOtpSending ? text.loading : 'Resend code'}
                  </Button>
                  <Button
                    type="button"
                    disabled={registrationSubmitting || registrationOtpCode.length !== 6}
                    onClick={() => void confirmRegistrationCode()}
                    className="flex-1 rounded-full py-3 bg-primary text-primary-foreground font-semibold disabled:opacity-60"
                  >
                    {registrationSubmitting ? text.loading : 'Verify and continue'}
                  </Button>
                </div>
              </div>
            ) : null}

            {registrationError ? (
              <p className="rounded-xl border border-red-300/40 bg-red-500/10 px-3 py-2 text-sm text-red-700">{registrationError}</p>
            ) : null}
            {registrationStep === 'form' ? (
              <Button
                type="button"
                onClick={() => void submitRegistration(false)}
                disabled={!registrationCanContinue || registrationSubmitting}
                className="w-full rounded-full py-3 bg-primary text-primary-foreground font-semibold disabled:opacity-60"
              >
                {registrationSubmitting ? text.loading : text.registerContinue}
              </Button>
            ) : null}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50 animate-in fade-in">
          <div className="bg-card w-full rounded-t-3xl p-6 space-y-6 animate-in slide-in-from-bottom max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-bold">{text.approvalTitle}</h2>
            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20 space-y-4">
                <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">{text.dateAndTime}</p>
                    <p className="text-base font-bold">
                      {selectedDate ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString(LOCALE_MAP[language], { day: '2-digit', month: 'short' }) : '-'} - {selectedTimeSlot}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">{text.details}</p>
                    <p className="text-sm font-medium">{calculateTotalDuration()} {text.dashboard.minuteUnit} • {numberOfPeople} {text.people}</p>
                </div>
                <div className="pt-2 border-t border-primary/10">
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">{text.services}</p>
                    {selectedServices.map((entry) => (
                        <p key={entry.entryId} className="text-sm font-medium flex justify-between">
                            <span>
                              {entry.service.name} · {personLabel(entry.personIndex)}
                              {entry.source === 'PACKAGE' ? (
                                <span className="ml-2 text-[10px] text-primary font-bold">{text.dashboard.fromPackageLabel}</span>
                              ) : null}
                            </span>
                            <span>{entry.source === 'PACKAGE' ? text.dashboard.paymentFreeLabel : `${entry.service.salePrice || entry.service.originalPrice}₺`}</span>
                        </p>
                    ))}
                </div>
            </div>
            <Button onClick={handleConfirmAppointment} disabled={isBooking} className="w-full rounded-full py-4 bg-secondary text-secondary-foreground font-bold text-lg">
                {isBooking ? text.bookingInProgress : text.completeBooking}
            </Button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] animate-in fade-in">
              <Card className="w-[90%] max-w-sm rounded-3xl border-0 shadow-2xl text-center overflow-hidden animate-in zoom-in-95 duration-300">
                  <div className="bg-secondary/10 p-8 flex justify-center">
                      <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center animate-bounce">
                          <Check className="w-10 h-10 text-secondary-foreground" />
                      </div>
                  </div>
                  <CardContent className="p-8 space-y-4">
                      <h2 className="text-2xl font-bold text-foreground">{text.successTitle}</h2>
                      <p className="text-sm text-muted-foreground">{text.successInfo}</p>
                      <div className="bg-muted/30 p-4 rounded-2xl text-sm space-y-1">
                          <p className="font-bold">{lastAppointmentDetails?.date} • {lastAppointmentDetails?.time}</p>
                          <p className="text-xs opacity-70">{lastAppointmentDetails?.services.map((entry: any) => entry.service?.name || '').join(', ')}</p>
                      </div>
                      <Button onClick={() => setShowSuccessModal(false)} className="w-full rounded-full py-3 bg-primary text-primary-foreground font-bold">{text.successButton}</Button>
                  </CardContent>
              </Card>
          </div>
      )}
      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-24 right-4 z-[70] inline-flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-xs font-semibold text-accent-foreground shadow-lg hover:opacity-90"
        >
          <MessageCircle className="h-4 w-4" />
          {text.openWhatsapp}
        </a>
      )}
    </div>
  )
}

const SalonDashboard = ({ forcedLanguage }: BookingDashboardProps) => (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
        <SalonDashboardContent forcedLanguage={forcedLanguage} />
    </Suspense>
)

export default SalonDashboard
