'use client'

import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import SalonHomepage from '@/components/salon-homepage'
import LanguageSelector from '@/components/language-selector'
import { getSalonHomepageBySlug } from '@/lib/api'
import type { SalonHomepageResponse } from '@/lib/types'
import { DEFAULT_LANGUAGE, detectBrowserLanguage, HOME_TEXT, LOCALE_MAP, normalizeLanguage, type LanguageCode } from '@/lib/i18n'

const BASE_DOMAIN = 'kedyapp.com'
const RESERVED_SLUGS = ['www', 'api', 'admin', 'portal']

function buildBookingUrl(searchParams: URLSearchParams, baseUrl: string): string {
  if (baseUrl.startsWith('https://wa.me/')) {
    return baseUrl
  }

  const params = new URLSearchParams()
  const token = searchParams.get('token')
  const salonId = searchParams.get('salonId')
  const lang = searchParams.get('lang')

  if (token) params.set('token', token)
  if (!token && salonId) params.set('salonId', salonId)
  if (lang) params.set('lang', lang)

  const query = params.toString()
  return query ? `${baseUrl}?${query}` : baseUrl
}

function extractTenantSlug(hostname: string): string | null {
  if (!hostname.endsWith(`.${BASE_DOMAIN}`)) {
    return null
  }

  const slug = hostname.replace(`.${BASE_DOMAIN}`, '')
  if (!slug || RESERVED_SLUGS.includes(slug.toLowerCase())) {
    return null
  }

  return slug
}

export default function HomePage() {
  const searchParams = useSearchParams()
  const searchParamsString = searchParams.toString()
  const [homepageData, setHomepageData] = useState<SalonHomepageResponse | null>(null)
  const [tenantNotFound, setTenantNotFound] = useState(false)
  const [language, setLanguage] = useState<LanguageCode>(DEFAULT_LANGUAGE)

  useEffect(() => {
    const params = new URLSearchParams(searchParamsString)
    const queryLang = params.get('lang')
    const savedLang = typeof window !== 'undefined' ? window.localStorage.getItem('preferredLanguage') : null
    const selected = normalizeLanguage(queryLang || savedLang || detectBrowserLanguage())
    setLanguage(selected)
  }, [searchParamsString])

  useEffect(() => {
    const params = new URLSearchParams(searchParamsString)
    const hostname = window.location.hostname
    const tenantSlug = extractTenantSlug(hostname) || params.get('slug')

    if (!tenantSlug) {
      setTenantNotFound(true)
      return
    }

    getSalonHomepageBySlug(tenantSlug)
      .then((data) => {
        setHomepageData(data)
      })
      .catch(() => {
        setTenantNotFound(true)
      })
  }, [searchParamsString])

  const bookingUrl = useMemo(() => {
    if (!homepageData) return '/randevu'
    const params = new URLSearchParams(searchParamsString)
    params.set('lang', language)
    return buildBookingUrl(params, homepageData.booking.bookingUrl || '/randevu')
  }, [homepageData, searchParamsString, language])

  const text = HOME_TEXT[language]

  const handleLanguageChange = (next: LanguageCode) => {
    setLanguage(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('preferredLanguage', next)
    }
  }

  if (tenantNotFound) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 text-center">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900">{text.tenantNotFoundTitle}</h1>
          <p className="mt-3 text-neutral-600">{text.tenantNotFoundDesc}</p>
          <div className="mt-5 flex justify-center">
            <LanguageSelector value={language} onChange={handleLanguageChange} />
          </div>
        </div>
      </main>
    )
  }

  if (!homepageData) {
    return <div className="flex h-screen items-center justify-center">{text.loading}</div>
  }

  return (
    <main>
      <SalonHomepage
        salon={homepageData.salon}
        categories={homepageData.categories}
        experts={homepageData.experts}
        gallery={homepageData.gallery}
        testimonials={homepageData.testimonials}
        booking={{
          ...homepageData.booking,
          bookingUrl,
        }}
        locale={LOCALE_MAP[language]}
        languageControl={<LanguageSelector value={language} onChange={handleLanguageChange} />}
        labels={{
          bookNow: text.bookNow,
          reserveAppointment: text.reserveAppointment,
          categories: text.categories,
          servicesCount: text.servicesCount,
          clientReviews: text.clientReviews,
          getInTouch: text.getInTouch,
          aboutTitle: text.aboutTitle,
          galleryTitle: text.galleryTitle,
          instagramTitle: text.instagramTitle,
          contactTitle: text.contactTitle,
          expertsTitle: text.expertsTitle,
          openWhatsapp: text.openWhatsapp,
          workingSchedule: text.workingSchedule,
        }}
      />
    </main>
  )
}
