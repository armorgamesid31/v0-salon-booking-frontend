'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { normalizeLocale } from '@/lib/locales'

export default function LocalizedLegacyBookingRedirect() {
  const params = useParams<{ locale: string }>()

  useEffect(() => {
    const locale = normalizeLocale(params?.locale)
    const search = typeof window !== 'undefined' ? window.location.search : ''
    window.location.replace(`/${locale}/booking${search || ''}`)
  }, [params?.locale])

  return null
}
