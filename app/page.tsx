'use client'

import { useEffect } from "react"
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChevronDown,
  Calendar,
  Scissors,
  PackageIcon,
  History,
  Clock,
  MapPin,
  Star,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  Loader2,
  Check,
} from 'lucide-react'

interface Service {
  id: string
  name: string
  duration: string
  specialist?: string
  price?: string
}

interface Appointment {
  id: string
  service: string
  date: string
  time: string
  specialist: string
  status: 'completed' | 'cancelled' | 'upcoming'
}

// Mock data
const CUSTOMER = {
  name: 'Zeynep Kaya',
  salonName: 'Premium Güzellik Merkezi',
  lastAppointment: '15 Şubat 2024 - Saç Kesimi',
  phone: '+90 (555) 123-4567',
}

const SERVICES: Service[] = [
  { id: '1', name: 'Saç Kesimi', duration: '30 dk', specialist: 'Aylin', price: '150 TL' },
  { id: '2', name: 'Saç Boyama', duration: '90 dk', specialist: 'Arda', price: '250 TL' },
  { id: '3', name: 'Saç Tasarımı', duration: '45 dk', specialist: 'Aylin', price: '200 TL' },
  { id: '4', name: 'Cilt Bakımı', duration: '60 dk', specialist: 'Sema', price: '100 TL' },
  { id: '5', name: 'Makyöz Hizmetleri', duration: '45 dk', specialist: 'Gül', price: '180 TL' },
  { id: '6', name: 'Masaj', duration: '50 dk', specialist: 'Sema', price: '120 TL' },
]

const PACKAGES: any[] = [
  {
    id: 'p1',
    name: 'Saç Bakım Paketi',
    totalSessions: 5,
    remainingSessions: 2,
    expiryDate: '30 Haziran 2024',
    services: ['1', '3'],
  },
  {
    id: 'p2',
    name: 'Güzellik Paketi',
    totalSessions: 10,
    remainingSessions: 7,
    expiryDate: '31 Aralık 2024',
    services: ['4', '5'],
  },
]

const PAST_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    service: 'Saç Kesimi',
    date: '2024-02-15',
    time: '14:00',
    specialist: 'Aylin',
    status: 'completed',
  },
  {
    id: 'a2',
    service: 'Saç Boyama',
    date: '2024-01-28',
    time: '10:00',
    specialist: 'Arda',
    status: 'completed',
  },
  {
    id: 'a3',
    service: 'Cilt Bakımı',
    date: '2024-01-10',
    time: '15:30',
    specialist: 'Sema',
    status: 'completed',
  },
]

const TIME_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00']

const getNextDates = () => {
  const dates: Array<{ label: string; value: string; date: Date }> = []
  for (let i = 0; i < 7; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)
    const label = date.toLocaleDateString('tr-TR', { weekday: 'short', year: 'numeric', month: 'numeric', day: 'numeric' })
    dates.push({ label, value: date.toISOString().split('T')[0], date })
  }
  return dates
}

const generateTimeSlots = (serviceId: string, date: string) => {
  // Logic to generate time slots based on serviceId and date
  return TIME_SLOTS
}

const AVAILABILITY_DATA: any = {
  '1': {
    '2024-02-15': true,
    '2024-02-16': true,
    '2024-02-17': false,
    '2024-02-18': true,
    '2024-02-19': true,
    '2024-02-20': true,
    '2024-02-21': true,
  },
  '2': {
    '2024-02-15': true,
    '2024-02-16': false,
    '2024-02-17': true,
    '2024-02-18': true,
    '2024-02-19': true,
    '2024-02-20': true,
    '2024-02-21': true,
  },
}

export default function SalonDashboard() {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header / Customer Context */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{CUSTOMER.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">{CUSTOMER.salonName}</p>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Son randevu: {CUSTOMER.lastAppointment}
              </p>
            </div>
            <div className="text-right text-sm">
              <p className="text-muted-foreground">{CUSTOMER.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 pb-20">
        {/* Active Packages Summary */}
        {PACKAGES.length > 0 && (
          <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/5 via-primary/2 to-background">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <PackageIcon className="w-5 h-5 text-primary" />
                Aktif Paketleriniz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {PACKAGES.map((pkg) => (
                  <div key={pkg.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-foreground">{pkg.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Son kullanma: {pkg.expiryDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{pkg.remainingSessions}/{pkg.totalSessions}</p>
                      <p className="text-xs text-muted-foreground">seans</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
              <History className="w-5 h-5 text-primary" />
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
