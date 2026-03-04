'use client'

import type { Salon } from '@/lib/types'

interface HeroProps {
  salon: Salon
}

export function Hero({ salon }: HeroProps) {
  return (
    <section className="relative py-16 md:py-24 px-4 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
      <div className="max-w-4xl mx-auto">
        {/* Logo/Name */}
        <div className="flex flex-col items-center mb-8 md:mb-12">
          {salon.logoUrl && (
            <img 
              src={salon.logoUrl} 
              alt={salon.name} 
              className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg shadow-lg mb-4"
            />
          )}
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 text-center">
            {salon.name}
          </h1>
          {salon.description && (
            <p className="text-lg text-slate-600 mt-3 text-center">
              {salon.description}
            </p>
          )}
        </div>

        {/* Contact Info */}
        {(salon.phone || salon.address) && (
          <div className="flex flex-col sm:flex-row justify-center gap-6 text-sm text-slate-600">
            {salon.phone && <p>📞 {salon.phone}</p>}
            {salon.address && <p>📍 {salon.address}</p>}
          </div>
        )}
      </div>
    </section>
  )
}
