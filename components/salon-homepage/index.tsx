'use client'

import type { Salon, ServiceCategory } from '@/lib/types'
import { Hero } from './hero'
import { About } from './about'
import { Services } from './services'
import { Testimonials } from './testimonials'
import { Contact } from './contact'
import { Footer } from './footer'

interface SalonHomepageProps {
  salon: Salon
  services: ServiceCategory[]
  salonSlug: string
}

export function SalonHomepage({ salon, services, salonSlug }: SalonHomepageProps) {
  return (
    <div className="min-h-screen bg-white">
      <Hero salon={salon} />
      <About salon={salon} />
      <Services services={services} salonSlug={salonSlug} />
      <Testimonials />
      <Contact salon={salon} />
      <Footer salon={salon} />
    </div>
  )
}
