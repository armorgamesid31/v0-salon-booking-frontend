'use client'

import React, { useState, useEffect, Suspense, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown, Search, Zap, Sparkles, Heart, Scissors, Droplet, Flower, Wand2, Plus, Calendar, Clock, X, Check, AlertCircle, Hand, Lightbulb, MessageCircle } from 'lucide-react'
import type { ServiceItem as ImportedServiceItem, ServiceCategory, Employee } from '@/lib/types'
import { getBookingContextByToken, registerCustomer, getSalon, getServices, getStaffForService, checkAvailability, createAppointment } from '@/lib/api'
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

const SalonDashboardContent = ({ forcedLanguage }: BookingDashboardProps) => {
  const searchParams = useSearchParams()
  const searchParamsString = searchParams.toString()
  const pathname = usePathname()
  const router = useRouter()
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [specialistModal, setSpecialistModal] = useState<{service: ImportedServiceItem, staff: Employee[]} | null>(null)
  const [selectedSpecialistIds, setSelectedSpecialistIds] = useState<Record<string, string>>({})
  const [selectedServices, setSelectedServices] = useState<ImportedServiceItem[]>([])
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
  const [availableSlots, setAvailableSlots] = useState<{time: string, available: boolean}[]>([])
  const [language, setLanguage] = useState<LanguageCode>(DEFAULT_LANGUAGE)
  const [runtimeContent, setRuntimeContent] = useState<RuntimeContentMap>({})
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [lastAppointmentDetails, setLastAppointmentDetails] = useState<any>(null)
  const [logoError, setLogoError] = useState(false)

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
  const totalPrice = selectedServices.reduce((sum, s) => {
    const staffId = selectedSpecialistIds[s.id];
    // We would need the full staff info here to check overrides, for now use base
    return sum + (s.salePrice || s.originalPrice || 0);
  }, 0);

  // Fetch initial salon and services data
  useEffect(() => {
    const token = getMagicToken(searchParams)
    
    const loadSalonAndServices = async (sId: string, gender: string) => {
        try {
            const [salon, services] = await Promise.all([
                getSalon(sId),
                getServices(sId, gender)
            ]);
            setSalonData(salon);
            setAvailableServices(services);
        } catch (err) {
            console.error("Critical load error:", err);
        }
    }

    if (token) {
      getBookingContextByToken(token).then((context) => {
        if (context) {
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
          if (context.isKnownCustomer && context.customerId) {
            setCustomerId(context.customerId)
            setCustomerName(context.customerName)
          }
          if (!context.isKnownCustomer) {
            setRegistrationForm((prev) => ({
              ...prev,
              fullName: context.customerName || prev.fullName,
              phone: context.customerPhone || prev.phone,
              gender: (context.customerGender as any) || prev.gender
            }));
          }
          const gender = context.customerGender || 'female';
          setSelectedGender(gender as 'female' | 'male');
          loadSalonAndServices(context.salonId, gender);
        }
      })
    } else {
        const sId = searchParams.get('salonId') || '1';
        setSalonId(sId)
        loadSalonAndServices(sId, selectedGender);
    }
  }, [searchParams, forcedLanguage])

  // Refetch services when gender changes
  useEffect(() => {
      if (salonId) {
          getServices(salonId, selectedGender).then(setAvailableServices)
          setSelectedServices([])
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

        checkAvailability(salonId, selectedServices[0].id, dateStr, numberOfPeople)
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
    return selectedServices.reduce((sum, service) => {
        return sum + (parseInt(service.duration) || 0);
    }, 0);
  }

  const handleServiceToggle = async (service: any, categoryName: string) => {
    const serviceData: ImportedServiceItem = {
      id: service.id,
      name: `${categoryName} - ${service.name}`,
      originalPrice: service.originalPrice || service.salePrice || 0,
      salePrice: service.salePrice,
      duration: service.duration,
      requiresSpecialist: service.requiresSpecialist
    }

    const isCurrentlySelected = selectedServices.some(s => s.id === service.id)

    if (isCurrentlySelected) {
      setSelectedServices(prev => prev.filter(s => s.id !== service.id))
      const newStaffIds = { ...selectedSpecialistIds };
      delete newStaffIds[service.id];
      setSelectedSpecialistIds(newStaffIds);
    } else {
      setSelectedServices(prev => [...prev, serviceData])
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
            services: selectedServices.map(s => ({
                serviceId: s.id,
                employeeId: selectedSpecialistIds[s.id],
                duration: s.duration
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
            setSelectedDate(null);
            setSelectedTimeSlot(null);
        } else {
            alert(res.error || text.bookingFailed);
        }
    } catch (err) {
        alert(text.genericError);
    } finally {
        setIsBooking(false);
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
        const query = searchParams.toString()
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
                      const isSelected = selectedServices.some(s => s.id === service.id);
                      const displayPrice = service.salePrice || service.originalPrice;
                      return (
                        <div key={service.id} className="w-full text-left">
                          <div className={`p-3 rounded-lg border-2 transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-foreground text-sm">{service.name}</p>
                                  {isSelected && <Check className="w-4 h-4 text-primary" />}
                                </div>
                                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Clock className="w-3 h-3" />{service.duration}</span>
                              </div>
                              <div className="text-right">
                                {displayPrice && displayPrice > 0 && <p className="text-sm font-bold text-secondary">{displayPrice}₺</p>}
                                <Button size="sm" onClick={() => handleServiceToggle(service, category.name)} variant={isSelected ? 'default' : 'outline'} className="mt-2 rounded-full text-xs font-semibold">{isSelected ? text.added : text.add}</Button>
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
                    instagramId: originInstagramId
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
                    {selectedServices.map(s => (
                        <p key={s.id} className="text-sm font-medium flex justify-between">
                            <span>{s.name}</span>
                            <span>{s.salePrice || s.originalPrice}₺</span>
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
                          <p className="text-xs opacity-70">{lastAppointmentDetails?.services.map((s: any) => s.name).join(', ')}</p>
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
