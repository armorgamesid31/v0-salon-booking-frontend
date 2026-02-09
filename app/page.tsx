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
}

interface PastAppointment {
  id: string
  service: string
  date: string
  time: string
  specialists: string[]
  packageName?: string
  isRated?: boolean
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
}

const PAST_APPOINTMENTS: PastAppointment[] = [
  {
    id: 'a1',
    service: 'Lazer',
    date: '2024-03-12',
    time: '14:00',
    specialists: ['Bacak', 'Kol'],
    packageName: 'Laser Paketi',
    isRated: false,
  },
  {
    id: 'a2',
    service: 'Cilt Bakımı',
    date: '2024-02-28',
    time: '10:30',
    specialists: ['Premium Yüz Bakımı'],
    isRated: true,
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

export default function SalonDashboard() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [expandedHistory, setExpandedHistory] = useState(false)
  const [expandedPackages, setExpandedPackages] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showWaitingList, setShowWaitingList] = useState(false)
  const [specialistModal, setSpecialistModal] = useState<SelectedService | null>(null)
  const [selectedSpecialists, setSelectedSpecialists] = useState<string[]>([])

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

    // Show specialist selection for certain services
    if (SPECIALIST_SERVICES.includes(service.id)) {
      setSpecialistModal(serviceData)
      setSelectedSpecialists([])
    }
  }

  const isServiceSelected = (serviceId: string) => selectedServices.some((s) => s.id === serviceId)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const filteredCategories = SERVICE_CATEGORIES.map((cat) => ({
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
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-20 animate-in fade-in slide-in-from-top duration-300">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-sm font-bold">
                ✨
              </div>
              <span className="font-bold text-foreground text-lg">SalonAsistan</span>
            </div>
            <Bell className="w-6 h-6 text-primary cursor-pointer hover:scale-110 transition-transform" />
          </div>
          <p className="text-sm text-muted-foreground">
            {CUSTOMER.greeting}, {CUSTOMER.name} ✨
          </p>
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
            <Card className="bg-card border border-border hover:border-primary/50 transition-all duration-300 cursor-pointer">
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
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              {PAST_APPOINTMENTS.map((apt) => (
                <div key={apt.id} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-300 space-y-3 border border-border">
                  <div>
                    <p className="font-medium text-foreground text-sm">{formatDate(apt.date)} • {apt.service}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Hizmetler: {apt.specialists.join(', ')}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full text-xs font-semibold py-2">
                      Tekrarla
                    </Button>
                    {apt.isRated ? (
                      <Button
                        size="sm"
                        className="w-full border-secondary text-secondary bg-transparent rounded-full text-xs font-semibold py-2"
                        disabled
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Değerlendirildi
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-muted-foreground text-muted-foreground hover:border-primary hover:text-primary rounded-full text-xs bg-transparent font-semibold py-2"
                      >
                        <Star className="w-3 h-3 mr-1" />
                        Değerlendir
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setExpandedPackages(!expandedPackages)}
            className="group text-left w-full"
          >
            <Card className="bg-card border border-border hover:border-secondary/50 transition-all duration-300 cursor-pointer">
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
          {/* Packages Expanded */}
          {expandedPackages && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              {ACTIVE_PACKAGES.map((pkg) => (
                <div key={pkg.id} className="p-4 rounded-2xl border-2 border-secondary/30 bg-muted/20 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-foreground text-sm">{pkg.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{pkg.totalSessions} seans paket</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${pkg.badge === 'Aktif' ? 'bg-secondary text-secondary-foreground' : 'bg-yellow-100 text-yellow-900'}`}>
                      {pkg.badge}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">{pkg.remainingSessions} / {pkg.totalSessions} kullanım kaldı</p>
                      <span className="text-xs font-semibold text-foreground">{Math.round((pkg.remainingSessions / pkg.totalSessions) * 100)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-secondary h-full transition-all duration-300"
                        style={{ width: `${(pkg.remainingSessions / pkg.totalSessions) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Warning */}
                  {pkg.warning && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-yellow-800 dark:text-yellow-200">{pkg.warning}</p>
                    </div>
                  )}

                  {/* Services with Checkboxes */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground">Kullanılabilir Hizmetler:</p>
                    {pkg.availableServices.map((svc) => (
                      <label key={svc.id} className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${svc.used === 0 ? 'border-muted bg-muted/50 opacity-50' : 'border-muted hover:border-secondary/30 bg-background'}`}>
                        <input
                          type="checkbox"
                          disabled={svc.used === 0}
                          className="w-5 h-5 mt-0.5 accent-secondary disabled:accent-muted"
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium ${svc.used === 0 ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{svc.name}</p>
                          <p className={`text-xs ${svc.used === 0 ? 'text-muted-foreground' : 'text-secondary font-semibold'}`}>{svc.used} dk {svc.used}/{svc.total} kaldı</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Info Footer */}
                  <div className="pt-2 border-t border-muted text-xs text-muted-foreground">
                    1 bölge seçildi · Tahmini süre 30 dk
                  </div>

                  {/* Ekle Button */}
                  <Button
                    size="sm"
                    className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full text-sm font-bold py-3"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ekle
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Search Bar */}
          <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Hizmet ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors duration-300"
            />
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
                    className={`px-3 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                      selectedDate === day.toString()
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {day}
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
                        disabled={!slot.available}
                        className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                          selectedTimeSlot === slot.time
                            ? 'bg-primary text-primary-foreground'
                            : slot.available
                            ? 'bg-muted text-foreground hover:bg-primary/20 cursor-pointer'
                            : 'bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50'
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
                        disabled={!slot.available}
                        className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                          selectedTimeSlot === slot.time
                            ? 'bg-primary text-primary-foreground'
                            : slot.available
                            ? 'bg-muted text-foreground hover:bg-primary/20 cursor-pointer'
                            : 'bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50'
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
              <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in">
                <Card className="w-full rounded-t-2xl rounded-b-none border-b-0 animate-in slide-in-from-bottom duration-300">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertCircle className="w-6 h-6 text-primary" />
                      <h3 className="text-lg font-bold text-foreground">Bu Gün İçin Bekleme Listesine Girin</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Bir yer açılınca WhatsApp&apos;tan haber hesabı olur
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setShowWaitingList(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Vazgeç
                      </Button>
                      <Button
                        onClick={() => {
                          setShowWaitingList(false)
                          // Handle waiting list action
                        }}
                        className="flex-1 bg-primary text-primary-foreground"
                      >
                        Sıraya Gir
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
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-foreground leading-none">{totalPrice}₺</p>
                  <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
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
              {['Bacak Lazer', 'Kol Lazer'].map((specialist) => (
                <label key={specialist} className="flex items-center gap-3 p-3 rounded-lg border-2 border-muted hover:border-primary/30 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={selectedSpecialists.includes(specialist)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSpecialists((prev) => [...prev, specialist])
                      } else {
                        setSelectedSpecialists((prev) => prev.filter((s) => s !== specialist))
                      }
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
