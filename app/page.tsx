'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown, Search, Bell, Zap, Sparkles, Leaf, Heart, Scissors, Palette, Eye, Droplet, Flower, Wand2, MessageCircle, Plus, Calendar, Clock, Star, X, History, Package, Check, AlertCircle, Gem, Lightbulb, Hand, Syringe as Ring } from 'lucide-react'
import { DUMMY_SERVICES, SPECIALIST_SERVICES as CONST_SPECIALIST_SERVICES, DUMMY_EMPLOYEES, DUMMY_PACKAGES } from '@/lib/constants'
import type { ServiceItem as ImportedServiceItem, ServiceCategory } from '@/lib/types'

const SPECIALIST_SERVICES = CONST_SPECIALIST_SERVICES // Declare the SPECIALIST_SERVICES variable

interface PastAppointment {
  id: string
  name: string
  service: string
  date: string
  time: string
  endTime: string
  status: 'completed' | 'missed' | 'updated' | 'rated'
  specialists: string[]
  packageName?: string
  isRated?: boolean
  services: string[]
  selectedSpecialist: string
}

interface ActivePackage {
  id: string
  name: string
  badge: 'Aktif' | 'Bitiryor'
  remainingSessions: number
  totalSessions: number
  expiryDate: string
  warning?: string
  availableServices: Array<{
    id: string
    name: string
    duration: string
    used: number
    total: number
    isFinished?: boolean
  }>
}

interface TimeSlot {
  time: string
  available: boolean
  booked?: boolean
}

interface SelectedService {
  id: string
  name: string
  price: number
  duration: string
  specialists?: string[]
}

const CUSTOMER = {
  name: 'Ayşe',
  greeting: 'Tekrar hoş geldin',
  gender: 'female' as 'female' | 'male',
}

const PAST_APPOINTMENTS: PastAppointment[] = [
  {
    id: 'a1',
    name: 'Protez Tırnak (Pınar), Lazer Bacak',
    service: 'Lazer',
    date: '2024-03-12',
    time: '14:00',
    endTime: '14:50',
    status: 'completed',
    specialists: ['Uzman Pınar', 'Uzman Fatma'],
    packageName: 'Laser Paketi',
    isRated: false,
    services: ['s1', 's2'],
    selectedSpecialist: 'Uzman Ayşe',
  },
  {
    id: 'a2',
    name: 'Premium Yüz Bakımı',
    service: 'Cilt Bakımı',
    date: '2024-02-28',
    time: '10:30',
    endTime: '11:15',
    status: 'rated',
    specialists: ['Uzman Zeynep'],
    isRated: true,
    services: ['s5'],
    selectedSpecialist: 'Uzman Zeynep',
  },
  {
    id: 'a3',
    name: 'Epilasyon - Bacak',
    service: 'Epilasyon',
    date: '2024-02-20',
    time: '15:00',
    endTime: '15:45',
    status: 'missed',
    specialists: ['Uzman Fatma'],
    isRated: false,
    services: ['s3'],
    selectedSpecialist: 'Uzman Fatma',
  },
  {
    id: 'a4',
    name: 'Cilt Bakımı - Alerjik Cilt',
    service: 'Cilt Bakımı',
    date: '2024-02-15',
    time: '11:00',
    endTime: '11:30',
    status: 'updated',
    specialists: ['Uzman Sela'],
    isRated: false,
    services: ['s5'],
    selectedSpecialist: 'Uzman Sela',
  },
]

const ACTIVE_PACKAGES: ActivePackage[] = [
  {
    id: 'p1',
    name: 'Laser Paketi – Tam Vücut',
    badge: 'Aktif',
    remainingSessions: 6,
    totalSessions: 10,
    expiryDate: '30 Haziran 2024',
    warning: 'Bacak bölgesi için son 2 hakkın kaldı',
    availableServices: [
      { id: 's1', name: 'Bacak Lazer', duration: '30 dk', used: 2, total: 4 },
      { id: 's2', name: 'Kol Lazer', duration: '20 dk', used: 3, total: 4 },
    ],
  },
]

const getIconComponent = (categoryId: string) => {
  switch (categoryId) {
    case 'cat-1':
      return <Sparkles className="w-5 h-5" />
    case 'cat-2':
      return <Wand2 className="w-5 h-5" />
    case 'cat-3':
      return <Zap className="w-5 h-5" />
    case 'cat-4':
      return <Droplet className="w-5 h-5" />
    case 'cat-5':
      return <Heart className="w-5 h-5" />
    case 'cat-6':
      return <Hand className="w-5 h-5" />
    case 'cat-7':
      return <Scissors className="w-5 h-5" />
    case 'cat-8':
      return <Lightbulb className="w-5 h-5" />
    case 'cat-9':
      return <Flower className="w-5 h-5" />
    default:
      return <Sparkles className="w-5 h-5" />
  }
}

const SERVICE_CATEGORIES: ServiceCategory[] = DUMMY_SERVICES.map((cat) => ({
  id: cat.id,
  name: cat.name,
  count: cat.services.length,
  icon: null as any, // Placeholder, will be set at render time
  gender: 'both' as const,
  services: cat.services,
}))

const TIME_SLOTS: TimeSlot[] = [
  { time: '09:00', available: true },
  { time: '09:30', available: true },
  { time: '10:00', available: true },
  { time: '10:30', available: false },
  { time: '11:00', available: true },
  { time: '11:30', available: false },
  { time: '12:00', available: true, booked: true },
  { time: '12:30', available: true },
  { time: '13:00', available: false },
  { time: '14:00', available: true },
  { time: '14:30', available: true },
  { time: '15:00', available: true },
  { time: '15:30', available: false },
  { time: '16:00', available: true },
]

const SPECIALIST_SERVICES_LIST = SPECIALIST_SERVICES // Services that require specialist selection

const SalonDashboard = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [expandedHistory, setExpandedHistory] = useState(false)
  const [expandedPackages, setExpandedPackages] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showWaitingList, setShowWaitingList] = useState(false)
  const [ratingAppointment, setRatingAppointment] = useState<PastAppointment | null>(null)
  const [serviceRatings, setServiceRatings] = useState<Record<string, number>>({})
  const [specialistModal, setSpecialistModal] = useState<ImportedServiceItem | null>(null)
  const [selectedSpecialists, setSelectedSpecialists] = useState<string[]>([])
  const [selectedServices, setSelectedServices] = useState<ImportedServiceItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [ratingValue, setRatingValue] = useState<number>(0)
  const [selectedGender, setSelectedGender] = useState<'female' | 'male'>(CUSTOMER.gender)
  const [activePackages, setActivePackages] = useState<ActivePackage[]>(ACTIVE_PACKAGES)
  const [numberOfPeople, setNumberOfPeople] = useState<number>(1)
  const [isKnownCustomer, setIsKnownCustomer] = useState<boolean | null>(null)
  const [showCustomerTypeModal, setShowCustomerTypeModal] = useState(true)
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [registrationForm, setRegistrationForm] = useState({
    fullName: '',
    phone: '',
    gender: 'female' as 'female' | 'male',
    birthDate: '',
    acceptMarketing: false,
  })
  const [multiPersonSpecialistModal, setMultiPersonSpecialistModal] = useState<{
    service: ImportedServiceItem
    numberOfPeople: number
    currentPerson: number
    selections: Record<number, string>
    selectedPeople: number[]
  } | null>(null)
  const [personSelectionModal, setPersonSelectionModal] = useState<{
    service: ImportedServiceItem
    numberOfPeople: number
  } | null>(null)

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0) * numberOfPeople

  // Helper: Toplam süreyi hesapla (dakika cinsinden)
  const WELCOME_MESSAGES = [
    'Merhaba! Seni tekrar görmek için sabırsızlanıyorduk 🌟',
    'Hoş geldin! Her ziyaretinde daha güzel görünüyorsun ✨',
    'Selamlar! Bugün seni güzelleştirmeye hazırız 💆‍♀️',
    'Bekliyorduk seni! Hadi başlayalım 🎉',
    'Merhaba! Kendini rahat hisset, biz seni çok seviyoruz 💕',
    'Hoşça kaldın! Seni görmek çok mutluluk verici 😊',
    'Selamlar! Bugün ne güzel görünüyorsun 👑',
    'Bekliyorduk! Hadi kendini şımarta 💅',
    'Hoş geldin aşkım! Hazırız seni daha güzel hale getirmeye ✨',
    'Merhaba! Bugün senin için özel bir gün olacak 🌹',
  ]

  const NEW_CUSTOMER_MESSAGES = [
    'Hoş geldin! Seni keşfetmek için çok heyecanlıyız ✨',
    'Selamlar! En salonumuzda olduğun için mutluyuz 🎉',
    'Hoş geldin! Haydi seni muhteşem hissettirelim 💆‍♀️',
    'Merhaba! En iyi hizmetimizi seni için hazırladık 💕',
    'Selamlar! Bugün senin için özel bir deneyim yaşayacaksın 👑',
  ]

  useEffect(() => {
    if (isKnownCustomer !== null) {
      const messages = isKnownCustomer ? WELCOME_MESSAGES : NEW_CUSTOMER_MESSAGES
      const randomMessage = messages[Math.floor(Math.random() * messages.length)]
      setWelcomeMessage(randomMessage)
    }
  }, [isKnownCustomer])

  const calculateTotalDuration = () => {
    return selectedServices.reduce((sum, service) => {
      const durationStr = service.duration
      const minutes = parseInt(durationStr) || 0
      return sum + minutes
    }, 0)
  }

  // Helper: Bitiş saatini hesapla
  const calculateEndTime = () => {
    if (!selectedTimeSlot) return null
    const [startHour, startMinute] = selectedTimeSlot.split(':').map(Number)
    const totalMinutes = calculateTotalDuration()
    const totalMinutesFromStart = startHour * 60 + startMinute + totalMinutes
    const endHour = Math.floor(totalMinutesFromStart / 60)
    const endMinute = totalMinutesFromStart % 60
    return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`
  }

  const handleServiceToggle = (service: any, categoryName: string) => {
    const serviceData: ImportedServiceItem = {
      id: service.id,
      name: `${categoryName} - ${service.name}`,
      price: service.salePrice || service.originalPrice,
      duration: service.duration,
    }

    const isCurrentlySelected = isServiceSelected(service.id)

    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.id === service.id)
      if (exists) {
        return prev.filter((s) => s.id !== service.id)
      }
      return [...prev, serviceData]
    })

    // Reset date and time selection when services change
    setSelectedDate(null)
    setSelectedTimeSlot(null)

    // Show specialist selection modal ONLY if adding a new service (not removing)
    if (!isCurrentlySelected && SPECIALIST_SERVICES.includes(service.id) && numberOfPeople > 1) {
      setPersonSelectionModal({
        service: serviceData,
        numberOfPeople: numberOfPeople,
      })
    } else if (!isCurrentlySelected && SPECIALIST_SERVICES.includes(service.id)) {
      // Single person - use existing modal
      setSpecialistModal(serviceData)
      setSelectedSpecialists([])
    }
  }

  const isServiceSelected = (serviceId: string) => selectedServices.some((s) => s.id === serviceId)

const handleRepeatAppointment = (appointment: PastAppointment) => {
  // Find services that were in this appointment and add them with correct prices
  const appointmentServices: ImportedServiceItem[] = appointment.services
    .map((serviceId) => {
      // Search for this service in all categories
      for (const category of SERVICE_CATEGORIES) {
        const found = category.services.find((s) => s.id === serviceId)
        if (found) {
          return {
            id: found.id,
            name: `${category.name} - ${found.name}`,
            price: found.salePrice || found.originalPrice,
            duration: found.duration,
          }
        }
      }
      return null
    })
    .filter((s) => s !== null) as ImportedServiceItem[]

  // Add services to selection and clear date/time
  setSelectedServices((prev) => {
    const newServices = [...prev]
    for (const service of appointmentServices) {
      if (!newServices.find((s) => s.id === service.id)) {
        newServices.push(service)
      }
    }
    return newServices
  })

  // Reset date and time
  setSelectedDate(null)
  setSelectedTimeSlot(null)
}

  // Get day name abbreviations
  const getDayName = (dayNumber: number) => {
    const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']
    const today = new Date()
    const targetDate = new Date(today)
    targetDate.setDate(today.getDate() + (dayNumber - today.getDate()))
    return dayNames[targetDate.getDay()]
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const filteredCategories = SERVICE_CATEGORIES.filter((cat) => {
    // Filter by gender
    if (cat.gender === 'both') return true
    return cat.gender === selectedGender
  }).map((cat) => ({
    ...cat,
    services: cat.services.filter(
      (service) =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.services.length > 0)

  const morningSlots = TIME_SLOTS.filter((slot) => {
    const hour = parseInt(slot.time.split(':')[0])
    return hour < 12
  })

  const afternoonSlots = TIME_SLOTS.filter((slot) => {
    const hour = parseInt(slot.time.split(':')[0])
    return hour >= 12
  })

  return (
    <div className="min-h-screen bg-background pb-40">
      {/* Header with Logo and Welcome Message */}
      <div className="bg-background">
        <div className="max-w-2xl mx-auto px-4 pt-8 pb-6">
          {/* Logo Area */}
          <div className="flex flex-col items-center justify-center mb-4">
            <img
              src="https://via.placeholder.com/140?text=SALON"
              alt="Salon Logo"
              className="w-auto h-24 md:h-28 object-contain"
            />
          </div>

          {/* Welcome Message */}
          <div className="text-center">
            <p className="text-sm md:text-base text-foreground">
              {isKnownCustomer ? (
                <>
                  Selamlar <span className="font-bold">{CUSTOMER.name}</span>, {welcomeMessage.split(' ').slice(1).join(' ')}
                </>
              ) : (
                welcomeMessage
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Quick Stats */}
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom duration-500">
          {isKnownCustomer && (
            <>
              <button
                onClick={() => setExpandedHistory(!expandedHistory)}
                className="group text-left w-full"
              >
                <Card className="bg-primary/5 border border-primary/20 hover:border-primary/50 transition-all duration-300 cursor-pointer">
                  <CardContent className="p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <History className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-foreground">Son Randevular</p>
                        <p className="text-xs text-muted-foreground">Geçmiş randevularınız</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${expandedHistory ? 'rotate-180' : ''}`} />
                  </CardContent>
                </Card>
              </button>

              {/* Past Appointments Expanded */}
              {expandedHistory && (
                <div className="max-h-[350px] overflow-y-auto space-y-3 animate-in fade-in slide-in-from-top-2 duration-300 pr-2">
                  {PAST_APPOINTMENTS.map((apt) => {
                    const getStatusBadge = () => {
                      switch (apt.status) {
                        case 'rated':
                          return <span className="text-xs font-semibold text-secondary">Değerlendirildi</span>
                        case 'missed':
                          return <span className="text-xs font-semibold text-red-500">Kaçırıldı</span>
                        case 'updated':
                          return <span className="text-xs font-semibold text-yellow-600">Güncellendi</span>
                        default:
                          return null
                      }
                    }

                    return (
                      <div key={apt.id} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-300 space-y-3 border border-border">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm">
                              {formatDate(apt.date)} • {apt.time}-{apt.endTime}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {apt.name}
                            </p>
                          </div>
                          {getStatusBadge()}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleRepeatAppointment(apt)}
                            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full text-xs font-semibold py-2"
                          >
                            Tekrarla
                          </Button>
                          {apt.status === 'completed' ? (
                            <Button
                              size="sm"
                              onClick={() => {
                                setRatingAppointment(apt)
                                setServiceRatings({})
                              }}
                              variant="outline"
                              className="flex-1 border border-muted-foreground text-muted-foreground hover:border-primary hover:text-primary rounded-full text-xs bg-transparent font-semibold py-2"
                            >
                              <Star className="w-3 h-3 mr-1" />
                              Değerlendir
                            </Button>
                          ) : apt.status === 'rated' ? (
                            <Button
                              size="sm"
                              className="flex-1 border border-muted text-muted-foreground bg-transparent rounded-full text-xs font-semibold py-2 cursor-default"
                              disabled
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Değerlendir
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="flex-1 border border-muted text-muted-foreground bg-transparent rounded-full text-xs font-semibold py-2 cursor-default"
                              disabled
                            >
                              <Star className="w-3 h-3 mr-1" />
                              Değerlendir
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {isKnownCustomer && (
            <>
              <button
                onClick={() => setExpandedPackages(!expandedPackages)}
                className="group text-left w-full"
              >
                <Card className="bg-secondary/5 border border-secondary/20 hover:border-secondary/50 transition-all duration-300 cursor-pointer">
                  <CardContent className="p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <Package className="w-5 h-5 text-secondary flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-foreground">Paketlerim</p>
                        <p className="text-xs text-muted-foreground">Aktif paketler</p>
                      </div>
                    </div>
                    <span className="bg-secondary text-secondary-foreground text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                      {ACTIVE_PACKAGES.length}
                    </span>
                  </CardContent>
                </Card>
              </button>

              {/* Packages Expanded */}
              {expandedPackages && (
                <div className="max-h-[350px] overflow-y-auto space-y-3 animate-in fade-in slide-in-from-top-2 duration-300 pr-2">
                  {activePackages.map((pkg) => (
                    <div key={pkg.id} className="rounded-lg border-2 border-border bg-card overflow-hidden">
                      <div className="p-3 border-b border-border bg-muted/30">
                        <p className="font-bold text-sm text-foreground">{pkg.name}</p>
                      </div>
                      <div className="space-y-2 p-3">
                        {pkg.availableServices.map((svc) => {
                          const serviceId = `pkg-${pkg.id}-${svc.id}`
                          const isAdded = selectedServices.some((s) => s.id === serviceId)
                          const percentLeft = (svc.used / svc.total) * 100
                          const getProgressColor = () => {
                            if (percentLeft > 50) return 'bg-green-500'
                            if (percentLeft > 25) return 'bg-yellow-500'
                            return 'bg-red-500'
                          }

                          return (
                            <div key={svc.id} className="space-y-1.5 rounded-lg bg-muted/20 p-2">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground">{svc.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {svc.used}/{svc.total} kaldı
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isAdded) {
                                      // Remove service and restore used count
                                      setSelectedServices((prev) => prev.filter((s) => s.id !== serviceId))
                                      setActivePackages((prev) =>
                                        prev.map((p) =>
                                          p.id === pkg.id
                                            ? {
                                                ...p,
                                                availableServices: p.availableServices.map((s) =>
                                                  s.id === svc.id ? { ...s, used: s.used + 1 } : s
                                                ),
                                              }
                                            : p
                                        )
                                      )
                                    } else {
                                      // Add service if there are remaining slots
                                      if (svc.used > 0) {
                                        const serviceToAdd: ImportedServiceItem = {
                                          id: serviceId,
                                          name: `${pkg.name} - ${svc.name}`,
                                          price: 0,
                                          duration: svc.duration,
                                        }
                                        setSelectedServices((prev) => [...prev, serviceToAdd])
                                        // Decrease used count
                                        setActivePackages((prev) =>
                                          prev.map((p) =>
                                            p.id === pkg.id
                                              ? {
                                                  ...p,
                                                  availableServices: p.availableServices.map((s) =>
                                                    s.id === svc.id ? { ...s, used: s.used - 1 } : s
                                                  ),
                                                }
                                              : p
                                          )
                                        )
                                      }
                                    }
                                    setSelectedDate(null)
                                    setSelectedTimeSlot(null)
                                  }}
                                  disabled={svc.used === 0 && !isAdded}
                                  className={`rounded-full text-xs gap-1 font-semibold py-1.5 px-3 border-2 transition-all whitespace-nowrap flex items-center ${
                                    isAdded
                                      ? 'border-primary bg-primary/10 text-primary hover:bg-primary/20'
                                      : 'border-secondary text-secondary hover:bg-secondary/10 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed'
                                  }`}
                                >
                                  {isAdded ? (
                                    <>
                                      <Check className="w-3 h-3" />
                                      Eklendi
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3 h-3" />
                                      Ekle
                                    </>
                                  )}
                                </button>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-300 ${getProgressColor()}`}
                                  style={{ width: `${percentLeft}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Search and Filters Control Bar */}
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
            <div className="bg-card rounded-2xl border-2 border-border p-4 space-y-4">
              {/* Person Counter - TOP */}
              <div className="flex items-center justify-center gap-4 bg-muted/30 rounded-xl px-4 py-2.5 border border-muted">
                <button
                  onClick={() => setNumberOfPeople(Math.max(1, numberOfPeople - 1))}
                  className="text-foreground hover:text-primary transition-colors font-bold text-lg leading-none"
                  aria-label="Decrease people count"
                >
                  −
                </button>
                <div className="flex flex-col items-center px-4">
                  <span className="text-lg font-bold text-foreground">{numberOfPeople}</span>
                  <span className="text-xs text-muted-foreground font-medium leading-tight">kişi</span>
                </div>
                <button
                  onClick={() => setNumberOfPeople(Math.min(4, numberOfPeople + 1))}
                  className={`font-bold text-lg leading-none transition-all ${
                    numberOfPeople >= 4
                      ? 'text-muted-foreground/40 cursor-not-allowed'
                      : 'text-foreground hover:text-primary'
                  }`}
                  disabled={numberOfPeople >= 4}
                  aria-label="Increase people count"
                >
                  +
                </button>
              </div>

              {/* Gender Toggle - MIDDLE */}
              <div className={`flex items-center justify-center gap-4 rounded-xl p-2 transition-all duration-300 ${
                selectedGender === 'female'
                  ? 'bg-pink-100 dark:bg-pink-950/30'
                  : 'bg-blue-100 dark:bg-blue-950/30'
              }`}>
                <button
                  onClick={() => setSelectedGender('female')}
                  className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-2xl font-semibold transition-all duration-300 ${
                    selectedGender === 'female'
                      ? 'bg-pink-300/60 shadow-md scale-105'
                      : 'hover:bg-pink-200/40 scale-95 opacity-70'
                  }`}
                >
                  👩
                </button>
                <button
                  onClick={() => setSelectedGender('male')}
                  className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-2xl font-semibold transition-all duration-300 ${
                    selectedGender === 'male'
                      ? 'bg-blue-300/60 shadow-md scale-105'
                      : 'hover:bg-blue-200/40 scale-95 opacity-70'
                  }`}
                >
                  👨
                </button>
              </div>

              {/* Search Input - BOTTOM */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Hizmet ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-muted/30 text-foreground placeholder-muted-foreground focus:outline-none focus:bg-muted/50 transition-colors duration-300"
                />
              </div>
            </div>
          </div>

          {/* Service Categories */}
          <div className="space-y-3">
            {filteredCategories.map((category, index) => (
              <Card
                key={category.id}
                className="bg-muted/40 border-muted/60 overflow-hidden hover:border-primary/30 transition-all duration-300 animate-in fade-in slide-in-from-bottom duration-500"
                style={{ animationDelay: `${200 + index * 50}ms` }}
              >
                <button
                  onClick={() =>
                    setExpandedCategory(expandedCategory === category.id ? null : category.id)
                  }
                  className="w-full px-4 py-3 flex items-center justify-between bg-muted/50 hover:bg-muted/60 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-primary">{getIconComponent(category.id)}</div>
                    <div className="text-left">
                      <p className="font-semibold text-foreground text-sm">{category.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                      {category.count}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                        expandedCategory === category.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Expanded Services */}
                {expandedCategory === category.id && (
                  <CardContent className="pt-4 pb-4 px-4 border-t border-border space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    {category.services.map((service) => {
                      const isSelected = isServiceSelected(service.id)
                      return (
                        <div
                          key={service.id}
                          className="w-full text-left"
                        >
                          <div
                            className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                              isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/30 bg-card hover:bg-muted/20'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-foreground text-sm">{service.name}</p>
                                  {isSelected && <Check className="w-4 h-4 text-primary" />}
                                </div>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {service.duration}
                                  </span>
                                  {service.tags?.map((tag) => (
                                    <span
                                      key={tag}
                                      className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded"
                                    >
                                      ⚡ {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="flex items-baseline gap-2 justify-end">
                                  {service.originalPrice > 0 && service.salePrice < service.originalPrice && (
                                    <span className="text-xs text-muted-foreground line-through">
                                      {service.originalPrice}
                                    </span>
                                  )}
                                  {(service.salePrice || service.originalPrice) > 0 && (
                                    <p className="text-sm font-bold text-secondary">
                                      {service.salePrice || service.originalPrice}
                                      <span className="text-xs">₺</span>
                                    </p>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleServiceToggle(service, category.name)}
                                  variant={isSelected ? 'default' : 'outline'}
                                  className={`mt-2 rounded-full text-xs gap-1 w-full font-semibold py-2 ${
                                    isSelected
                                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 border-primary'
                                      : 'border-2 border-primary text-primary hover:bg-primary/10'
                                  }`}
                                >
                                  {isSelected ? (
                                    <>
                                      <Check className="w-3 h-3" />
                                      Eklendi
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3 h-3" />
                                      Ekle
                                    </>
                                  )}
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

        {/* Date and Time Selection - if services selected */}
        {selectedServices.length > 0 && (
          <div className="space-y-6 mt-8 pb-40" data-scroll-target="date-time">
            {/* Date Selection */}
            <div className="max-w-2xl mx-auto px-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-primary" />
                Tarih Seçin
              </h3>
              <div className="flex gap-2 pb-2 overflow-x-auto">
                {[12, 13, 14, 15, 16].map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(day.toString())}
                    className={`px-3 py-3 rounded-lg font-semibold text-sm whitespace-nowrap transition-all flex flex-col items-center gap-1 ${
                      selectedDate === day.toString()
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <span className="text-xs">{getDayName(day)}</span>
                    <span className="text-base font-bold">{day}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div className="mb-4 space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Saat Seçin
                </h3>

                {/* Morning */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Sabah</p>
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {morningSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => {
                          if (slot.available) {
                            setSelectedTimeSlot(slot.time)
                          } else {
                            setShowWaitingList(true)
                          }
                        }}
                        className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                          selectedTimeSlot === slot.time
                            ? 'bg-primary text-primary-foreground'
                            : slot.available
                            ? 'bg-muted text-foreground hover:bg-primary/20 cursor-pointer'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted/70 cursor-pointer'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Afternoon */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Öğleden Sonra</p>
                  <div className="grid grid-cols-5 gap-2">
                    {afternoonSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => {
                          if (slot.available) {
                            setSelectedTimeSlot(slot.time)
                          } else {
                            setShowWaitingList(true)
                          }
                        }}
                        className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                          selectedTimeSlot === slot.time
                            ? 'bg-primary text-primary-foreground'
                            : slot.available
                            ? 'bg-muted text-foreground hover:bg-primary/20 cursor-pointer'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted/70 cursor-pointer'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Waiting List Modal */}
            {showWaitingList && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in p-4">
                <Card className="w-full max-w-sm rounded-2xl border-0 animate-in zoom-in-95 duration-300 bg-foreground/95 text-background">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-background/20 flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-base mb-1">Bu Gün için Bekleme Listesine Girin</h3>
                        <p className="text-sm text-background/80">
                          Bir yer açılırsa size WhatsApp&apos;tan haber verelim
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setShowWaitingList(false)
                        // Handle waiting list action
                      }}
                      className="w-full bg-background text-foreground hover:bg-background/90 font-semibold rounded-full py-2.5"
                    >
                      Sıraya Gir
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Rating Modal */}
            {ratingAppointment && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in p-4">
                <Card className="w-full max-w-sm rounded-2xl border-0 animate-in zoom-in-95 duration-300">
                  <CardContent className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                    <div>
                      <h3 className="font-bold text-lg text-foreground">Hizmetleri Değerlendir</h3>
                      <p className="text-xs text-muted-foreground mt-1">{formatDate(ratingAppointment.date)}</p>
                    </div>

                    <div className="space-y-4">
                      {ratingAppointment.services.map((serviceId) => {
                        // Find service name
                        let serviceName = ''
                        for (const category of SERVICE_CATEGORIES) {
                          const found = category.services.find((s) => s.id === serviceId)
                          if (found) {
                            serviceName = found.name
                            break
                          }
                        }

                        return (
                          <div key={serviceId} className="space-y-2 p-3 rounded-lg bg-muted/30">
                            <p className="text-sm font-medium text-foreground">{serviceName}</p>
                            <div className="flex gap-1.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => {
                                    setServiceRatings((prev) => ({
                                      ...prev,
                                      [serviceId]: star,
                                    }))
                                  }}
                                  className="transition-transform hover:scale-110"
                                >
                                  <Star
                                    className={`w-6 h-6 ${
                                      star <= (serviceRatings[serviceId] || 0)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-muted-foreground'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setRatingAppointment(null)
                          setServiceRatings({})
                        }}
                        variant="outline"
                        className="flex-1 rounded-full"
                      >
                        Vazgeç
                      </Button>
                      <Button
                        onClick={() => {
                          console.log(`Submitted ratings:`, serviceRatings)
                          setRatingAppointment(null)
                          setServiceRatings({})
                        }}
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
                      >
                        Gönder
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Sticky Booking Footer */}
        {selectedServices.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-xl z-50 animate-in fade-in slide-in-from-bottom duration-300">
            <div className="max-w-2xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                {/* Price Section - Left */}
                <div className="flex flex-col gap-0.5">
                  <p className="text-2xl font-bold text-foreground leading-none">{totalPrice}₺</p>
                  <button className="text-xs text-muted-foreground hover:text-foreground transition-colors text-left whitespace-nowrap">
                    Detaylı gör
                  </button>
                </div>

                {/* Confirm Button - Right */}
                <Button
                  onClick={() => {
                    if (!selectedDate || !selectedTimeSlot) {
                      const element = document.querySelector('[data-scroll-target="date-time"]')
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                    } else {
                      // Randevu onay akışı
                      if (isKnownCustomer) {
                        // Bilinen müşteri - confirmation modal'ı aç
                        setShowConfirmationModal(true)
                      } else {
                        // Yeni müşteri - kayıt formu aç
                        setShowRegistrationModal(true)
                      }
                    }
                  }}
                  className={`px-6 py-3 font-bold text-sm rounded-full transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                    selectedDate && selectedTimeSlot
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                  disabled={!selectedDate || !selectedTimeSlot}
                >
                  Randevuyu Onayla
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Specialist Selection Modal */}
      {specialistModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in duration-300">
          <div className="bg-card w-full rounded-t-2xl p-6 space-y-4 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">{specialistModal.name}</h3>
              <button
                onClick={() => {
                  setSpecialistModal(null)
                  setSelectedSpecialists([])
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground">Uzman seçiniz:</p>

            <div className="space-y-2">
              {['Uzman Pınar', 'Uzman Fatma', 'Uzman Ayşe'].map((specialist) => (
                <label key={specialist} className="flex items-center gap-3 p-3 rounded-lg border-2 border-muted hover:border-primary/30 cursor-pointer transition-all">
                  <input
                    type="radio"
                    name="specialist"
                    checked={selectedSpecialists.includes(specialist)}
                    onChange={() => {
                      setSelectedSpecialists([specialist])
                    }}
                    className="w-5 h-5 accent-primary"
                  />
                  <span className="text-sm font-medium text-foreground">{specialist}</span>
                </label>
              ))}
            </div>

            <Button
              onClick={() => {
                setSpecialistModal(null)
              }}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-3 font-semibold"
            >
              Tamam
            </Button>
          </div>
        </div>
      )}

      {/* Person Selection Modal */}
      {personSelectionModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50 animate-in fade-in duration-300">
          <div className="bg-card w-full rounded-t-3xl p-6 space-y-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Bu hizmeti kim alacak?</h2>
                <p className="text-sm text-muted-foreground mt-1">Birden fazla kişi seçebilirsiniz</p>
              </div>
              <button
                onClick={() => setPersonSelectionModal(null)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: personSelectionModal.numberOfPeople }).map((_, index) => {
                const personName = index === 0 ? 'Ben' : `Misafir ${index}`
                return (
                  <label
                    key={index}
                    className="flex flex-col items-center gap-3 p-4 rounded-2xl border-2 border-muted hover:border-primary/50 cursor-pointer transition-all bg-muted/30 hover:bg-muted/50"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={index === 0}
                      className="w-5 h-5 accent-primary rounded cursor-pointer"
                    />
                    <span className="text-2xl">
                      {index === 0 ? '👤' : '👥'}
                    </span>
                    <span className="text-sm font-semibold text-foreground text-center">{personName}</span>
                  </label>
                )
              })}
            </div>

            <Button
              onClick={() => {
                const checkboxes = document.querySelectorAll('input[type="checkbox"]')
                const selectedPeople: number[] = []
                checkboxes.forEach((checkbox, index) => {
                  if ((checkbox as HTMLInputElement).checked) {
                    selectedPeople.push(index)
                  }
                })

                if (selectedPeople.length > 0) {
                  setMultiPersonSpecialistModal({
                    service: personSelectionModal.service,
                    numberOfPeople: personSelectionModal.numberOfPeople,
                    currentPerson: selectedPeople[0],
                    selections: {},
                    selectedPeople: selectedPeople,
                  })
                  setPersonSelectionModal(null)
                }
              }}
              className="w-full rounded-full py-3.5 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 text-base transition-all"
            >
              Devam Et →
            </Button>
          </div>
        </div>
      )}

      {/* Multi-Person Specialist Selection Modal */}
      {multiPersonSpecialistModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50 animate-in fade-in duration-300">
          <div className="bg-card w-full rounded-t-3xl p-6 space-y-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">{multiPersonSpecialistModal.service.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                    {multiPersonSpecialistModal.currentPerson === 0 ? '👤 Ben' : `👥 Misafir ${multiPersonSpecialistModal.currentPerson}`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {multiPersonSpecialistModal.selectedPeople.indexOf(multiPersonSpecialistModal.currentPerson) + 1} / {multiPersonSpecialistModal.selectedPeople.length}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMultiPersonSpecialistModal(null)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="w-full bg-muted rounded-full h-1">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{
                  width: `${((multiPersonSpecialistModal.selectedPeople.indexOf(multiPersonSpecialistModal.currentPerson) + 1) / multiPersonSpecialistModal.selectedPeople.length) * 100}%`,
                }}
              />
            </div>

            <div className="space-y-3">
              {['Fark etmez', 'Pınar', 'Fatma', 'Ayşe'].map((specialist) => (
                <label
                  key={specialist}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    multiPersonSpecialistModal.selections[multiPersonSpecialistModal.currentPerson] === specialist
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-primary/30 hover:bg-muted/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="multi-specialist"
                    checked={
                      multiPersonSpecialistModal.selections[multiPersonSpecialistModal.currentPerson] === specialist
                    }
                    onChange={() => {
                      setMultiPersonSpecialistModal((prev) =>
                        prev
                          ? {
                              ...prev,
                              selections: {
                                ...prev.selections,
                                [prev.currentPerson]: specialist,
                              },
                            }
                          : null
                      )
                    }}
                    className="w-5 h-5 accent-primary cursor-pointer"
                  />
                  <span className="text-base font-semibold text-foreground flex-1">{specialist}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              {multiPersonSpecialistModal.selectedPeople.indexOf(multiPersonSpecialistModal.currentPerson) > 0 && (
                <Button
                  onClick={() => {
                    const currentIndex = multiPersonSpecialistModal.selectedPeople.indexOf(
                      multiPersonSpecialistModal.currentPerson
                    )
                    if (currentIndex > 0) {
                      setMultiPersonSpecialistModal((prev) =>
                        prev
                          ? {
                              ...prev,
                              currentPerson: prev.selectedPeople[currentIndex - 1],
                            }
                          : null
                      )
                    }
                  }}
                  variant="outline"
                  className="flex-1 rounded-full py-3 font-semibold border-2"
                >
                  ← Geri
                </Button>
              )}
              <Button
                onClick={() => {
                  const currentIndex = multiPersonSpecialistModal.selectedPeople.indexOf(
                    multiPersonSpecialistModal.currentPerson
                  )
                  if (currentIndex < multiPersonSpecialistModal.selectedPeople.length - 1) {
                    setMultiPersonSpecialistModal((prev) =>
                      prev
                        ? {
                            ...prev,
                            currentPerson: prev.selectedPeople[currentIndex + 1],
                          }
                        : null
                    )
                  } else {
                    setMultiPersonSpecialistModal(null)
                  }
                }}
                className="flex-1 rounded-full py-3 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
              >
                {multiPersonSpecialistModal.selectedPeople.indexOf(multiPersonSpecialistModal.currentPerson) ===
                multiPersonSpecialistModal.selectedPeople.length - 1
                  ? 'Tamamla ✓'
                  : 'İleri →'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal - Yeni müşteriler için */}
      {showRegistrationModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50 animate-in fade-in duration-300">
          <div className="bg-card w-full rounded-t-3xl p-6 space-y-6 animate-in slide-in-from-bottom duration-300 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Kaydını Tamamla</h2>
                <p className="text-sm text-muted-foreground mt-1">Randevuyu tamamlamak için bilgilerini gir</p>
              </div>
              <button
                onClick={() => setShowRegistrationModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Ad Soyad */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Ad Soyad</label>
                <input
                  type="text"
                  value={registrationForm.fullName}
                  onChange={(e) =>
                    setRegistrationForm((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                  placeholder="Adınız soyadınız"
                  className="w-full px-4 py-3 rounded-xl bg-muted/30 text-foreground placeholder-muted-foreground focus:outline-none focus:bg-muted/50 border border-muted focus:border-primary transition-all"
                />
              </div>

              {/* Telefon Numarası */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Telefon Numarası</label>
                <input
                  type="tel"
                  value={registrationForm.phone}
                  onChange={(e) =>
                    setRegistrationForm((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="+90 (5XX) XXX-XXXX"
                  className="w-full px-4 py-3 rounded-xl bg-muted/30 text-foreground placeholder-muted-foreground focus:outline-none focus:bg-muted/50 border border-muted focus:border-primary transition-all"
                />
              </div>

              {/* Cinsiyet */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Cinsiyet</label>
                <div className={`flex gap-3 rounded-xl p-2 transition-all duration-300 ${
                  registrationForm.gender === 'female'
                    ? 'bg-pink-100 dark:bg-pink-950/30'
                    : 'bg-blue-100 dark:bg-blue-950/30'
                }`}>
                  <button
                    onClick={() =>
                      setRegistrationForm((prev) => ({
                        ...prev,
                        gender: 'female',
                      }))
                    }
                    className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-2xl font-semibold transition-all duration-300 ${
                      registrationForm.gender === 'female'
                        ? 'bg-pink-300/60 shadow-md scale-105'
                        : 'hover:bg-pink-200/40 scale-95 opacity-70'
                    }`}
                  >
                    👩
                  </button>
                  <button
                    onClick={() =>
                      setRegistrationForm((prev) => ({
                        ...prev,
                        gender: 'male',
                      }))
                    }
                    className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-2xl font-semibold transition-all duration-300 ${
                      registrationForm.gender === 'male'
                        ? 'bg-blue-300/60 shadow-md scale-105'
                        : 'hover:bg-blue-200/40 scale-95 opacity-70'
                    }`}
                  >
                    👨
                  </button>
                </div>
              </div>

              {/* Doğum Tarihi */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Doğum Tarihi</label>
                <input
                  type="date"
                  value={registrationForm.birthDate}
                  onChange={(e) =>
                    setRegistrationForm((prev) => ({
                      ...prev,
                      birthDate: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 rounded-xl bg-muted/30 text-foreground focus:outline-none focus:bg-muted/50 border border-muted focus:border-primary transition-all"
                />
              </div>

              {/* Marketing Consent */}
              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="marketing"
                  checked={registrationForm.acceptMarketing}
                  onChange={(e) =>
                    setRegistrationForm((prev) => ({
                      ...prev,
                      acceptMarketing: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
                <label htmlFor="marketing" className="text-sm text-muted-foreground cursor-pointer">
                  Kampanyalar ve özel teklifler hakkında bilgi almak istiyorum
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowRegistrationModal(false)}
                variant="outline"
                className="flex-1 rounded-full py-3 font-semibold border-2"
              >
                Vazgeç
              </Button>
              <Button
                onClick={() => {
                  // Validation
                  if (
                    !registrationForm.fullName.trim() ||
                    !registrationForm.phone.trim() ||
                    !registrationForm.birthDate
                  ) {
                    alert('Lütfen tüm zorunlu alanları doldurun')
                    return
                  }

                  // Register + Confirm appointment
                  // TODO: Backend API çağrısı - kayıt oluştur
                  setShowRegistrationModal(false)
                  setIsKnownCustomer(true)
                  setShowConfirmationModal(true)
                }}
                className="flex-1 rounded-full py-3 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
              >
                Kayıt Ol ve Randevuyu Onayla
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal - Randevu Detayları */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50 animate-in fade-in duration-300">
          <div className="bg-card w-full rounded-t-3xl p-6 space-y-6 animate-in slide-in-from-bottom duration-300 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between sticky top-0 bg-card pb-2">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Randevu Onayı</h2>
                <p className="text-sm text-muted-foreground mt-1">Lütfen randevu detaylarınızı kontrol edin</p>
              </div>
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Appointment Details Card */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-4 border border-primary/20 space-y-4">
              {/* Date & Time */}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Tarih ve Saat</p>
                  <p className="text-sm font-bold text-foreground mt-1">
                    {selectedDate
                      ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString('tr-TR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Tarih seçilmedi'}
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-1">
                    {selectedTimeSlot && calculateEndTime()
                      ? `${selectedTimeSlot} - ${calculateEndTime()}`
                      : 'Saat seçilmedi'}
                  </p>
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-start gap-3 pt-2 border-t border-primary/10">
                <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Toplam Süre</p>
                  <p className="text-sm font-bold text-foreground mt-1">{calculateTotalDuration()} dakika</p>
                </div>
              </div>

              {/* Number of People */}
              <div className="flex items-start gap-3 pt-2 border-t border-primary/10">
                <Zap className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Kişi Sayısı</p>
                  <p className="text-sm font-bold text-foreground mt-1">{numberOfPeople} kişi</p>
                </div>
              </div>
            </div>

            {/* Services List */}
            <div className="space-y-3">
              <p className="text-sm font-bold text-foreground">Hizmetler</p>
              {numberOfPeople === 1 ? (
                // Single person
                selectedServices.map((service, idx) => (
                  <div key={idx} className="bg-muted/30 rounded-xl p-3 space-y-2 border border-muted">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{service.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{service.duration}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-primary">
                          {service.price.toLocaleString('tr-TR')}₺
                        </p>
                      </div>
                    </div>

                    {/* Specialist if selected */}
                    {multiPersonSpecialistModal?.selections?.[0] && (
                      <div className="text-xs bg-primary/5 rounded-lg p-2 border border-primary/10">
                        <p className="font-semibold text-foreground">
                          Uzman: {multiPersonSpecialistModal.selections[0]}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                // Multiple people - show services per person
                Array.from({ length: numberOfPeople }).map((_, personIdx) => (
                  <div key={personIdx} className="bg-gradient-to-r from-primary/5 to-transparent rounded-xl p-3 border border-primary/10 space-y-2">
                    <p className="text-sm font-bold text-foreground">Kişi {personIdx + 1}</p>
                    {selectedServices.map((service, serviceIdx) => (
                      <div key={serviceIdx} className="flex items-start justify-between gap-2 bg-white/40 rounded-lg p-2">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground">{service.name}</p>
                          <p className="text-xs text-muted-foreground">{service.duration}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-primary">
                            {service.price.toLocaleString('tr-TR')}₺
                          </p>
                        </div>
                      </div>
                    ))}
                    {/* Specialist if selected */}
                    {multiPersonSpecialistModal?.selections?.[personIdx] && (
                      <div className="text-xs bg-primary/10 rounded-lg p-2 border border-primary/20 mt-2">
                        <p className="font-semibold text-foreground">
                          Uzman: {multiPersonSpecialistModal.selections[personIdx]}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Price Summary */}
            <div className="bg-secondary/10 rounded-xl p-4 border border-secondary/20 space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Hizmetler ({selectedServices.length})</p>
                <p className="text-sm font-semibold text-foreground">
                  {selectedServices.reduce((sum, s) => sum + s.price, 0).toLocaleString('tr-TR')}₺
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Kişi × {numberOfPeople}</p>
                <p className="text-sm font-semibold text-foreground">×{numberOfPeople}</p>
              </div>
              <div className="border-t border-secondary/20 pt-2 mt-2 flex justify-between items-center">
                <p className="font-bold text-foreground">Toplam Tutar</p>
                <p className="text-lg font-bold text-secondary">
                  {totalPrice.toLocaleString('tr-TR')}₺
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowConfirmationModal(false)}
                variant="outline"
                className="flex-1 rounded-full py-3 font-semibold border-2"
              >
                Düzenleme Yap
              </Button>
              <Button
                onClick={() => {
                  // TODO: Backend API çağrısı - randevu oluştur
                  alert('Randevunuz başarıyla onaylandı!')
                  setShowConfirmationModal(false)
                }}
                className="flex-1 rounded-full py-3 font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all"
              >
                Randevuyu Onayla
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Type Selection Modal - Sayfa açılışında */}
      {showCustomerTypeModal && isKnownCustomer === null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-card rounded-3xl p-8 max-w-md w-full mx-4 space-y-6 animate-in slide-in-from-bottom duration-300 shadow-2xl">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Hoş Geldin!</h2>
              <p className="text-sm text-muted-foreground">Devam etmeden önce, müşteri türünü seç</p>
            </div>

            <div className="space-y-3">
              {/* Known Customer Option */}
              <button
                onClick={() => {
                  setIsKnownCustomer(true)
                  setShowCustomerTypeModal(false)
                }}
                className="w-full group"
              >
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 hover:border-primary/60 rounded-2xl p-6 transition-all duration-300 text-left space-y-3 hover:shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Heart className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-lg">Bilinen Müşteri</p>
                      <p className="text-xs text-muted-foreground">Daha önce ziyaret ettiğim</p>
                    </div>
                  </div>
                </div>
              </button>

              {/* New Customer Option */}
              <button
                onClick={() => {
                  setIsKnownCustomer(false)
                  setShowCustomerTypeModal(false)
                }}
                className="w-full group"
              >
                <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-2 border-secondary/30 hover:border-secondary/60 rounded-2xl p-6 transition-all duration-300 text-left space-y-3 hover:shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Sparkles className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-lg">Yeni Müşteri</p>
                      <p className="text-xs text-muted-foreground">İlk kez ziyaret ediyorum</p>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SalonDashboard
