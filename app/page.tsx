'use client'

import { Calendar } from "@/components/ui/calendar"
import { CardTitle } from "@/components/ui/card"
import { CardHeader } from "@/components/ui/card"
import React from "react"
import { useState } from 'react'
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
  CheckCircle,
  PackageIcon,
  Clock,
  Star
} from 'lucide-react'

interface ServiceItem {
  id: string
  name: string
  duration: string
  specialist: string
  price: string
}

interface ServiceCategory {
  id: string
  name: string
  count: number
  icon: React.ReactNode
  services: ServiceItem[]
}

interface Appointment {
  id: string
  service: string
  date: string
  time: string
  specialist: string
  status: string
}

// Mock data
const CUSTOMER = {
  name: 'Ayşe',
  greeting: 'Tekrar hoş geldin',
  salonName: 'Salon Asistanı',
  lastAppointment: '15 Şubat 2024',
  phone: '123-456-7890',
}

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
      { id: 's4', name: 'Sır Ağda', duration: '20 dk', originalPrice: 400, salePrice: 400 },
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
      { id: 's7', name: 'İğneli Mezoterapi', duration: '40 dk', originalPrice: 600, salePrice: 500 },
      { id: 's8', name: 'Kimyasal Peeling', duration: '45 dk', originalPrice: 500, salePrice: 420 },
    ],
  },
  {
    id: 'vucutsekillendir',
    name: 'Vücut Şekillendirme',
    count: 3,
    icon: <Leaf className="w-5 h-5" />,
    services: [
      { id: 's9', name: 'Selülit Tedavisi', duration: '45 dk', originalPrice: 400, salePrice: 350 },
      { id: 's10', name: 'Liposuction', duration: '60 dk', originalPrice: 1200, salePrice: 1000 },
      { id: 's11', name: 'Enjeksiyon Tedavisi', duration: '30 dk', originalPrice: 600, salePrice: 500 },
    ],
  },
  {
    id: 'tirnaksac',
    name: 'Tırnak Sanatı & Ayak Bakımı',
    count: 4,
    icon: <Sparkles className="w-5 h-5" />,
    services: [
      { id: 's12', name: 'Manikür', duration: '45 dk', originalPrice: 150, salePrice: 120 },
      { id: 's13', name: 'Pedikür', duration: '50 dk', originalPrice: 180, salePrice: 150 },
      { id: 's14', name: 'Tırnak Tasarımı', duration: '60 dk', originalPrice: 250, salePrice: 200 },
      { id: 's15', name: 'Kalıcı Cilalama', duration: '55 dk', originalPrice: 300, salePrice: 250 },
    ],
  },
  {
    id: 'kashkiprik',
    name: 'Kaş & Kirpik',
    count: 4,
    icon: <Eye className="w-5 h-5" />,
    services: [
      { id: 's16', name: 'Kaş Tasarımı', duration: '30 dk', originalPrice: 200, salePrice: 150 },
      { id: 's17', name: 'Kaş Ombre', duration: '45 dk', originalPrice: 400, salePrice: 350 },
      { id: 's18', name: 'Kirpik Lifting', duration: '50 dk', originalPrice: 500, salePrice: 420 },
      { id: 's19', name: 'Kirpik Uzatma', duration: '60 dk', originalPrice: 600, salePrice: 500 },
    ],
  },
  {
    id: 'sactasarimi',
    name: 'Saç Tasarımı',
    count: 5,
    icon: <Scissors className="w-5 h-5" />,
    services: [
      { id: 's20', name: 'Saç Kesimi', duration: '30 dk', originalPrice: 150, salePrice: 120 },
      { id: 's21', name: 'Saç Boyama', duration: '90 dk', originalPrice: 400, salePrice: 320 },
      { id: 's22', name: 'Balayaj', duration: '120 dk', originalPrice: 600, salePrice: 480 },
      { id: 's23', name: 'Fön & Şekil', duration: '45 dk', originalPrice: 200, salePrice: 160 },
      { id: 's24', name: 'Saç Bakımı', duration: '60 dk', originalPrice: 300, salePrice: 240 },
    ],
  },
  {
    id: 'kalicimakyaj',
    name: 'Kalıcı Makyaj',
    count: 3,
    icon: <Palette className="w-5 h-5" />,
    services: [
      { id: 's25', name: 'Kaş Tatouaj', duration: '60 dk', originalPrice: 800, salePrice: 700 },
      { id: 's26', name: 'Eyeliner Tatouaj', duration: '45 dk', originalPrice: 600, salePrice: 500 },
      { id: 's27', name: 'Dudak Tatouaj', duration: '50 dk', originalPrice: 700, salePrice: 600 },
    ],
  },
  {
    id: 'medikal',
    name: 'Medikal Estetik',
    count: 4,
    icon: <Droplet className="w-5 h-5" />,
    services: [
      { id: 's28', name: 'Botox', duration: '20 dk', originalPrice: 1000, salePrice: 800 },
      { id: 's29', name: 'Dolgu Enjeksiyonu', duration: '30 dk', originalPrice: 1200, salePrice: 1000 },
      { id: 's30', name: 'PRP Tedavisi', duration: '45 dk', originalPrice: 1500, salePrice: 1200 },
      { id: 's31', name: 'Lipolitik Enjeksiyon', duration: '40 dk', originalPrice: 800, salePrice: 650 },
    ],
  },
  {
    id: 'spa',
    name: 'Spa & Wellness',
    count: 4,
    icon: <Flower className="w-5 h-5" />,
    services: [
      { id: 's32', name: 'Klasik Masaj', duration: '60 dk', originalPrice: 400, salePrice: 320 },
      { id: 's33', name: 'Thai Masaj', duration: '90 dk', originalPrice: 600, salePrice: 480 },
      { id: 's34', name: 'Çişe Masaj', duration: '50 dk', originalPrice: 350, salePrice: 280 },
      { id: 's35', name: 'Aromaterapy', duration: '45 dk', originalPrice: 300, salePrice: 240 },
    ],
  },
  {
    id: 'profesyonelmakyaj',
    name: 'Profesyonel Makyaj',
    count: 3,
    icon: <Wand2 className="w-5 h-5" />,
    services: [
      { id: 's36', name: 'Gelin Makyajı', duration: '90 dk', originalPrice: 800, salePrice: 700 },
      { id: 's37', name: 'Parti Makyajı', duration: '60 dk', originalPrice: 600, salePrice: 500 },
      { id: 's38', name: 'Günlük Makyaj', duration: '45 dk', originalPrice: 400, salePrice: 320 },
    ],
  },
  {
    id: 'danismanlik',
    name: 'Danışmanlık',
    count: 3,
    icon: <MessageCircle className="w-5 h-5" />,
    services: [
      { id: 's39', name: 'Güzellik Danışmanlığı', duration: '30 dk', originalPrice: 100, salePrice: 0 },
      { id: 's40', name: 'Cilt Analizi', duration: '25 dk', originalPrice: 150, salePrice: 0 },
      { id: 's41', name: 'Stil Danışmanlığı', duration: '45 dk', originalPrice: 200, salePrice: 0 },
    ],
  },
]

const SERVICES = [
  { id: 's1', name: 'Tam Vücut', duration: '60 dk', specialist: 'Dr. Ayşe', price: '1650' },
  { id: 's2', name: 'Sırt Lazer', duration: '30 dk', specialist: 'Dr. Mehmet', price: '1100' },
  // other services
]

const PACKAGES = [
  { id: 'p1', name: 'Güzellik Paketi', expiryDate: '15 Şubat 2025', remainingSessions: 6, totalSessions: 6 },
  // other packages
]

const PAST_APPOINTMENTS = [
  { id: 'a1', service: 'Tam Vücut', date: '2023-12-01', time: '10:00', specialist: 'Dr. Ayşe', status: 'completed' },
  // other appointments
]

const getNextDates = () => {
  // Implementation of getNextDates
  return [
    { value: '2023-12-01', label: '1 Aralık 2023' },
    // other dates
  ]
}

const generateTimeSlots = (serviceId: string, date: string) => {
  // Implementation of generateTimeSlots
  return ['10:00', '11:00', '12:00']
}

export default function SalonDashboard() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [referralToggle, setReferralToggle] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>('booking')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [bookingStep, setBookingStep] = useState<'service' | 'specialist' | 'datetime'>('service')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [usePackage, setUsePackage] = useState(false)
  const [availableDates, setAvailableDates] = useState(getNextDates())
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [selectedService, setSelectedService] = useState<string | null>(null)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId)
    setSelectedDate(null)
    setSelectedTime(null)
    setAvailableTimeSlots([])
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedTime(null)
    setIsLoadingSlots(true)

    // Simulate API call to check availability
    setTimeout(() => {
      const slots = generateTimeSlots(selectedService!, date)
      setAvailableTimeSlots(slots)
      setIsLoadingSlots(false)
    }, 600)
  }

  const handleBooking = () => {
    if (selectedService && selectedDate && selectedTime) {
      setIsConfirmed(true)
    }
  }

  const handleReset = () => {
    setSelectedService(null)
    setSelectedDate(null)
    setSelectedTime(null)
    setAvailableTimeSlots([])
    setIsConfirmed(false)
  }

  const selectedServiceData = SERVICES.find((s) => s.id === selectedService)
  const selectedDateLabel = availableDates.find((d) => d.value === selectedDate)?.label

  if (isConfirmed && selectedServiceData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl text-foreground">Randevu Onaylandı!</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Randevunuz başarıyla kaydedildi</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-secondary/50 rounded-lg p-5 space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Hizmet</p>
                  <p className="font-semibold text-foreground">{selectedServiceData.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tarih</p>
                  <p className="font-semibold text-foreground">{selectedDateLabel}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Saat</p>
                  <p className="font-semibold text-foreground">{selectedTime}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Süre</p>
                  <p className="font-semibold text-foreground">{selectedServiceData.duration}</p>
                </div>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Fiyat</p>
                <p className="text-2xl font-bold text-primary">{selectedServiceData.price}</p>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm text-green-900 dark:text-green-100">
                Onay e-postası gönderildi. Lütfen 10 dakika erken gelin.
              </p>
            </div>

            <Button onClick={handleReset} className="w-full" size="lg">
              Yeni Randevu Al
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const filteredCategories = SERVICE_CATEGORIES.map((cat) => ({
    ...cat,
    services: cat.services.filter(
      (service) =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.services.length > 0 || !searchQuery)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-sm font-bold">
                ✨
              </div>
              <span className="font-bold text-foreground text-lg">SalonAsistan</span>
            </div>
            <Bell className="w-6 h-6 text-primary cursor-pointer" />
          </div>
          <p className="text-sm text-muted-foreground">
            {CUSTOMER.greeting}, {CUSTOMER.name} ✨
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 pb-20 space-y-5">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">Son Randevular</div>
              <div className="text-sm font-semibold text-foreground flex items-center justify-between">
                Geçmiş randevularınız
                <ChevronDown className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">Paketlerim</div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Aktif paketler</span>
                <span className="bg-secondary text-secondary-foreground text-xs font-semibold px-2 py-1 rounded">
                  6 Seans
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Hizmet ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>

        {/* Referral Banner */}
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-primary rounded-2xl">
          <CardContent className="p-4 flex items-start gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xl">👥</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">
                Randevuna arkadaşını ekle,<br />
                <span className="text-primary">anında 100 TL</span> kazan!
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                İşte hem de arkadaşın indirim kazanın
              </p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={referralToggle}
                onChange={(e) => setReferralToggle(e.target.checked)}
                className="w-5 h-5"
              />
            </label>
          </CardContent>
        </Card>

        {/* Service Categories */}
        <div className="space-y-3">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="bg-card border-border overflow-hidden">
              <button
                onClick={() =>
                  setExpandedCategory(expandedCategory === category.id ? null : category.id)
                }
                className="w-full px-4 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
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
                    className={`w-5 h-5 text-muted-foreground transition-transform ${
                      expandedCategory === category.id ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Expanded Services */}
              {expandedCategory === category.id && (
                <CardContent className="pt-0 pb-4 px-4 border-t border-border space-y-3">
                  {category.services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-start justify-between gap-3 pb-3 border-b border-border last:border-0 last:pb-0"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">{service.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{service.duration}</span>
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
                          {service.salePrice > 0 && (
                            <p className="text-sm font-bold text-secondary">
                              {service.salePrice}
                              <span className="text-xs">₺</span>
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 border-primary text-primary hover:bg-primary/10 rounded-lg text-xs gap-1 bg-transparent"
                        >
                          <Plus className="w-3 h-3" />
                          Ekle
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Booking Section */}
        <Card className="border-0 shadow-sm">
          <button
            onClick={() =>
              setExpandedSection(expandedSection === 'booking' ? null : 'booking')
            }
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Yeni Randevu Al</h2>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-muted-foreground transition-transform ${
                expandedSection === 'booking' ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedSection === 'booking' && (
            <CardContent className="pt-0 pb-6 space-y-6 border-t border-border">
              {/* Step 1: Services */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    1
                  </span>
                  Hizmet Seçin
                </h3>
                <div className="space-y-2">
                  {SERVICES.map((service) => (
                    <label
                      key={service.id}
                      className="flex items-center gap-3 p-3 rounded-lg border-2 border-border hover:border-primary/50 cursor-pointer transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service.id)}
                        onChange={(e) => {
                          setSelectedServices(
                            e.target.checked
                              ? [...selectedServices, service.id]
                              : selectedServices.filter((id) => id !== service.id)
                          )
                        }}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{service.name}</p>
                        <p className="text-xs text-muted-foreground">{service.duration}</p>
                      </div>
                      {service.specialist && (
                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                          {service.specialist}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Package Option */}
              {selectedServices.length > 0 && PACKAGES.length > 0 && (
                <div className="bg-secondary/50 rounded-lg p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={usePackage}
                      onChange={(e) => setUsePackage(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-foreground">
                      Paketimden kullan
                    </span>
                  </label>
                </div>
              )}

              {/* Step 2: Date & Time */}
              {selectedServices.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      2
                    </span>
                    Tarih & Saat
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-2">
                        Tarih
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {availableDates.map((date) => (
                          <button
                            key={date.value}
                            onClick={() => handleDateSelect(date.value)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              selectedDate === date.value
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary border border-border hover:border-primary'
                            }`}
                          >
                            {date.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedDate && (
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-2">
                          Saat
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {availableTimeSlots.map((time) => (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={`px-2 py-2 rounded text-sm font-medium transition-all ${
                                selectedTime === time
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-secondary border border-border hover:border-primary'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Confirm Button */}
              {selectedServiceData && selectedDate && selectedTime && (
                <Button
                  onClick={handleBooking}
                  disabled={!selectedService || !selectedDate || !selectedTime}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-semibold"
                >
                  Randevuyu Onayla
                </Button>
              )}
            </CardContent>
          )}
        </Card>

        {/* Appointment History */}
        <Card className="border-0 shadow-sm">
          <button
            onClick={() =>
              setExpandedSection(expandedSection === 'history' ? null : 'history')
            }
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Geçmiş Randevular</h2>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-muted-foreground transition-transform ${
                expandedSection === 'history' ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedSection === 'history' && (
            <CardContent className="pt-0 pb-6 border-t border-border space-y-2">
              {PAST_APPOINTMENTS.map((apt) => (
                <div key={apt.id} className="flex items-start justify-between gap-4 p-3 rounded-lg bg-secondary/30">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{apt.service}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(apt.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {apt.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {apt.specialist}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="flex-shrink-0 bg-transparent">
                    Tekrar Al
                  </Button>
                </div>
              ))}
            </CardContent>
          )}
        </Card>

        {/* Waiting List */}
        <Card className="border-0 shadow-sm border-l-4 border-l-primary">
          <button
            onClick={() =>
              setExpandedSection(expandedSection === 'waiting' ? null : 'waiting')
            }
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Bekleme Listesi</h2>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-muted-foreground transition-transform ${
                expandedSection === 'waiting' ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedSection === 'waiting' && (
            <CardContent className="pt-0 pb-6 border-t border-border space-y-4">
              <p className="text-sm text-muted-foreground">
                Müsait olmayan tarihlerde hizmet almak istiyorsanız bekleme listesine katılabilirsiniz.
              </p>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Bekleme Listesine Ekle
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
