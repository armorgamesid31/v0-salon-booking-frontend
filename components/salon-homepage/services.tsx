'use client'

import type { ServiceCategory } from '@/lib/types'
import { getIconComponent } from '@/lib/icon-helper'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ServicesProps {
  services: ServiceCategory[]
  salonSlug: string
}

export function Services({ services, salonSlug }: ServicesProps) {
  return (
    <section className="py-16 md:py-24 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">
          Our Services
        </h2>

        <div className="space-y-8">
          {services.map((category) => (
            <div key={category.id} className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{getIconComponent(category.icon)}</span>
                <h3 className="text-xl font-semibold text-slate-900">{category.name}</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {category.services.map((service) => (
                  <div key={service.id} className="flex justify-between items-start p-3 bg-slate-50 rounded">
                    <div>
                      <p className="font-medium text-slate-900">{service.name}</p>
                      <p className="text-sm text-slate-600">{service.duration}</p>
                    </div>
                    <p className="font-semibold text-slate-900">₺{service.salePrice || service.originalPrice}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href={`/randevu?salon=${salonSlug}`}>
            <Button size="lg">
              Book an Appointment
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
