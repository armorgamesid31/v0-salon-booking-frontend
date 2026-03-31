'use client'

import { useMemo, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SalonHomepage from '@/components/salon-homepage'
import LanguageSelector from '@/components/language-selector'
import { getSalonHomepageBySlug } from '@/lib/api'
import type { SalonHomepageResponse } from '@/lib/types'
import { HOME_TEXT, LOCALE_MAP, normalizeLanguage, type LanguageCode } from '@/lib/i18n'
import { extractTenantSlug } from '@/lib/tenant'
import { normalizeLocale } from '@/lib/locales'
import { getRuntimeContent, getRuntimeText, type RuntimeContentMap } from '@/lib/runtime-content'

interface HomePageClientProps {
  locale: string
}

const getMagicToken = (params: URLSearchParams): string | null => {
  const direct = params.get('token')
  if (direct) return direct

  for (const [key, value] of params.entries()) {
    if (!value && key && key.length >= 8 && key !== 'salonId' && key !== 'slug' && key !== 'lang') {
      return key
    }
  }

  return null
}

function buildBookingUrl(searchParams: URLSearchParams, locale: LanguageCode, baseUrl: string): string {
  if (baseUrl.startsWith('https://wa.me/')) {
    return baseUrl
  }

  const params = new URLSearchParams()
  const token = getMagicToken(searchParams)
  const salonId = searchParams.get('salonId')

  if (token) params.set('token', token)
  if (!token && salonId) params.set('salonId', salonId)

  const query = params.toString()
  const bookingPath = `/${locale}/booking`
  return query ? `${bookingPath}?${query}` : bookingPath
}

export default function HomePageClient({ locale }: HomePageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchParamsString = searchParams.toString()
  const [homepageData, setHomepageData] = useState<SalonHomepageResponse | null>(null)
  const [tenantNotFound, setTenantNotFound] = useState(false)
  const [language, setLanguage] = useState<LanguageCode>(normalizeLanguage(locale))
  const [runtimeContent, setRuntimeContent] = useState<RuntimeContentMap>({})

  useEffect(() => {
    setLanguage(normalizeLanguage(locale))
  }, [locale])

  useEffect(() => {
    let active = true

    const params = new URLSearchParams(searchParamsString)
    const tenantSlug = extractTenantSlug(window.location.hostname) || params.get('slug') || undefined

    getRuntimeContent({
      surface: 'booking_page',
      page: 'home',
      locale: language,
      tenantSlug,
    }).then((content) => {
      if (active) {
        setRuntimeContent(content)
      }
    })

    return () => {
      active = false
    }
  }, [language, searchParamsString])

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
        setTenantNotFound(false)
      })
      .catch(() => {
        setTenantNotFound(true)
      })
  }, [searchParamsString])

  const bookingUrl = useMemo(() => {
    if (!homepageData) return `/${language}/booking`
    const params = new URLSearchParams(searchParamsString)
    return buildBookingUrl(params, language, homepageData.booking.bookingUrl || '/randevu')
  }, [homepageData, searchParamsString, language])

  const text = useMemo(() => {
    const fallback = HOME_TEXT[language]
    const servicesCountLabel = getRuntimeText(runtimeContent, 'stats.servicesCountLabel', '')

    return {
      ...fallback,
      bookNow: getRuntimeText(runtimeContent, 'common.bookNow', fallback.bookNow),
      reserveAppointment: getRuntimeText(runtimeContent, 'common.reserveAppointment', fallback.reserveAppointment),
      aboutTitle: getRuntimeText(runtimeContent, 'common.aboutTitle', fallback.aboutTitle),
      galleryTitle: getRuntimeText(runtimeContent, 'common.galleryTitle', fallback.galleryTitle),
      instagramTitle: getRuntimeText(runtimeContent, 'common.instagramTitle', fallback.instagramTitle),
      contactTitle: getRuntimeText(runtimeContent, 'common.contactTitle', fallback.contactTitle),
      expertsTitle: getRuntimeText(runtimeContent, 'common.expertsTitle', fallback.expertsTitle),
      openWhatsapp: getRuntimeText(runtimeContent, 'common.openWhatsapp', fallback.openWhatsapp),
      workingSchedule: getRuntimeText(runtimeContent, 'common.workingSchedule', fallback.workingSchedule),
      categories: getRuntimeText(runtimeContent, 'common.categories', fallback.categories),
      clientReviews: getRuntimeText(runtimeContent, 'common.clientReviews', fallback.clientReviews),
      getInTouch: getRuntimeText(runtimeContent, 'common.getInTouch', fallback.getInTouch),
      loading: getRuntimeText(runtimeContent, 'common.loading', fallback.loading),
      tenantNotFoundTitle: getRuntimeText(runtimeContent, 'errors.tenantNotFoundTitle', fallback.tenantNotFoundTitle),
      tenantNotFoundDesc: getRuntimeText(runtimeContent, 'errors.tenantNotFoundDescription', fallback.tenantNotFoundDesc),
      servicesCount: servicesCountLabel
        ? (count: number) => `${count} ${servicesCountLabel}`
        : fallback.servicesCount,
    }
  }, [language, runtimeContent])

  const handleLanguageChange = (next: LanguageCode) => {
    setLanguage(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('preferredLanguage', next)
    }

    const currentParams = new URLSearchParams(searchParamsString)
    const query = currentParams.toString()
    router.push(`/${normalizeLocale(next)}${query ? `?${query}` : ''}`)
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
