'use client'

import { useEffect } from 'react'

export default function LegacyBookingRedirect() {
  useEffect(() => {
    const search = typeof window !== 'undefined' ? window.location.search : ''
    window.location.replace(`/tr/booking${search || ''}`)
  }, [])

  return null
}
