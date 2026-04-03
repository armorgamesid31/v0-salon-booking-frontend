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
  Package2,
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
  getSalon,
  getServices,
  getStaffForService,
  checkAvailability,
  createAppointment,
  previewBookingReschedule,
  commitBookingReschedule,
  cancelBookingByToken,
  submitBookingFeedback,
  type ReschedulePreviewResponse,
} from '@/lib/api'
import LanguageSelector from '@/components/language-selector'
import { BOOKING_TEXT, DEFAULT_LANGUAGE, detectBrowserLanguage, LOCALE_MAP, normalizeLanguage, type LanguageCode } from '@/lib/i18n'
import { DUMMY_SALON } from '@/lib/constants'
import { extractTenantSlug } from '@/lib/tenant'
import { getRuntimeContent, getRuntimeText, type RuntimeContentMap } from '@/lib/runtime-content'

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
  preview: ReschedulePreviewResponse | null
  assignments: Record<number, number>
  error: string | null
}

type SelectedServiceEntry = {
  entryId: string
  service: ImportedServiceItem
  source: 'MANUAL' | 'PACKAGE'
  packageId?: string
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

const appointmentStatusMeta = (status: string) => {
  const normalized = String(status || '').trim().toUpperCase()
  if (normalized === 'COMPLETED') {
    return {
      label: 'Completed',
      className: 'border-emerald-400/35 bg-emerald-500/10 text-emerald-700',
    }
  }
  if (normalized === 'CANCELLED') {
    return {
      label: 'Cancelled',
      className: 'border-slate-400/35 bg-slate-500/10 text-slate-700',
    }
  }
  if (normalized === 'NO_SHOW') {
    return {
      label: 'No-show',
      className: 'border-amber-400/35 bg-amber-500/10 text-amber-700',
    }
  }
  if (normalized === 'CONFIRMED') {
    return {
      label: 'Confirmed',
      className: 'border-sky-400/35 bg-sky-500/10 text-sky-700',
    }
  }
  if (normalized === 'UPDATED') {
    return {
      label: 'Updated',
      className: 'border-violet-400/35 bg-violet-500/10 text-violet-700',
    }
  }
  return {
    label: 'Booked',
    className: 'border-primary/35 bg-primary/10 text-primary',
  }
}

const packageUsageKey = (packageId: string, serviceId: string) => `${packageId}:${serviceId}`

const canUpdateAppointment = (item: BookingContextAppointment) => {
  const status = String(item.status || '').trim().toUpperCase()
  const isFuture = new Date(item.startTime).getTime() > Date.now()
  if (typeof item.canUpdate === 'boolean') return item.canUpdate
  return isFuture && (status === 'BOOKED' || status === 'CONFIRMED' || status === 'UPDATED')
}

const canCancelAppointment = (item: BookingContextAppointment) => {
  const status = String(item.status || '').trim().toUpperCase()
  const isFuture = new Date(item.startTime).getTime() > Date.now()
  if (typeof item.canCancel === 'boolean') return item.canCancel
  return isFuture && (status === 'BOOKED' || status === 'CONFIRMED' || status === 'UPDATED')
}

const canEvaluateAppointment = (item: BookingContextAppointment) => {
  const status = String(item.status || '').trim().toUpperCase()
  const isPast = new Date(item.endTime).getTime() <= Date.now()
  if (typeof item.canEvaluate === 'boolean') return item.canEvaluate
  return isPast && status === 'COMPLETED'
}

const SalonDashboardContent = ({ forcedLanguage }: BookingDashboardProps) => {
  const searchParams = useSearchParams()
  const searchParamsString = searchParams.toString()
  const [stableMagicToken, setStableMagicToken] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [specialistModal, setSpecialistModal] = useState<{service: ImportedServiceItem, staff: Employee[]} | null>(null)
  const [selectedSpecialistIds, setSelectedSpecialistIds] = useState<Record<string, string>>({})
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
  const [originInstagramId, setOriginInstagramId] = useState<string | null>(null)
  const [salonData, setSalonData] = useState<any>(null)
  const [availableServices, setAvailableServices] = useState<ServiceCategory[]>([])
  const [activePackages, setActivePackages] = useState<ActiveCustomerPackage[]>([])
  const [recentAppointments, setRecentAppointments] = useState<BookingContextAppointment[]>([])
  const [rescheduleModal, setRescheduleModal] = useState<RescheduleModalState | null>(null)
  const [availableSlots, setAvailableSlots] = useState<{time: string, available: boolean}[]>([])
  const [language, setLanguage] = useState<LanguageCode>(DEFAULT_LANGUAGE)
  const [runtimeContent, setRuntimeContent] = useState<RuntimeContentMap>({})
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [feedbackModal, setFeedbackModal] = useState<{
    appointmentId: number
    rating: number
    review: string
    saving: boolean
    error: string | null
  } | null>(null)
  const [isBooking, setIsBooking] = useState(false)
  const [lastAppointmentDetails, setLastAppointmentDetails] = useState<any>(null)
  const [logoError, setLogoError] = useState(false)
  const [packagesOpen, setPackagesOpen] = useState(true)
  const [appointmentsOpen, setAppointmentsOpen] = useState(true)

  const [registrationForm, setRegistrationForm] = useState({
    fullName: '',
    phone: '',
    gender: 'female' as 'female' | 'male',
    birthDate: '',
    acceptMarketing: false,
  })
  const text = useMemo(() => {
    const fallback = BOOKING_TEXT[language]

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
    }
  }, [language, runtimeContent])

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
  const totalPrice = selectedServices.reduce((sum, entry) => {
    if (entry.source === 'PACKAGE') {
      return sum
    }
    const service = entry.service
    return sum + (service.salePrice || service.originalPrice || 0)
  }, 0);

  const flatServiceCatalog = useMemo(() => {
    return availableServices.flatMap((category) =>
      category.services.map((service) => ({
        categoryName: category.name,
        service,
      })),
    )
  }, [availableServices])

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
    setOriginInstagramId(context.originInstagramId || null)
    setActivePackages(context.activePackages || [])
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
        phone: context.customerPhone || prev.phone,
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
          setSelectedDate(null)
          setSelectedTimeSlot(null)
      }
  }, [selectedGender, salonId])

  // Fetch Slots
  useEffect(() => {
    if (selectedDate && selectedServices.length > 0 && salonId) {
        const today = new Date()
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(selectedDate).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`

        checkAvailability(salonId, selectedServices[0].service.id, dateStr, numberOfPeople)
            .then(res => {
                if (res.available && res.slots) {
                    setAvailableSlots(res.slots.map(s => ({ time: s, available: true })))
                } else {
                    setAvailableSlots([])
                }
            })
    }
  }, [selectedDate, selectedServices, numberOfPeople, salonId])

  const calculateTotalDuration = () => {
    return selectedServices.reduce((sum, entry) => {
        return sum + (parseInt(entry.service.duration) || 0);
    }, 0);
  }

  const countSelectedService = (serviceId: string, source?: 'MANUAL' | 'PACKAGE') => {
    return selectedServices.filter(
      (entry) => entry.service.id === serviceId && (!source || entry.source === source),
    ).length
  }

  const buildEntryId = (serviceId: string) =>
    `${serviceId}:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 8)}`

  const handleServiceToggle = async (service: any, categoryName: string) => {
    const serviceData: ImportedServiceItem = {
      id: service.id,
      name: `${categoryName} - ${service.name}`,
      originalPrice: service.originalPrice || service.salePrice || 0,
      salePrice: service.salePrice,
      duration: service.duration,
      requiresSpecialist: service.requiresSpecialist
    }

    const manualCount = countSelectedService(service.id, 'MANUAL')
    if (manualCount > 0) {
      setSelectedServices((prev) => {
        const index = prev.findIndex((entry) => entry.service.id === service.id && entry.source === 'MANUAL')
        if (index === -1) return prev
        const next = [...prev]
        next.splice(index, 1)
        return next
      })
    } else {
      setSelectedServices((prev) => [
        ...prev,
        {
          entryId: buildEntryId(service.id),
          service: serviceData,
          source: 'MANUAL',
        },
      ])
      // If specialist is required, only show modal if there's more than one choice.
      // If only one staff member exists, they will be auto-assigned.
      if (service.requiresSpecialist) {
          const staff = await getStaffForService(service.id.toString());
          if (staff && staff.length > 1) {
            setSpecialistModal({ service: serviceData, staff });
          }
      }
    }
    setSelectedDate(null)
    setSelectedTimeSlot(null)
  }

  const handleAddFromPackage = async (input: { packageId: string; serviceId: string; serviceName?: string | null }) => {
    const { packageId, serviceId } = input
    const matched = flatServiceCatalog.find((row) => row.service.id === serviceId)

    if (!matched) {
      alert('Bu paket hizmeti bu cinsiyet filtresinde listelenmiyor.')
      return
    }

    const usageKey = packageUsageKey(packageId, serviceId)
    const pkg = activePackages.find((p) => p.id === packageId)
    const balance = pkg?.serviceBalances.find((b) => b.serviceId === serviceId)
    const dynamicRemaining = balance
      ? Math.max(0, balance.remainingQuota - (packageUsageByKey[usageKey] || 0))
      : 0
    if (dynamicRemaining <= 0) {
      alert('No quota left for this service in selected package.')
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

    setSelectedServices((prev) => [
      ...prev,
      {
        entryId: buildEntryId(serviceId),
        service: serviceData,
        source: 'PACKAGE',
        packageId,
      },
    ])
    setPackageUsageByKey((prev) => ({
      ...prev,
      [usageKey]: (prev[usageKey] || 0) + 1,
    }))
    setSelectedDate(null)
    setSelectedTimeSlot(null)
  }

  const handleConfirmAppointment = async () => {
    if (!customerId || !selectedDate || !selectedTimeSlot || selectedServices.length === 0) return;
    
    setIsBooking(true);
    try {
        const today = new Date()
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(selectedDate).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`

        const res = await createAppointment(salonId, customerId, {
            services: selectedServices.map(entry => ({
                serviceId: entry.service.id,
                employeeId: selectedSpecialistIds[entry.service.id],
                duration: entry.service.duration
            })),
            packageSelections: selectedServices
              .filter((entry) => entry.source === 'PACKAGE' && Boolean(entry.packageId))
              .map((entry) => ({
                serviceId: entry.service.id,
                customerPackageId: String(entry.packageId),
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
            setSelectedDate(null);
            setSelectedTimeSlot(null);
            if (stableMagicToken) {
              await reloadBookingContext();
            }
        } else {
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
    if (!stableMagicToken || !groupItems.length) return
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
      preview: null,
      assignments: {},
      error: null,
    })
  }

  const runReschedulePreview = async () => {
    if (!rescheduleModal || !stableMagicToken) return
    const base = new Date(`${rescheduleModal.date}T${rescheduleModal.time}:00`)
    if (Number.isNaN(base.getTime())) {
      setRescheduleModal((prev) => (prev ? { ...prev, error: 'Please select a valid date and time.' } : prev))
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
        error = preview.conflicts[0].reason || 'Selected slot is not available.'
      }
      setRescheduleModal((prev) => (prev ? { ...prev, preview, loading: false, error } : prev))
    } catch (err: any) {
      setRescheduleModal((prev) => (prev ? { ...prev, loading: false, error: err?.message || 'Preview could not be generated.' } : prev))
    }
  }

  const commitRescheduleFromModal = async () => {
    if (!rescheduleModal || !stableMagicToken) return
    const base = new Date(`${rescheduleModal.date}T${rescheduleModal.time}:00`)
    if (Number.isNaN(base.getTime())) {
      setRescheduleModal((prev) => (prev ? { ...prev, error: 'Please select a valid date and time.' } : prev))
      return
    }

    const preview = rescheduleModal.preview
    if (!preview) {
      await runReschedulePreview()
      return
    }
    if (preview.hasConflicts) {
      setRescheduleModal((prev) => (prev ? { ...prev, error: preview.conflicts[0]?.reason || 'There is a scheduling conflict.' } : prev))
      return
    }

    const requiredManual = preview.items.filter((item) => item.needsManualChoice)
    for (const item of requiredManual) {
      if (!rescheduleModal.assignments[item.appointmentId]) {
        setRescheduleModal((prev) =>
          prev ? { ...prev, error: `Please pick an available specialist for ${item.serviceName}.` } : prev,
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
      setRescheduleModal((prev) => (prev ? { ...prev, loading: false, error: err?.message || 'Reschedule failed.' } : prev))
    }
  }

  const handleRepeatGroup = (groupItems: BookingContextAppointment[]) => {
    const serviceIds = groupItems
      .map((item) => String(item.serviceId || ''))
      .filter((id) => id)
    if (!serviceIds.length) {
      alert('No service information found to repeat this appointment.')
      return
    }

    const selections: SelectedServiceEntry[] = []
    for (const serviceId of serviceIds) {
      const matched = flatServiceCatalog.find((row) => row.service.id === serviceId)
      if (matched) {
        selections.push({
          entryId: buildEntryId(matched.service.id),
          source: 'MANUAL',
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
      alert('These services are not available in current filter. Try changing gender filter.')
      return
    }

    setSelectedServices(selections)
    setPackageUsageByKey({})
    setSelectedSpecialistIds({})
    setSelectedDate(null)
    setSelectedTimeSlot(null)
    const bookingArea = document.querySelector('[data-scroll-target="date-time"]')
    bookingArea?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleCancelGroup = async (groupItems: BookingContextAppointment[]) => {
    if (!stableMagicToken) return
    const appointmentIds = groupItems
      .map((item) => Number(item.id))
      .filter((id) => Number.isInteger(id) && id > 0)
    if (!appointmentIds.length) return
    if (!window.confirm('Cancel selected appointment(s)?')) return

    try {
      await cancelBookingByToken({
        token: stableMagicToken,
        appointmentIds,
      })
      await reloadBookingContext()
    } catch (err: any) {
      alert(err?.message || 'Cancellation failed.')
    }
  }

  const openEvaluateModal = (groupItems: BookingContextAppointment[]) => {
    const candidate = groupItems.find((item) => item.canEvaluate)
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
      setFeedbackModal((prev) => (prev ? { ...prev, saving: false, error: err?.message || 'Feedback could not be saved.' } : prev))
    }
  }

  const dateOptions = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() + i)
      const dayLabel = new Intl.DateTimeFormat(LOCALE_MAP[language], { weekday: 'short' }).format(d)
      return { day: d.getDate(), label: dayLabel }
  })

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
                    onClick={() => setPackagesOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between gap-2"
                  >
                    <div className="flex items-start gap-2 text-left">
                      <div className="mt-0.5 rounded-lg bg-primary/15 p-1.5 text-primary">
                        <Package2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-primary">Membership Packages</p>
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
                                  ? `Expires ${new Date(pkg.expiresAt).toLocaleDateString('en-GB', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                    })}`
                                  : 'No expiry date'}
                              </p>
                            </div>
                            <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                              {pkg.serviceBalances.length} services
                            </span>
                          </div>

                          <div className="space-y-2">
                            {pkg.serviceBalances.map((balance) => {
                              const usageKey = packageUsageKey(String(pkg.id), String(balance.serviceId))
                              const dynamicRemaining = Math.max(0, balance.remainingQuota - (packageUsageByKey[usageKey] || 0))
                              const ratio = balance.initialQuota > 0 ? dynamicRemaining / balance.initialQuota : 0
                              const ratioPercent = Math.max(0, Math.min(100, Math.round(ratio * 100)))
                              return (
                                <button
                                  key={`${pkg.id}:${balance.serviceId}`}
                                  type="button"
                                  disabled={dynamicRemaining <= 0}
                                  onClick={() =>
                                    void handleAddFromPackage({
                                      packageId: pkg.id,
                                      serviceId: balance.serviceId,
                                      serviceName: balance.serviceName || null,
                                    })
                                  }
                                  className="w-full rounded-lg border border-border bg-card px-2.5 py-2 text-left transition-colors hover:border-primary/35 hover:bg-primary/5 disabled:opacity-45 disabled:cursor-not-allowed"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs font-semibold text-foreground inline-flex items-center gap-1.5">
                                      <Sparkles className="h-3.5 w-3.5 text-primary/80" />
                                      {balance.serviceName || `Service #${balance.serviceId}`}
                                    </p>
                                    <p className="text-[11px] font-semibold text-primary">
                                      {dynamicRemaining}/{balance.initialQuota}
                                    </p>
                                  </div>
                                  <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                                    <div className="h-full rounded-full bg-primary/70" style={{ width: `${ratioPercent}%` }} />
                                  </div>
                                  <p className="mt-1 text-[10px] text-muted-foreground">
                                    {dynamicRemaining > 0 ? 'Use this balance for the current booking' : 'No quota left'}
                                  </p>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : packagesOpen ? (
                    <div className="rounded-lg border border-dashed border-primary/25 bg-background/70 px-3 py-3 text-xs text-muted-foreground">
                      No active package found for this customer.
                    </div>
                  ) : null}
                </div>
              ) : null}

              {isKnownCustomer ? (
                <div className="rounded-2xl border border-border bg-card/70 p-4 space-y-3">
                  <button
                    type="button"
                    onClick={() => setAppointmentsOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between"
                  >
                    <div className="flex items-start gap-2 text-left">
                      <div className="mt-0.5 rounded-lg bg-primary/15 p-1.5 text-primary">
                        <CalendarCheck2 className="h-4 w-4" />
                      </div>
                      <div>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-foreground">My Appointments</p>
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
                        const statuses = Array.from(new Set(group.items.map((item) => String(item.status || '').toUpperCase())))
                        const serviceNames = Array.from(new Set(group.items.map((item) => item.serviceName).filter(Boolean)))
                        const staffNames = Array.from(new Set(group.items.map((item) => item.staffName).filter(Boolean)))
                        const statusPills = statuses.map((status) => appointmentStatusMeta(status))
                        return (
                        <div key={group.key} className="rounded-xl border border-border bg-background p-3 text-xs space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-foreground">
                                {new Date(first.startTime).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {new Date(first.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                {' - '}
                                {new Date(last.endTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
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
                          </div>

                          {serviceNames.length ? (
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

                          {staffNames.length ? (
                            <p className="text-[11px] text-muted-foreground">
                              Specialist: {staffNames.join(', ')}
                            </p>
                          ) : null}

                          {group.items.some((item) => item.rescheduledFromAppointmentId) ? (
                            <p className="text-[10px] font-medium text-violet-600">Includes rescheduled record</p>
                          ) : null}

                          {stableMagicToken ? (
                            <div className="pt-1 space-y-1.5">
                              <div className="grid grid-cols-2 gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleRepeatGroup(group.items)}
                                  className="inline-flex items-center justify-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] font-semibold text-foreground hover:bg-muted/40"
                                >
                                  <RefreshCcw className="h-3.5 w-3.5" />
                                  Repeat
                                </button>
                                {group.cancelableItems.length ? (
                                  <button
                                    type="button"
                                    onClick={() => void handleCancelGroup(group.cancelableItems)}
                                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-rose-300/50 bg-rose-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-500/15"
                                  >
                                    <Ban className="h-3.5 w-3.5" />
                                    Cancel
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
                                Update Appointment
                              </button>
                              ) : null}

                              {group.evaluableItems.length ? (
                                <button
                                  type="button"
                                  onClick={() => openEvaluateModal(group.evaluableItems)}
                                  className="w-full inline-flex items-center justify-center gap-1 rounded-lg border border-amber-300/50 bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-500/15"
                                >
                                  <Star className="h-3.5 w-3.5" />
                                  Evaluate
                                </button>
                              ) : null}
                            </div>
                          ) : (
                            <div className="pt-1">
                              <p className="text-[10px] text-muted-foreground">Updates are available for future booked/confirmed visits.</p>
                            </div>
                          )}
                        </div>
                        )
                      })}
                    </div>
                  ) : appointmentsOpen ? (
                    <div className="rounded-lg border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">
                      No appointments found yet.
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
                                      package x{packageCount}
                                    </span>
                                  ) : null}
                                  {totalCount > packageCount ? (
                                    <span className="text-[10px] rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                                      manual x{totalCount - packageCount}
                                    </span>
                                  ) : null}
                                </div>
                                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Clock className="w-3 h-3" />{service.duration}</span>
                              </div>
                              <div className="text-right">
                                {displayPrice && displayPrice > 0 && <p className="text-sm font-bold text-secondary">{displayPrice}₺</p>}
                                <Button size="sm" onClick={() => handleServiceToggle(service, category.name)} variant={isSelected ? 'default' : 'outline'} className="mt-2 rounded-full text-xs font-semibold">
                                  {isSelected ? `Remove Manual` : text.add}
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
                  <button key={opt.day} onClick={() => setSelectedDate(opt.day.toString())} className={`px-3 py-3 rounded-lg font-semibold text-sm flex flex-col items-center gap-1 ${selectedDate === opt.day.toString() ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    <span className="text-xs">{opt.label}</span>
                    <span className="text-base font-bold">{opt.day}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedDate && (
              <div className="mb-4 space-y-3 px-4 max-w-2xl mx-auto">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> {text.selectTime}</h3>
                {availableSlots.length === 0 ? (
                    <div className="p-8 text-center bg-muted/20 rounded-xl border border-dashed border-muted"><AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">{text.noAppointment}</p></div>
                ) : (
                    <div className="grid grid-cols-4 gap-2">
                        {availableSlots.map((slot) => (
                            <button key={slot.time} onClick={() => setSelectedTimeSlot(slot.time)} className={`p-2 rounded-lg text-xs font-semibold ${selectedTimeSlot === slot.time ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>{slot.time}</button>
                        ))}
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
                </div>
                <Button onClick={() => {
                    if (!selectedDate || !selectedTimeSlot) {
                      document.querySelector('[data-scroll-target="date-time"]')?.scrollIntoView({ behavior: "smooth" })
                    } else {
                      if (isKnownCustomer) setShowConfirmationModal(true)
                      else setShowRegistrationModal(true)
                    }
                  }} className={`px-6 py-3 font-bold text-sm rounded-full ${selectedDate && selectedTimeSlot ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'}`} disabled={!selectedDate || !selectedTimeSlot}>{text.confirmAppointment}</Button>
              </div>
            </div>
          </div>
        )}

      {/* Specialist Selection Modal */}
      {specialistModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in">
          <div className="bg-card w-full rounded-t-2xl p-6 space-y-4 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">{specialistModal.service.name}</h3>
              <button onClick={() => setSpecialistModal(null)} className="text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-2">
              {specialistModal.staff.map((staff) => (
                <label key={staff.id} className="flex items-center justify-between p-3 rounded-lg border-2 border-muted cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="specialist" checked={selectedSpecialistIds[specialistModal.service.id] === staff.id} onChange={() => setSelectedSpecialistIds(prev => ({ ...prev, [specialistModal.service.id]: staff.id }))} className="w-5 h-5 accent-primary" />
                    <span className="text-sm font-medium text-foreground">{staff.name}</span>
                  </div>
                  <div className="text-right">
                      {staff.overridePrice && <p className="text-xs font-bold text-secondary">{staff.overridePrice}₺</p>}
                      {staff.overrideDuration && <p className="text-[10px] text-muted-foreground">{staff.overrideDuration} dk</p>}
                  </div>
                </label>
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
              <h3 className="text-lg font-bold text-foreground">Update Appointment</h3>
              <button
                type="button"
                onClick={() => (rescheduleModal.loading ? undefined : setRescheduleModal(null))}
                className="text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Select a new start date and time. Back-to-back services will move together and keep their duration.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1 text-xs">
                <span className="text-muted-foreground">Date</span>
                <input
                  type="date"
                  value={rescheduleModal.date}
                  onChange={(event) =>
                    setRescheduleModal((prev) => (prev ? { ...prev, date: event.target.value } : prev))
                  }
                  className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm"
                />
              </label>
              <label className="space-y-1 text-xs">
                <span className="text-muted-foreground">Time</span>
                <input
                  type="time"
                  value={rescheduleModal.time}
                  onChange={(event) =>
                    setRescheduleModal((prev) => (prev ? { ...prev, time: event.target.value } : prev))
                  }
                  className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => void runReschedulePreview()}
              disabled={rescheduleModal.loading}
              className="w-full rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary disabled:opacity-60"
            >
              {rescheduleModal.loading ? 'Checking...' : 'Check Availability'}
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
                          {new Date(item.newStartTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          {' - '}
                          {new Date(item.newEndTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {item.needsManualChoice ? (
                        <div className="space-y-1">
                          <p className="text-[11px] text-muted-foreground">Preferred specialist is unavailable. Please choose one:</p>
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
                          Specialist: {item.candidates.find((candidate) => candidate.staffId === selectedCandidateId)?.name || `#${selectedCandidateId}`}
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
                Cancel
              </Button>
              <Button
                type="button"
                disabled={rescheduleModal.loading}
                onClick={() => void commitRescheduleFromModal()}
                className="flex-1 rounded-full bg-primary text-primary-foreground"
              >
                {rescheduleModal.loading ? 'Saving...' : 'Confirm Update'}
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
          <div className="bg-card w-full rounded-t-3xl p-4 space-y-3 animate-in slide-in-from-bottom max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between sticky top-0 bg-card pb-2">
              <h2 className="text-xl font-bold">{text.completeProfile}</h2>
              <button onClick={() => setShowRegistrationModal(false)} className="text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-2.5">
              <input type="text" value={registrationForm.fullName} onChange={(e) => setRegistrationForm(p => ({ ...p, fullName: e.target.value }))} placeholder={text.fullName} className="w-full px-3 py-2 rounded-lg bg-muted/30 text-sm border border-muted" />
              <input type="tel" value={registrationForm.phone} onChange={(e) => setRegistrationForm(p => ({ ...p, phone: e.target.value }))} placeholder={text.phone} className="w-full px-3 py-2 rounded-lg bg-muted/30 text-sm border border-muted" />
              <div className="flex gap-2">
                  <Button onClick={() => setRegistrationForm(p => ({ ...p, gender: "female" }))} variant={"female" === registrationForm.gender ? "default" : "outline"} className="flex-1">👩</Button>
                  <Button onClick={() => setRegistrationForm(p => ({ ...p, gender: "male" }))} variant={"male" === registrationForm.gender ? "default" : "outline"} className="flex-1">👨</Button>
              </div>
              <input type="date" value={registrationForm.birthDate} onChange={(e) => setRegistrationForm(p => ({ ...p, birthDate: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-muted/30 text-sm border border-muted" />
            </div>
            <Button onClick={async () => {
                if (!registrationForm.fullName || !registrationForm.phone) return alert(text.fillInfoError);
                try {
                  const res = await registerCustomer({
                    ...registrationForm,
                    originChannel,
                    originPhone,
                    instagramId: originInstagramId,
                    magicToken: stableMagicToken,
                  });
                  if (res.customerId) { 
                      setCustomerId(res.customerId); 
                      setCustomerName(registrationForm.fullName);
                      setIsKnownCustomer(true); 
                      setShowRegistrationModal(false); 
                      setShowConfirmationModal(true); 
                  }
                } catch (err: any) {
                  alert(err.message || text.genericError);
                }
            }} className="w-full rounded-full py-2 bg-primary text-primary-foreground font-semibold">{text.registerContinue}</Button>
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
                    <p className="text-base font-bold">{selectedDate} Mart - {selectedTimeSlot}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">{text.details}</p>
                    <p className="text-sm font-medium">{calculateTotalDuration()} min • {numberOfPeople} {text.people}</p>
                </div>
                <div className="pt-2 border-t border-primary/10">
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">{text.services}</p>
                    {selectedServices.map((entry) => (
                        <p key={entry.entryId} className="text-sm font-medium flex justify-between">
                            <span>
                              {entry.service.name}
                              {entry.source === 'PACKAGE' ? (
                                <span className="ml-2 text-[10px] text-primary font-bold">paketten</span>
                              ) : null}
                            </span>
                            <span>{entry.source === 'PACKAGE' ? '0₺' : `${entry.service.salePrice || entry.service.originalPrice}₺`}</span>
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
