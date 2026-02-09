'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ChevronDown,
  Search,
  Bell,
  Zap,
  Sparkles,
  Leaf,
  Heart,
  Scissors,
  Palette,
  Eye,
  Droplet,
  Flower,
  Wand2,
  MessageCircle,
  Plus,
  Calendar,
  Clock,
  Star,
  X,
  History,
  Package,
  Check,
  AlertCircle,
} from 'lucide-react'

interface ServiceItem {
  id: string
  name: string
  duration: string
  originalPrice: number
  salePrice: number
  tags?: string[]
}

interface ServiceCategory {
  id: string
  name: string
  count: number
  icon: React.ReactNode
  services: ServiceItem[]
  gender?: 'female' | 'male' | 'both'
}

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

const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'epilasyon',
    name: 'Epilasyon & Tüy Alma',
    count: 4,
    icon: <Zap className="w-5 h-5" />,
    gender: 'both',
    services: [
      { id: 's1', name: 'Tam Vücut', duration: '60 dk', originalPrice: 1800, salePrice: 1650, tags: ['Fast Track'] },
      { id: 's2', name: 'Sırt Lazer', duration: '30 dk', originalPrice: 1200, salePrice: 1100 },
      { id: 's3', name: 'Bacak Lazer', duration: '45 dk', originalPrice: 1500, salePrice: 1350 },
    ],
  },
  {
    id: 'ciltkabimi',
    name: 'Cilt Bakımı & Yüz',
    count: 4,
    icon: <Heart className="w-5 h-5" />,
    gender: 'female',
    services: [
      { id: 's5', name: 'Klasik Yüz Temizliği', duration: '60 dk', originalPrice: 300, salePrice: 250 },
      { id: 's6', name: 'Hydrafacial', duration: '50 dk', originalPrice: 800, salePrice: 700 },
    ],
  },
  {
    id: 'danismanlik',
    name: 'Danışmanlık',
    count: 3,
    icon: <MessageCircle className="w-5 h-5" />,
    gender: 'both',
    services: [
      { id: 's40', name: 'Cilt Analizi', duration: '25 dk', originalPrice: 150, salePrice: 0 },
      { id: 's41', name: 'Stil Danışmanlığı', duration: '45 dk', originalPrice: 200, salePrice: 0 },
    ],
  },
]

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

const SPECIALIST_SERVICES = ['s1', 's2'] // Services that require specialist selection

const SalonDashboard = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [expandedHistory, setExpandedHistory] = useState(false)
  const [expandedPackages, setExpandedPackages] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showWaitingList, setShowWaitingList] = useState(false)
  const [ratingAppointment, setRatingAppointment] = useState<PastAppointment | null>(null)
  const [serviceRatings, setServiceRatings] = useState<Record<string, number>>({})
  const [specialistModal, setSpecialistModal] = useState<SelectedService | null>(null)
  const [selectedSpecialists, setSelectedSpecialists] = useState<string[]>([])
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [ratingValue, setRatingValue] = useState<number>(0)
  const [selectedGender, setSelectedGender] = useState<'female' | 'male'>(CUSTOMER.gender)

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0)

  const handleServiceToggle = (service: ServiceItem, categoryName: string) => {
    const serviceData: SelectedService = {
      id: service.id,
      name: `${categoryName} - ${service.name}`,
      price: service.salePrice || service.originalPrice,
      duration: service.duration,
    }

    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.id === service.id)
      if (exists) {
        return prev.filter((s) => s.id !== service.id)
      }
      return [...prev, serviceData]
    })

    // Reset date and time selection when services change (need to check availability again)
    setSelectedDate(null)
    setSelectedTimeSlot(null)

    // Show specialist selection for certain services
    if (SPECIALIST_SERVICES.includes(service.id)) {
      setSpecialistModal(serviceData)
      setSelectedSpecialists([])
    }
  }

  const isServiceSelected = (serviceId: string) => selectedServices.some((s) => s.id === serviceId)

const handleRepeatAppointment = (appointment: PastAppointment) => {
  // Find services that were in this appointment and add them with correct prices
  const appointmentServices: SelectedService[] = appointment.services
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
    .filter((s) => s !== null) as SelectedService[]

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
  })).filter((cat) => cat.services.length > 0 || !searchQuery)

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
              Selamlar <span className="font-bold">{CUSTOMER.name}</span> unarım her şey yolundadır seni tekrar görmek için sabırsızlanıyoruz 🌟
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Quick Stats */}
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom duration-500">
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
              {ACTIVE_PACKAGES.map((pkg) => (
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
                                const serviceToAdd: SelectedService = {
                                  id: serviceId,
                                  name: `${pkg.name} - ${svc.name}`,
                                  price: 0,
                                  duration: svc.duration,
                                }
                                setSelectedServices((prev) => [...prev, serviceToAdd])
                                setSelectedDate(null)
                                setSelectedTimeSlot(null)
                              }}
                              disabled={svc.used === 0}
                              className={`rounded-full text-xs gap-1 font-semibold py-1.5 px-3 border-2 border-secondary text-secondary hover:bg-secondary/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all whitespace-nowrap ${
                                isAdded ? 'bg-secondary/20' : 'bg-transparent'
                              }`}
                            >
                              <Plus className="w-3 h-3" />
                              {isAdded ? 'Eklendi' : 'Ekle'}
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

          {/* Search Bar and Gender Toggle */}
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Hizmet ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors duration-300"
              />
            </div>

            {/* Gender Toggle Button */}
            <div className="flex gap-2 bg-muted/30 p-1 rounded-lg border border-border">
              <button
                onClick={() => setSelectedGender('female')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-semibold transition-all duration-300 ${
                  selectedGender === 'female'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Kadın
              </button>
              <button
                onClick={() => setSelectedGender('male')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-semibold transition-all duration-300 ${
                  selectedGender === 'male'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Erkek
              </button>
            </div>
          </div>

          {/* Service Categories */}
          <div className="space-y-3">
            {filteredCategories.map((category, index) => (
              <Card
                key={category.id}
                className="bg-card border-border overflow-hidden hover:border-primary/30 transition-all duration-300 animate-in fade-in slide-in-from-bottom duration-500"
                style={{ animationDelay: `${200 + index * 50}ms` }}
              >
                <button
                  onClick={() =>
                    setExpandedCategory(expandedCategory === category.id ? null : category.id)
                  }
                  className="w-full px-4 py-4 flex items-center justify-between hover:bg-muted/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-primary">{category.icon}</div>
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
                  <CardContent className="pt-0 pb-4 px-4 border-t border-border space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    {category.services.map((service) => {
                      const isSelected = isServiceSelected(service.id)
                      return (
                        <button
                          key={service.id}
                          onClick={() => handleServiceToggle(service, category.name)}
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
                        </button>
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
    </div>
  )
}

export default SalonDashboard
