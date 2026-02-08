import { Suspense } from 'react'
import { BookingPageClient } from '@/components/booking-page-client'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <BookingPageClient />
    </Suspense>
  )
}
