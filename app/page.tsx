'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Calendar, Scissors } from 'lucide-react'

const SERVICES = [
  {
    id: '1',
    name: 'Haircut',
    duration: '30 min',
    price: '$45',
    description: 'Professional haircut with styling',
  },
  {
    id: '2',
    name: 'Hair Coloring',
    duration: '90 min',
    price: '$85',
    description: 'Full color treatment',
  },
  {
    id: '3',
    name: 'Styling',
    duration: '45 min',
    price: '$55',
    description: 'Hair styling and blowout',
  },
  {
    id: '4',
    name: 'Hair Treatment',
    duration: '60 min',
    price: '$75',
    description: 'Deep conditioning treatment',
  },
]

const TIME_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '14:00 PM',
  '14:30 PM',
  '15:00 PM',
  '15:30 PM',
  '16:00 PM',
  '16:30 PM',
]

const DATES = [
  { label: 'Today', value: '2024-02-08' },
  { label: 'Tomorrow', value: '2024-02-09' },
  { label: 'Feb 10', value: '2024-02-10' },
  { label: 'Feb 11', value: '2024-02-11' },
  { label: 'Feb 12', value: '2024-02-12' },
  { label: 'Feb 13', value: '2024-02-13' },
]

export default function BookingPage() {
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isConfirmed, setIsConfirmed] = useState(false)

  const handleBooking = () => {
    if (selectedService && selectedDate && selectedTime) {
      setIsConfirmed(true)
    }
  }

  const handleReset = () => {
    setSelectedService(null)
    setSelectedDate(null)
    setSelectedTime(null)
    setIsConfirmed(false)
  }

  const selectedServiceData = SERVICES.find((s) => s.id === selectedService)

  if (isConfirmed && selectedServiceData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-primary-foreground" />
                </div>
              </div>
              <CardTitle className="text-3xl text-foreground">Booking Confirmed!</CardTitle>
              <CardDescription className="text-base mt-2">Your appointment has been booked successfully</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-secondary/50 rounded-lg p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Service</p>
                    <p className="text-lg font-semibold text-foreground">{selectedServiceData.name}</p>
                  </div>
                  <p className="text-2xl font-bold text-primary">{selectedServiceData.price}</p>
                </div>

                <div className="h-px bg-border" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="text-lg font-semibold text-foreground">
                      {DATES.find((d) => d.value === selectedDate)?.label}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="text-lg font-semibold text-foreground">{selectedTime}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-lg font-semibold text-foreground">{selectedServiceData.duration}</p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  A confirmation email has been sent. Please arrive 10 minutes early.
                </p>
              </div>

              <Button onClick={handleReset} className="w-full" size="lg">
                Book Another Appointment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Book Your Appointment</h1>
          <p className="text-lg text-muted-foreground">Select a service, date, and time that works for you</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Services Section */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-primary" />
                  Select a Service
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {SERVICES.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => setSelectedService(service.id)}
                      className={`text-left p-4 rounded-lg border-2 transition-all ${
                        selectedService === service.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 bg-card'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground text-lg">{service.name}</h3>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{service.duration}</p>
                        </div>
                        <p className="text-xl font-bold text-primary ml-4">{service.price}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Date & Time Section */}
            <Card className="border-0 shadow-lg mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Select Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dates */}
                <div>
                  <p className="text-sm font-semibold text-foreground mb-3">Available Dates</p>
                  <div className="grid grid-cols-3 gap-2">
                    {DATES.map((date) => (
                      <button
                        key={date.value}
                        onClick={() => setSelectedDate(date.value)}
                        className={`py-2 px-3 rounded-lg border-2 transition-all text-sm font-medium ${
                          selectedDate === date.value
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border hover:border-primary/50 text-foreground'
                        }`}
                      >
                        {date.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Times */}
                <div>
                  <p className="text-sm font-semibold text-foreground mb-3">Available Times</p>
                  <div className="grid grid-cols-4 gap-2">
                    {TIME_SLOTS.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 px-2 rounded-lg border-2 transition-all text-sm font-medium ${
                          selectedTime === time
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border hover:border-primary/50 text-foreground'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedServiceData ? (
                  <>
                    <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Service</p>
                        <p className="font-semibold text-foreground">{selectedServiceData.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="font-semibold text-foreground">
                          {selectedDate ? DATES.find((d) => d.value === selectedDate)?.label : 'Not selected'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Time</p>
                        <p className="font-semibold text-foreground">
                          {selectedTime || 'Not selected'}
                        </p>
                      </div>
                      <div className="h-px bg-border" />
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="text-xl font-bold text-primary">{selectedServiceData.price}</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleBooking}
                      disabled={!selectedService || !selectedDate || !selectedTime}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 text-base"
                      size="lg"
                    >
                      Confirm Booking
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground text-sm">
                      Select a service to see the booking summary
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>
            Questions? Contact us at{' '}
            <span className="font-semibold text-foreground">(555) 123-4567</span> or{' '}
            <span className="font-semibold text-foreground">booking@salon.com</span>
          </p>
        </div>
      </div>
    </div>
  )
}
