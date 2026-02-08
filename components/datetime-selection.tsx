'use client'

import { useState, useEffect } from 'react'
import { TimeSlot } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DateTimeSelectionProps {
  onSelectDateTime: (date: string, time: string) => void
  timeSlots: TimeSlot[]
  selectedDate: string | null
  selectedTime: string | null
  isLoading?: boolean
}

export function DateTimeSelection({
  onSelectDateTime,
  timeSlots,
  selectedDate,
  selectedTime,
  isLoading = false,
}: DateTimeSelectionProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Generate array of next 14 days
  const getUpcomingDates = () => {
    const dates = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Start from tomorrow
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      dates.push(date)
    }

    return dates
  }

  const upcomingDates = getUpcomingDates()
  const dateString = selectedDate
    ? new Date(selectedDate).toISOString().split('T')[0]
    : null

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDateISO = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  return (
    <div className="w-full space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Pick a Date & Time
        </h2>
        <p className="text-muted-foreground">
          Select your preferred appointment time
        </p>
      </div>

      {/* Date Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Date</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {upcomingDates.map((date) => {
            const isoDate = formatDateISO(date)
            const isSelected = dateString === isoDate

            return (
              <Button
                key={isoDate}
                variant={isSelected ? 'default' : 'outline'}
                className={`flex flex-col items-center justify-center p-3 h-auto ${
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:border-primary'
                }`}
                onClick={() => !isLoading && onSelectDateTime(isoDate, '')}
                disabled={isLoading}
              >
                <span className="text-xs font-medium">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className="text-lg font-bold">
                  {date.getDate()}
                </span>
                <span className="text-xs">
                  {date.toLocaleDateString('en-US', { month: 'short' })}
                </span>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Time</h3>
          <p className="text-sm text-muted-foreground">
            Available times for {selectedDate}
          </p>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {timeSlots.map((slot) => (
              <Button
                key={slot.id}
                variant={selectedTime === slot.id ? 'default' : 'outline'}
                disabled={!slot.available || isLoading}
                className={`${
                  selectedTime === slot.id
                    ? 'bg-primary text-primary-foreground'
                    : !slot.available
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:border-primary'
                }`}
                onClick={() => {
                  if (slot.available && !isLoading) {
                    onSelectDateTime(selectedDate, slot.time)
                  }
                }}
              >
                {slot.time}
              </Button>
            ))}
          </div>

          {timeSlots.length === 0 && (
            <Card className="bg-secondary border-border">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground text-sm">
                  No available times for this date. Please select another date.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {selectedDate && selectedTime && (
        <Card className="bg-secondary border-primary/20">
          <CardContent className="pt-6 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Date</span>
              <span className="font-semibold text-foreground">
                {selectedDate}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Time</span>
              <span className="font-semibold text-foreground">
                {selectedTime}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
