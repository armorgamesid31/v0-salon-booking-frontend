import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getSalon, getServices } from '@/lib/api'
import { SalonHomepage } from '@/components/salon-homepage'
import { SaaSLandingPage } from '@/components/saas-landing-page'

export const dynamic = 'force-dynamic'

export default async function Page() {
  // Get headers to read x-salon-slug set by middleware
  const headersList = await headers()
  const salonSlug = headersList.get('x-salon-slug')

  console.log('[Page] salonSlug from header:', salonSlug)

  // If no salon slug, display SaaS landing page (root domain)
  if (!salonSlug) {
    console.log('[Page] No salonSlug, showing SaaSLandingPage')
    return <SaaSLandingPage />
  }

  try {
    console.log('[Page] Fetching salon data for slug:', salonSlug)
    
    // Fetch salon data and services using the slug
    // Note: Backend API needs to support slug-based lookup
    // For now, using salonId as fallback
    const [salonData, services] = await Promise.all([
      getSalon(salonSlug),
      getServices(salonSlug, 'female'), // Default to female
    ])

    console.log('[Page] Salon data:', salonData)
    console.log('[Page] Services:', services)

    // If salon not found, show 404
    if (!salonData || !salonData.id) {
      console.log('[Page] Salon not found for slug:', salonSlug)
      notFound()
    }

    return (
      <SalonHomepage 
        salon={salonData} 
        services={services} 
        salonSlug={salonSlug}
      />
    )
  } catch (error) {
    console.error('[Page] Error loading salon:', error)
    notFound()
  }
}
