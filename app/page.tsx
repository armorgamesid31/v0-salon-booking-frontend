'use client'

import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import SalonHomepage from '@/components/salon-homepage'
import LanguageSelector from '@/components/language-selector'
import { getBookingContextByToken, getSalon, getSalonStrict, getServices } from '@/lib/api'
import type { Salon, ServiceCategory } from '@/lib/types'
import { DEFAULT_LANGUAGE, detectBrowserLanguage, HOME_TEXT, normalizeLanguage, type LanguageCode } from '@/lib/i18n'

const FALLBACK_HERO = '/placeholder.jpg'
const BASE_DOMAIN = 'kedyapp.com'
const RESERVED_SLUGS = ['www', 'api', 'admin', 'portal']

function buildBookingUrl(searchParams: URLSearchParams): string {
  const params = new URLSearchParams()
  const token = searchParams.get('token')
  const salonId = searchParams.get('salonId')

  if (token) params.set('token', token)
  if (!token && salonId) params.set('salonId', salonId)

  const query = params.toString()
  return query ? `/randevu?${query}` : '/randevu'
}

function mapServices(categories: ServiceCategory[]) {
  return categories.flatMap((category) =>
    category.services.map((service) => ({
      id: service.id,
      name: service.name,
      description: category.name,
      price: `${service.salePrice || service.originalPrice}₺`,
      duration: service.duration,
    }))
  )
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
  const [salon, setSalon] = useState<Salon | null>(null)
  const [categories, setCategories] = useState<ServiceCategory[]>([])
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
    const token = params.get('token')
    const hostname = window.location.hostname
    const tenantSlug = extractTenantSlug(hostname)

    const loadData = async () => {
      if (tenantSlug) {
        const tenantSalon = await getSalonStrict()
        if (!tenantSalon) {
          return { tenantMissing: true as const }
        }

        const tenantServices = await getServices(tenantSalon.id)
        return {
          tenantMissing: false as const,
          salonData: tenantSalon,
          serviceData: tenantServices,
        }
      }

      let resolvedSalonId = params.get('salonId') || '1'

      if (token) {
        const context = await getBookingContextByToken(token)
        if (context?.salonId) {
          resolvedSalonId = context.salonId
        }
      }

      return Promise.all([getSalon(resolvedSalonId), getServices(resolvedSalonId)])
    }

    loadData()
      .then((result) => {
        if ('tenantMissing' in result && result.tenantMissing) {
          setTenantNotFound(true)
          return
        }

        if (Array.isArray(result)) {
          const [salonData, serviceData] = result
          setSalon(salonData)
          setCategories(serviceData)
          return
        }

        setSalon(result.salonData)
        setCategories(result.serviceData)
      })
      .catch(() => {
        setSalon({
          id: '1',
          name: 'KedyApp Guzellik Salonu',
          description: 'Randevunuzu saniyeler icinde olusturun.',
          logoUrl: '/placeholder-logo.png',
        })
      })
  }, [searchParamsString])

  const bookingUrl = useMemo(
    () => {
      const params = new URLSearchParams(searchParamsString)
      params.set('lang', language)
      return buildBookingUrl(params)
    },
    [searchParamsString, language]
  )

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

  if (!salon) {
    return <div className="flex h-screen items-center justify-center">{text.loading}</div>
  }

  return (
    <main>
      <div className="fixed right-4 top-4 z-[60]">
        <LanguageSelector value={language} onChange={handleLanguageChange} />
      </div>
      <SalonHomepage
        name={salon.name}
        logoUrl={salon.logoUrl || '/placeholder-logo.png'}
        heroImageUrl={FALLBACK_HERO}
        description={salon.description || 'Salonunuzu kesfedin ve online randevu alin.'}
        services={mapServices(categories)}
        testimonials={[]}
        address={salon.address}
        phone={salon.phone}
        bookingUrl={bookingUrl}
        theme={{
          primaryColor: '#2d1f1a',
          secondaryColor: '#d4a574',
        }}
        labels={{
          bookNow: text.bookNow,
          reserveAppointment: text.reserveAppointment,
          ourServices: text.ourServices,
          clientReviews: text.clientReviews,
          getInTouch: text.getInTouch,
        }}
      />
    </main>
  )
}
