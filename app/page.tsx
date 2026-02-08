'use client'

import { CardDescription } from "@/components/ui/card"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Calendar, Scissors, Loader2 } from 'lucide-react'

const SERVICES = [
  {
    id: '1',
    name: 'Saç Kesimi',
    duration: '30 dk',
    price: '₺200',
    description: 'Profesyonel saç kesimi ve şekillendirme',
  },
  {
    id: '2',
    name: 'Saç Boyama',
    duration: '90 dk',
    price: '₺400',
    description: 'Tam saç boyama ve renklendirme',
  },
  {
    id: '3',
    name: 'Saç Tasarımı',
    duration: '45 dk',
    price: '₺250',
    description: 'Saç tasarımı ve kurutma',
  },
  {
    id: '4',
    name: 'Saç Bakım',
    duration: '60 dk',
    price: '₺300',
    description: 'Derin saç bakım ve onarım',
  },
]

// Simulated availability data - in real app this would come from backend
const AVAILABILITY_DATA: Record<string, Record<string, boolean>> = {
  '1': {
    '2024-02-08': true,
    '2024-02-09': true,
    '2024-02-10': true,
    '2024-02-11': false,
    '2024-02-12': true,
    '2024-02-13': true,
  },
  '2': {
    '2024-02-08': false,
    '2024-02-09': true,
    '2024-02-10': true,
    '2024-02-11': true,
    '2024-02-12': false,
    '2024-02-13': true,
  },
  '3': {
    '2024-02-08': true,
    '2024-02-09': true,
    '2024-02-10': false,
    '2024-02-11': true,
    '2024-02-12': true,
    '2024-02-13': true,
  },
  '4': {
    '2024-02-08': true,
    '2024-02-09': false,
    '2024-02-10': true,
    '2024-02-11': true,
    '2024-02-12': true,
    '2024-02-13': true,
  },
}

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
]

const DATES = [
  { label: 'Bugün', value: '2024-02-08' },
  { label: 'Yarın', value: '2024-02-09' },
  { label: 'Çarşamba', value: '2024-02-10' },
  { label: 'Perşembe', value: '2024-02-11' },
  { label: 'Cuma', value: '2024-02-12' },
  { label: 'Cumartesi', value: '2024-02-13' },
]

function getNextDates(): Array<{ label: string; value: string; date: Date }> {
  const dates = []
  const today = new Date()
  
  for (let i = 0; i < 6; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    
    let label = ''
    if (i === 0) {
      label = 'Bugün'
    } else if (i === 1) {
      label = 'Yarın'
    } else {
      label = new Intl.DateTimeFormat('tr-TR', { weekday: 'short', month: 'short', day: 'numeric' }).format(date)
    }
    
    const value = date.toISOString().split('T')[0]
    dates.push({ label, value, date })
  }
  
  return dates
}

function generateTimeSlots(serviceId: string, date: string): string[] {
  // Simulate availability check - randomly mark some slots as unavailable
  const available = AVAILABILITY_DATA[serviceId]?.[date] ?? true
  
  if (!available) {
    return []
  }
  
  // Simulate that some times are booked
  const baseSlots = TIME_SLOTS
  const bookedIndices = Math.random() > 0.5 ? [2, 5, 9] : [1, 4, 7]
  
  return baseSlots.filter((_, idx) => !bookedIndices.includes(idx))
}

export default function BookingPage() {
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [availableDates, setAvailableDates] = useState<Array<{ label: string; value: string; date: Date }>>([])
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])

  useEffect(() => {
    setAvailableDates(getNextDates())
  }, [])

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
                <Check className="w-8 h-8 text-primary-foreground" />
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
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 pb-8">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-6 sm:max-w-full">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Randevu Al</h1>
          <p className="text-sm text-muted-foreground mt-1">Hizmet, tarih ve saati seçin</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6 sm:max-w-2xl">
        {/* Services Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Scissors className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Hizmet Seçin</h2>
          </div>
          <div className="space-y-3">
            {SERVICES.map((service) => (
              <button
                key={service.id}
                onClick={() => handleServiceSelect(service.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedService === service.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50 bg-card'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{service.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">{service.duration}</p>
                  </div>
                  <p className="text-lg font-bold text-primary flex-shrink-0">{service.price}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Date & Time Section */}
        {selectedService && (
          <div className="space-y-4">
            {/* Dates */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Tarih Seçin</h2>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {availableDates.map((date) => {
                  const isAvailable = AVAILABILITY_DATA[selectedService]?.[date.value] ?? true
                  return (
                    <button
                      key={date.value}
                      onClick={() => isAvailable && handleDateSelect(date.value)}
                      disabled={!isAvailable}
                      className={`py-3 px-2 rounded-lg border-2 transition-all text-sm font-medium ${
                        selectedDate === date.value
                          ? 'border-primary bg-primary text-primary-foreground'
                          : isAvailable
                          ? 'border-border hover:border-primary/50 text-foreground bg-card'
                          : 'border-border/50 text-muted-foreground bg-muted/30 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {date.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Times */}
            {selectedDate && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">Saat Seçin</h2>
                {isLoadingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  </div>
                ) : availableTimeSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {availableTimeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-3 px-2 rounded-lg border-2 transition-all text-sm font-medium ${
                          selectedTime === time
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border hover:border-primary/50 text-foreground bg-card'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-secondary/50 rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Bu tarihte uygun saat bulunmamaktadır. Lütfen başka bir tarih seçin.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Booking Summary & Button */}
        {selectedServiceData && (
          <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 sm:static sm:border-0 sm:p-0">
            <div className="max-w-md mx-auto sm:max-w-2xl space-y-3">
              <div className="hidden sm:flex items-center justify-between bg-secondary/50 rounded-lg p-4 text-sm">
                <div className="flex items-center gap-4 flex-1">
                  <div>
                    <p className="text-xs text-muted-foreground">Hizmet</p>
                    <p className="font-semibold text-foreground">{selectedServiceData.name}</p>
                  </div>
                  {selectedDate && (
                    <>
                      <div className="w-px h-12 bg-border" />
                      <div>
                        <p className="text-xs text-muted-foreground">Tarih</p>
                        <p className="font-semibold text-foreground">{selectedDateLabel}</p>
                      </div>
                    </>
                  )}
                  {selectedTime && (
                    <>
                      <div className="w-px h-12 bg-border" />
                      <div>
                        <p className="text-xs text-muted-foreground">Saat</p>
                        <p className="font-semibold text-foreground">{selectedTime}</p>
                      </div>
                    </>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Fiyat</p>
                  <p className="text-xl font-bold text-primary">{selectedServiceData.price}</p>
                </div>
              </div>

              <Button
                onClick={handleBooking}
                disabled={!selectedService || !selectedDate || !selectedTime}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-semibold"
                size="lg"
              >
                Randevuyu Onayla
              </Button>
            </div>
          </div>
        )}

        {/* Mobile spacing for fixed button */}
        {selectedServiceData && <div className="h-24 sm:h-0" />}
      </div>

      {/* Footer */}
      <div className="text-center mt-12 px-4 text-sm text-muted-foreground sm:mt-0">
        <p>
          Sorularınız mı var?{' '}
          <span className="font-semibold text-foreground">(555) 123-4567</span> veya{' '}
          <span className="font-semibold text-foreground">randevu@salon.com</span>
        </p>
      </div>
    </div>
  )
}
