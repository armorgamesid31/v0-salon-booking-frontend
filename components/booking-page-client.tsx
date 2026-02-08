'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Service,
  TimeSlot,
  BookingConfirmation,
  fetchServices,
  fetchAvailableSlots,
  confirmBooking,
  validateToken,
} from '@/lib/api'
import { ServiceSelection } from '@/components/service-selection'
import { DateTimeSelection } from '@/components/datetime-selection'
import { BookingConfirmationScreen } from '@/components/booking-confirmation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, Loader2, ChevronRight, ChevronLeft } from 'lucide-react'

type BookingStep = 'service' | 'datetime' | 'confirmation' | 'error'

interface BookingState {
  serviceId: string | null
  date: string | null
  time: string | null
}

export function BookingPageClient() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [step, setStep] = useState<BookingStep>('service')
  const [bookingState, setBookingState] = useState<BookingState>({
    serviceId: null,
    date: null,
    time: null,
  })
  const [services, setServices] = useState<Service[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Validate token and load initial data
  useEffect(() => {
    const initializePage = async () => {
      try {
        if (!token) {
          setErrorMessage('Invalid or missing booking token')
          setStep('error')
          return
        }

        const isValid = await validateToken(token)
        if (!isValid) {
          setErrorMessage('This booking link has expired or is invalid')
          setStep('error')
          return
        }

        const loadedServices = await fetchServices()
        setServices(loadedServices)
      } catch {
        setErrorMessage('Failed to load services. Please try again.')
        setStep('error')
      } finally {
        setIsLoading(false)
      }
    }

    initializePage()
  }, [token])

  // Load time slots when date is selected
  useEffect(() => {
    if (bookingState.date) {
      const loadTimeSlots = async () => {
        try {
          const slots = await fetchAvailableSlots(bookingState.date!)
          setTimeSlots(slots)
        } catch {
          setErrorMessage('Failed to load time slots')
        }
      }

      loadTimeSlots()
    }
  }, [bookingState.date])

  const handleSelectService = (serviceId: string) => {
    setBookingState({
      serviceId,
      date: null,
      time: null,
    })
    setTimeSlots([])
  }

  const handleSelectDateTime = (date: string, time: string) => {
    setBookingState((prev) => ({
      ...prev,
      date,
      time: time || prev.time,
    }))
  }

  const handleContinue = async () => {
    if (bookingState.serviceId && bookingState.date && bookingState.time) {
      if (step === 'service') {
        setStep('datetime')
      } else if (step === 'datetime') {
        // Confirm booking
        try {
          setIsLoading(true)
          const result = await confirmBooking({
            token: token!,
            serviceId: bookingState.serviceId,
            date: bookingState.date,
            time: bookingState.time,
          })
          setConfirmation(result)
          setStep('confirmation')
        } catch (error) {
          setErrorMessage('Failed to confirm booking. Please try again.')
        } finally {
          setIsLoading(false)
        }
      }
    }
  }

  const handleBack = () => {
    if (step === 'datetime') {
      setStep('service')
      setBookingState((prev) => ({
        ...prev,
        date: null,
        time: null,
      }))
    }
  }

  const handleBookAnother = () => {
    setStep('service')
    setBookingState({
      serviceId: null,
      date: null,
      time: null,
    })
    setConfirmation(null)
    setTimeSlots([])
  }

  const canContinue = {
    service: !!bookingState.serviceId,
    datetime: !!bookingState.date && !!bookingState.time,
  }

  if (isLoading && step === 'service') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0" />
              <h1 className="text-lg font-semibold text-destructive">
                Booking Error
              </h1>
            </div>
            <p className="text-muted-foreground mb-4">{errorMessage}</p>
            <p className="text-sm text-muted-foreground">
              Please check the booking link and try again, or contact the salon
              for assistance.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">Salon Booking</h1>
          <p className="text-muted-foreground mt-1">
            Complete your appointment booking
          </p>

          {/* Progress Indicator */}
          {step !== 'confirmation' && (
            <div className="flex items-center gap-2 mt-6">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
                  step === 'service' || step === 'datetime'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                1
              </div>
              <div
                className={`flex-1 h-1 rounded-full ${
                  step === 'datetime' ? 'bg-primary' : 'bg-border'
                }`}
              />
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
                  step === 'datetime'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                2
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {step === 'confirmation' && confirmation ? (
          <BookingConfirmationScreen
            confirmation={confirmation}
            onBookAnother={handleBookAnother}
          />
        ) : (
          <>
            {/* Service Selection */}
            {(step === 'service' || step === 'datetime') && (
              <div
                className={`transition-all duration-300 ${
                  step === 'service' ? 'opacity-100' : 'opacity-50 pointer-events-none'
                }`}
              >
                <ServiceSelection
                  services={services}
                  selectedServiceId={bookingState.serviceId}
                  onSelectService={handleSelectService}
                  isLoading={isLoading}
                />
              </div>
            )}

            {/* Date & Time Selection */}
            {step === 'datetime' && (
              <div className="transition-all duration-300 opacity-100 mt-12">
                <DateTimeSelection
                  onSelectDateTime={handleSelectDateTime}
                  timeSlots={timeSlots}
                  selectedDate={bookingState.date}
                  selectedTime={bookingState.time}
                  isLoading={isLoading}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between mt-12 pt-8 border-t border-border">
              {step === 'datetime' && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleBack}
                  className="flex items-center gap-2 bg-transparent"
                  disabled={isLoading}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
              )}
              <div
                className={`${
                  step === 'service' ? 'ml-auto' : 'ml-auto'
                } flex gap-3`}
              >
                <Button
                  size="lg"
                  onClick={handleContinue}
                  disabled={!canContinue[step] || isLoading}
                  className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {step === 'service' ? 'Select Date' : 'Confirm Booking'}
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-card mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            Questions? Contact us at{' '}
            <span className="font-semibold text-foreground">
              (555) 123-4567
            </span>{' '}
            or{' '}
            <span className="font-semibold text-foreground">
              booking@salon.com
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
