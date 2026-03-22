import { About } from './about'
import { Categories } from './categories'
import { Contact } from './contact'
import { Cta } from './cta'
import { Gallery } from './gallery'
import { Hero } from './hero'
import { Instagram } from './instagram'
import { Testimonials } from './testimonials'
import { WhatsAppButton } from './whatsapp-button'
import type { SalonHomepageProps } from './types'

export default function SalonHomepage({
  salon,
  categories,
  experts,
  gallery,
  testimonials,
  booking,
  labels,
  languageControl,
  locale,
}: SalonHomepageProps) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full z-50 bg-background/95 border-b border-border backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={salon.logoUrl || '/placeholder-logo.png'}
              alt={salon.name}
              className="h-10 w-10 rounded-full object-cover border border-border"
            />
          </div>
          <div className="flex items-center gap-3">
            {languageControl}
            <a href={booking.bookingUrl} className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90">
              {labels.bookNow}
            </a>
          </div>
        </div>
      </nav>

      <Hero salon={salon} booking={booking} bookNowLabel={labels.bookNow} reserveLabel={labels.reserveAppointment} />
      <Categories title={labels.categories} categories={categories} servicesCount={labels.servicesCount} />
      <Cta
        title={labels.reserveAppointment}
        description="Choose your preferred date and secure your spot in minutes."
        buttonLabel={labels.bookNow}
        href={booking.bookingUrl}
      />
      <About title={labels.aboutTitle} about={salon.about} />
      <Gallery title={labels.galleryTitle} gallery={gallery} />
      <Testimonials title={labels.clientReviews} testimonials={testimonials} />
      <Instagram title={labels.instagramTitle} instagramUrl={salon.instagramUrl} />
      <Contact
        title={labels.contactTitle}
        expertsTitle={labels.expertsTitle}
        openWhatsappLabel={labels.openWhatsapp}
        workingScheduleLabel={labels.workingSchedule}
        salon={salon}
        experts={experts}
        whatsappUrl={booking.whatsappPhone ? `https://wa.me/${booking.whatsappPhone}` : undefined}
        locale={locale}
      />
      <Cta
        title={labels.getInTouch}
        description="Ready for your next beauty session? Start now with one click."
        buttonLabel={labels.bookNow}
        href={booking.bookingUrl}
      />

      <WhatsAppButton whatsappPhone={booking.whatsappPhone} label={labels.openWhatsapp} />
    </div>
  )
}
