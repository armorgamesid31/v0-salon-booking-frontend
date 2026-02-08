'use client'

import { BookingConfirmation } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Calendar, Clock, DollarSign } from 'lucide-react'

interface BookingConfirmationProps {
  confirmation: BookingConfirmation
  onBookAnother?: () => void
  onClose?: () => void
}

export function BookingConfirmationScreen({
  confirmation,
  onBookAnother,
  onClose,
}: BookingConfirmationProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8 space-y-4">
        <div className="flex justify-center">
          <CheckCircle2 className="w-16 h-16 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-muted-foreground">
            Your appointment has been successfully booked
          </p>
        </div>
      </div>

      <Card className="bg-card border-border mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Booking Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* Service */}
            <div className="pb-4 border-b border-border">
              <p className="text-sm text-muted-foreground mb-1">Service</p>
              <p className="text-xl font-semibold text-foreground">
                {confirmation.service.name}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {confirmation.service.description}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date */}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-semibold text-foreground">
                    {formatDate(confirmation.date)}
                  </p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-semibold text-foreground">
                    {confirmation.time}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-semibold text-foreground">
                    ${confirmation.service.price}
                  </p>
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="pt-2 border-t border-border">
              <p className="text-sm text-muted-foreground mb-1">Duration</p>
              <p className="font-semibold text-foreground">
                {confirmation.service.duration} minutes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Number */}
      <Card className="bg-secondary border-border mb-8">
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Confirmation Number
          </p>
          <p className="text-2xl font-mono font-bold text-primary">
            {confirmation.id}
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            Save this number for your records
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onBookAnother && (
          <Button
            variant="outline"
            size="lg"
            onClick={onBookAnother}
            className="flex-1 bg-transparent"
          >
            Book Another Service
          </Button>
        )}
        {onClose && (
          <Button
            size="lg"
            onClick={onClose}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Done
          </Button>
        )}
      </div>

      {/* Footer Message */}
      <div className="mt-8 p-4 bg-secondary rounded-lg border border-border text-center">
        <p className="text-sm text-muted-foreground mb-2">
          A confirmation email has been sent to your email address
        </p>
        <p className="text-xs text-muted-foreground">
          If you need to reschedule, please contact the salon
        </p>
      </div>
    </div>
  )
}
