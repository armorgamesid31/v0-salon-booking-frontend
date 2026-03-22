import type { HomepageBooking, HomepageSalon } from '@/lib/types'

interface HeroProps {
  salon: HomepageSalon
  booking: HomepageBooking
  bookNowLabel: string
  reserveLabel: string
}

export function Hero({ salon, booking, bookNowLabel, reserveLabel }: HeroProps) {
  return (
    <section className="pt-24 pb-14 bg-gradient-to-b from-background to-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">{bookNowLabel}</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground leading-tight">
            {salon.name}
          </h1>
          <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed">
            {salon.tagline || 'Premium care, trusted experts, and a modern beauty experience.'}
          </p>
          <a
            href={booking.bookingUrl}
            className="mt-8 inline-flex rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-colors"
          >
            {reserveLabel}
          </a>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-border">
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
