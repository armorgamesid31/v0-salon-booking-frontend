/**
 * API Integration Layer
 * All backend interactions go through these functions
 * This makes it easy to swap with real API calls later
 */

export interface Service {
  id: string
  name: string
  description: string
  duration: number // minutes
  price: number
  image?: string
}

export interface TimeSlot {
  id: string
  time: string
  available: boolean
}

export interface BookingData {
  token: string
  serviceId: string
  date: string
  time: string
  customerName?: string
  customerEmail?: string
}

export interface BookingConfirmation {
  id: string
  service: Service
  date: string
  time: string
  status: 'confirmed' | 'pending' | 'cancelled'
}

/**
 * Fetch available salon services
 * Replace this with actual API call to your backend
 */
export async function fetchServices(): Promise<Service[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return [
    {
      id: 'haircut',
      name: 'Classic Haircut',
      description: 'Professional haircut with styling',
      duration: 45,
      price: 65,
    },
    {
      id: 'color',
      name: 'Hair Coloring',
      description: 'Full hair coloring service',
      duration: 120,
      price: 150,
    },
    {
      id: 'treatment',
      name: 'Hair Treatment',
      description: 'Deep conditioning and treatment',
      duration: 60,
      price: 85,
    },
    {
      id: 'styling',
      name: 'Styling',
      description: 'Professional styling for events',
      duration: 75,
      price: 95,
    },
    {
      id: 'blowout',
      name: 'Blow Out',
      description: 'Professional blow dry styling',
      duration: 45,
      price: 55,
    },
  ]
}

/**
 * Fetch available time slots for a specific date
 * Replace this with actual API call to your backend
 */
export async function fetchAvailableSlots(
  date: string
): Promise<TimeSlot[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Return sample time slots
  const slots: TimeSlot[] = []
  const baseHour = 9 // Start at 9 AM
  const endHour = 17 // End at 5 PM
  const intervalMinutes = 30

  for (let hour = baseHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute
        .toString()
        .padStart(2, '0')}`
      // Make some slots unavailable for realism
      const available = Math.random() > 0.3
      slots.push({
        id: timeString,
        time: timeString,
        available,
      })
    }
  }

  return slots
}

/**
 * Confirm a booking
 * Replace this with actual API call to your backend
 */
export async function confirmBooking(
  data: BookingData
): Promise<BookingConfirmation> {
  // Simulate API delay and validation
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Fetch the service details for confirmation
  const services = await fetchServices()
  const service = services.find((s) => s.id === data.serviceId)

  if (!service) {
    throw new Error('Service not found')
  }

  return {
    id: `BOOK-${Date.now()}`,
    service,
    date: data.date,
    time: data.time,
    status: 'confirmed',
  }
}

/**
 * Validate a booking token
 * Replace this with actual API call to your backend
 */
export async function validateToken(token: string): Promise<boolean> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  // In a real app, this would validate against your backend
  // For now, any non-empty token is valid
  return token.length > 0
}
