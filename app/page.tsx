'use client'

import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import SalonHomepage from '@/components/salon-homepage'
import { getBookingContextByToken, getSalon, getServices } from '@/lib/api'
import type { Salon, ServiceCategory } from '@/lib/types'

const FALLBACK_HERO = '/placeholder.jpg'

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

export default function HomePage() {
  const searchParams = useSearchParams()
  const searchParamsString = searchParams.toString()
  const [salon, setSalon] = useState<Salon | null>(null)
  const [categories, setCategories] = useState<ServiceCategory[]>([])

  useEffect(() => {
    const params = new URLSearchParams(searchParamsString)
    const token = params.get('token')

    const loadData = async () => {
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
      .then(([salonData, serviceData]) => {
        setSalon(salonData)
        setCategories(serviceData)
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
    () => buildBookingUrl(new URLSearchParams(searchParamsString)),
    [searchParamsString]
  )

  if (!salon) {
    return <div className="flex h-screen items-center justify-center">Yukleniyor...</div>
  }

  return (
    <main>
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
      />
    </main>
  )
}
