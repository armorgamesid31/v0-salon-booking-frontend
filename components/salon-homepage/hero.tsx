import type { HomepageBooking, HomepageSalon } from '@/lib/types'

interface HeroProps {
  salon: HomepageSalon
  booking: HomepageBooking
  bookNowLabel: string
  reserveLabel: string
}

export function Hero({ salon, booking, bookNowLabel, reserveLabel }: HeroProps) {
  return (
    <section className="pt-24 pb-14 bg-gradient-to-b from-neutral-100 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-4">{bookNowLabel}</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-neutral-900 leading-tight">
            {salon.name}
          </h1>
          <p className="mt-5 text-base md:text-lg text-neutral-600 leading-relaxed">
            {salon.tagline || 'Premium care, trusted experts, and a modern beauty experience.'}
          </p>
          <a
            href={booking.bookingUrl}
            className="mt-8 inline-flex rounded-full bg-neutral-900 px-8 py-3 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
          >
            {reserveLabel}
          </a>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-neutral-200">
          <img
            src={salon.heroImageUrl || '/placeholder.jpg'}
            alt={salon.name}
            className="h-[320px] md:h-[420px] w-full object-cover"
          />
        </div>
      </div>
    </section>
  )
}
