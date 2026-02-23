'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown, Search, Zap, Sparkles, Heart, Scissors, Droplet, Flower, Wand2, Plus, Calendar, Clock, X, History, Check, AlertCircle, Hand, Lightbulb } from 'lucide-react'
import { SPECIALIST_SERVICES as CONST_SPECIALIST_SERVICES } from '@/lib/constants'
import type { ServiceItem as ImportedServiceItem, ServiceCategory, Employee } from '@/lib/types'
import { getBookingContextByToken, registerCustomer, getSalon, getServices, getEmployees, checkAvailability } from '@/lib/api'
import { DUMMY_SALON } from '@/lib/constants'

const SPECIALIST_SERVICES = CONST_SPECIALIST_SERVICES 

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

const getIconComponent = (categoryId: string) => {
  switch (categoryId) {
    case 'cat-1': return <Sparkles className="w-5 h-5" />
    case 'cat-2': return <Wand2 className="w-5 h-5" />
    case 'cat-3': return <Zap className="w-5 h-5" />
    case 'cat-4': return <Droplet className="w-5 h-5" />
    case 'cat-5': return <Heart className="w-5 h-5" />
    case 'cat-6': return <Hand className="w-5 h-5" />
    case 'cat-7': return <Scissors className="w-5 h-5" />
    case 'cat-8': return <Lightbulb className="w-5 h-5" />
    case 'cat-9': return <Flower className="w-5 h-5" />
    default: return <Sparkles className="w-5 h-5" />
  }
}

const SalonDashboardContent = () => {
  const searchParams = useSearchParams()
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [specialistModal, setSpecialistModal] = useState<ImportedServiceItem | null>(null)
  const [servicePersonMapping, setServicePersonMapping] = useState<Record<string, number[]>>({})
  const [selectedSpecialists, setSelectedSpecialists] = useState<string[]>([])
  const [selectedServices, setSelectedServices] = useState<ImportedServiceItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [selectedGender, setSelectedGender] = useState<'female' | 'male'>('female')
  const [numberOfPeople, setNumberOfPeople] = useState<number>(1)
  const [isKnownCustomer, setIsKnownCustomer] = useState<boolean>(false)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [salonId, setSalonId] = useState<string>(DUMMY_SALON.id)
  const [salonData, setSalonData] = useState<any>(DUMMY_SALON)
  const [availableServices, setAvailableServices] = useState<ServiceCategory[]>([])
  const [availableStaff, setAvailableStaff] = useState<Employee[]>([])
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [welcomeMessage, setWelcomeMessage] = useState('Hoş geldiniz! Bugün sizi şımartmaya hazırız ✨')
  const [customerName, setCustomerName] = useState('')
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [registrationForm, setRegistrationForm] = useState({
    fullName: '',
    phone: '',
    gender: 'female' as 'female' | 'male',
    birthDate: '',
    acceptMarketing: false,
  })
  const [personSelectionModal, setPersonSelectionModal] = useState<{
    service: ImportedServiceItem
    numberOfPeople: number
  } | null>(null)

  const totalPrice = (() => {
    if (numberOfPeople === 1) {
      return selectedServices.reduce((sum, s) => sum + (s.salePrice || s.originalPrice), 0)
    } else {
      let total = 0
      for (let personIdx = 0; personIdx < numberOfPeople; personIdx++) {
        const personServicesPrice = selectedServices
          .filter((service) => {
            const personIds = servicePersonMapping[service.id] || []
            if (personIds.length === 0) return personIdx === 0
            return personIds.includes(personIdx)
          })
          .reduce((sum, s) => sum + (s.salePrice || s.originalPrice), 0)
        total += personServicesPrice
      }
      return total
    }
  })()

  // Magic Link token handling & Data Fetching
  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      getBookingContextByToken(token).then((context) => {
        if (context) {
          setSalonId(context.salonId)
          setIsKnownCustomer(context.isKnownCustomer)
          if (context.isKnownCustomer && context.customerId) {
            setCustomerId(context.customerId)
            setCustomerName(context.customerName)
            setWelcomeMessage(`Selamlar ${context.customerName}, tekrar hoş geldin! 🌟`)
          }
          if (context.customerGender) setSelectedGender(context.customerGender)
          
          getSalon(context.salonId).then(setSalonData)
          getServices(context.salonId).then(setAvailableServices)
          getEmployees(context.salonId).then(setAvailableStaff)
        }
      })
    } else {
        const sId = searchParams.get('salonId') || DUMMY_SALON.id
        setSalonId(sId)
        getSalon(sId).then(setSalonData)
        getServices(sId).then(setAvailableServices)
        getEmployees(sId).then(setAvailableStaff)
    }
  }, [searchParams])

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
    if (numberOfPeople === 1) {
      return selectedServices.reduce((sum, service) => sum + (parseInt(service.duration) || 0), 0)
    } else {
      const personDurations: Record<number, number> = {}
      selectedServices.forEach((service) => {
        const personIds = servicePersonMapping[service.id] || [0]
        personIds.forEach((personIdx) => {
          personDurations[personIdx] = (personDurations[personIdx] || 0) + (parseInt(service.duration) || 0)
        })
      })
      return Math.max(...Object.values(personDurations), 0)
    }
  }

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
      originalPrice: service.originalPrice || service.salePrice || 0,
      salePrice: service.salePrice,
      duration: service.duration,
    }

    const isCurrentlySelected = selectedServices.some(s => s.id === service.id)

    setSelectedServices(prev => {
      if (isCurrentlySelected) return prev.filter(s => s.id !== service.id)
      return [...prev, serviceData]
    })

    setSelectedDate(null)
    setSelectedTimeSlot(null)

    if (!isCurrentlySelected) {
        if (numberOfPeople > 1) {
            setPersonSelectionModal({ service: serviceData, numberOfPeople })
        } else if (SPECIALIST_SERVICES.includes(service.id)) {
            setSpecialistModal(serviceData)
            setSelectedSpecialists([])
        }
    }
  }

  const isServiceSelected = (serviceId: string) => selectedServices.some((s) => s.id === serviceId)

  const dateOptions = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() + i)
      const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']
      return { day: d.getDate(), label: dayNames[d.getDay()] }
  })

  const filteredCategories = availableServices.map((cat) => ({
    ...cat,
    services: cat.services.filter(
      (service) => service.name.toLowerCase().includes(searchQuery.toLowerCase()) || cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.services.length > 0)

  return (
    <div className="min-h-screen bg-background pb-40">
      <div className="bg-background">
        <div className="max-w-2xl mx-auto px-4 pt-8 pb-6">
          <div className="flex flex-col items-center justify-center mb-4">
            <div className="text-4xl font-bold text-primary mb-2">{salonData.logoUrl || '💇‍♀️'}</div>
            <h1 className="text-xl font-bold">{salonData.name}</h1>
          </div>
          <div className="text-center">
            <p className="text-sm md:text-base text-foreground">{welcomeMessage}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
          <div className="bg-card rounded-2xl border-2 border-border p-4 space-y-4">
              <div className="flex items-center justify-center gap-4 bg-muted/30 rounded-xl px-4 py-2.5 border border-muted">
                <button onClick={() => setNumberOfPeople(Math.max(1, numberOfPeople - 1))} className="text-foreground font-bold text-lg leading-none">−</button>
                <div className="flex flex-col items-center px-4">
                  <span className="text-lg font-bold text-foreground">{numberOfPeople}</span>
                  <span className="text-xs text-muted-foreground font-medium leading-tight">kişi</span>
                </div>
                <button onClick={() => setNumberOfPeople(Math.min(4, numberOfPeople + 1))} className="font-bold text-lg leading-none" disabled={numberOfPeople >= 4}>+</button>
              </div>

              <div className={`flex items-center justify-center gap-4 rounded-xl p-2 transition-all duration-300 ${selectedGender === 'female' ? 'bg-pink-100 dark:bg-pink-950/30' : 'bg-blue-100 dark:bg-blue-950/30'}`}>
                <button onClick={() => setSelectedGender('female')} className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-2xl font-semibold ${selectedGender === 'female' ? 'bg-pink-300/60 shadow-md scale-105' : 'opacity-70'}`}>👩</button>
                <button onClick={() => setSelectedGender('male')} className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-2xl font-semibold ${selectedGender === 'male' ? 'bg-blue-300/60 shadow-md scale-105' : 'opacity-70'}`}>👨</button>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input type="text" placeholder="Hizmet ara..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-xl bg-muted/30 text-foreground placeholder-muted-foreground focus:outline-none focus:bg-muted/50 transition-colors" />
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
                      const isSelected = isServiceSelected(service.id)
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
                                {displayPrice > 0 && <p className="text-sm font-bold text-secondary">{displayPrice}₺</p>}
                                <Button size="sm" onClick={() => handleServiceToggle(service, category.name)} variant={isSelected ? 'default' : 'outline'} className="mt-2 rounded-full text-xs font-semibold">{isSelected ? 'Eklendi' : 'Ekle'}</Button>
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
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4"><Calendar className="w-4 h-4 text-primary" /> Tarih Seçin</h3>
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
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Saat Seçin</h3>
                {availableSlots.length === 0 ? (
                    <div className="p-8 text-center bg-muted/20 rounded-xl border border-dashed border-muted"><AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">Randevu bulunamadı.</p></div>
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
                      document.querySelector('[data-scroll-target="date-time"]')?.scrollIntoView({ behavior: 'smooth' })
                    } else {
                      if (isKnownCustomer) setShowConfirmationModal(true)
                      else setShowRegistrationModal(true)
                    }
                  }} className={`px-6 py-3 font-bold text-sm rounded-full ${selectedDate && selectedTimeSlot ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'}`} disabled={!selectedDate || !selectedTimeSlot}>Randevuyu Onayla</Button>
              </div>
            </div>
          </div>
        )}

      {/* Modals */}
      {specialistModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in">
          <div className="bg-card w-full rounded-t-2xl p-6 space-y-4 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">{specialistModal.name}</h3>
              <button onClick={() => setSpecialistModal(null)} className="text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-2">
              {availableStaff.map((staff) => (
                <label key={staff.id} className="flex items-center gap-3 p-3 rounded-lg border-2 border-muted cursor-pointer">
                  <input type="radio" name="specialist" checked={selectedSpecialists.includes(staff.name)} onChange={() => setSelectedSpecialists([staff.name])} className="w-5 h-5 accent-primary" />
                  <span className="text-sm font-medium text-foreground">{staff.name}</span>
                </label>
              ))}
            </div>
            <Button onClick={() => setSpecialistModal(null)} className="w-full bg-primary text-primary-foreground rounded-full py-3">Tamam</Button>
          </div>
        </div>
      )}

      {showRegistrationModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50 animate-in fade-in">
          <div className="bg-card w-full rounded-t-3xl p-4 space-y-3 animate-in slide-in-from-bottom max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between sticky top-0 bg-card pb-2">
              <h2 className="text-xl font-bold">Kaydını Tamamla</h2>
              <button onClick={() => setShowRegistrationModal(false)} className="text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-2.5">
              <input type="text" value={registrationForm.fullName} onChange={(e) => setRegistrationForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Ad Soyad" className="w-full px-3 py-2 rounded-lg bg-muted/30 text-sm border border-muted" />
              <input type="tel" value={registrationForm.phone} onChange={(e) => setRegistrationForm(p => ({ ...p, phone: e.target.value }))} placeholder="Telefon" className="w-full px-3 py-2 rounded-lg bg-muted/30 text-sm border border-muted" />
              <div className="flex gap-2">
                  <Button onClick={() => setRegistrationForm(p => ({ ...p, gender: 'female' }))} variant={registrationForm.gender === 'female' ? 'default' : 'outline'} className="flex-1">👩</Button>
                  <Button onClick={() => setRegistrationForm(p => ({ ...p, gender: 'male' }))} variant={registrationForm.gender === 'male' ? 'default' : 'outline'} className="flex-1">👨</Button>
              </div>
              <input type="date" value={registrationForm.birthDate} onChange={(e) => setRegistrationForm(p => ({ ...p, birthDate: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-muted/30 text-sm border border-muted" />
            </div>
            <Button onClick={async () => {
                if (!registrationForm.fullName || !registrationForm.phone) return alert('Doldurunuz')
                const res = await registerCustomer({ ...registrationForm, salonId })
                if (res.customerId) { setCustomerId(res.customerId); setIsKnownCustomer(true); setShowRegistrationModal(false); setShowConfirmationModal(true); }
            }} className="w-full rounded-full py-2 bg-primary text-primary-foreground font-semibold">Kayıt Ol & Onayla</Button>
          </div>
        </div>
      )}

      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50 animate-in fade-in">
          <div className="bg-card w-full rounded-t-3xl p-6 space-y-6 animate-in slide-in-from-bottom max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold">Randevu Onayı</h2>
            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20 space-y-2">
                <p className="text-sm font-bold">{selectedDate} Mart - {selectedTimeSlot}</p>
                <p className="text-xs text-muted-foreground">{calculateTotalDuration()} dakika</p>
                <p className="text-xs text-muted-foreground">{numberOfPeople} kişi</p>
            </div>
            <Button onClick={() => { alert('Randevunuz alındı!'); setShowConfirmationModal(false); }} className="w-full rounded-full py-3 bg-secondary text-secondary-foreground font-bold">Randevuyu Tamamla</Button>
          </div>
        </div>
      )}
    </div>
  )
}

const SalonDashboard = () => (
    <Suspense fallback={<div>Yükleniyor...</div>}>
        <SalonDashboardContent />
    </Suspense>
)

export default SalonDashboard
