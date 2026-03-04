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

  // If no salon slug, display SaaS landing page (root domain)
  if (!salonSlug) {
    return <SaaSLandingPage />
  }

  try {
    // Fetch salon data and services using the slug
    // Note: Backend API needs to support slug-based lookup
    // For now, using salonId as fallback
    const [salonData, services] = await Promise.all([
      getSalon(salonSlug),
      getServices(salonSlug, 'female'), // Default to female
    ])

    // If salon not found, show 404
    if (!salonData || !salonData.id) {
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
