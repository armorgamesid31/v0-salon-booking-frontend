import Image from 'next/image'
import { Star, MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react'

interface Service {
  id: string
  name: string
  description?: string
  price?: string
  duration?: string
}

interface Testimonial {
  id: string
  name: string
  comment: string
  rating?: number
}

interface SocialLinks {
  instagram?: string
  facebook?: string
}

interface Theme {
  primaryColor?: string
  secondaryColor?: string
}

interface SalonHomepageData {
  name: string
  logoUrl: string
  heroImageUrl?: string
  description?: string
  services: Service[]
  testimonials?: Testimonial[]
  address?: string
  phone?: string
  email?: string
  socialLinks?: SocialLinks
  bookingUrl: string
  theme?: Theme
}

export default function SalonHomepage({
  name,
  logoUrl,
  heroImageUrl,
  description,
  services,
  testimonials,
  address,
  phone,
  email,
  socialLinks,
  bookingUrl,
  theme = {},
}: SalonHomepageData) {
  const primaryColor = theme.primaryColor || '#1a1a1a'
  const secondaryColor = theme.secondaryColor || '#d4a574'

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3 md:py-5">
            <div className="relative w-24 h-24 md:w-32 md:h-32">
              <Image
                src={logoUrl}
                alt={`${name} logo`}
                fill
                className="object-contain"
                priority
              />
            </div>

            <a
              href={bookingUrl}
              className="px-6 md:px-8 py-2 md:py-2.5 rounded-full font-medium text-sm md:text-base text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: secondaryColor }}
            >
              Book Now
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 md:pt-36 pb-12 md:pb-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="order-2 md:order-1">
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-serif font-light leading-tight mb-6 text-pretty"
                style={{ color: primaryColor }}
              >
                {name}
              </h1>
              {description && (
                <p className="text-lg md:text-xl text-neutral-600 leading-relaxed mb-8 max-w-lg">
                  {description}
                </p>
              )}
              <a
                href={bookingUrl}
                className="inline-block px-8 md:px-10 py-3 md:py-4 rounded-full font-medium text-white transition-all hover:shadow-lg text-base md:text-lg"
                style={{ backgroundColor: secondaryColor }}
              >
                Reserve Your Appointment
              </a>
            </div>

            {heroImageUrl && (
              <div className="order-1 md:order-2 relative h-80 md:h-96 rounded-lg overflow-hidden">
                <Image
                  src={heroImageUrl}
                  alt={name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-serif font-light mb-4"
              style={{ color: primaryColor }}
            >
              Our Services
            </h2>
            <div
              className="w-12 h-1 mx-auto rounded-full"
              style={{ backgroundColor: secondaryColor }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="border border-neutral-200 rounded-lg p-6 md:p-8 hover:border-neutral-300 transition-colors"
              >
                <h3
                  className="text-xl md:text-2xl font-serif font-light mb-3"
                  style={{ color: primaryColor }}
                >
                  {service.name}
                </h3>
                {service.description && (
                  <p className="text-neutral-600 mb-4 leading-relaxed">
                    {service.description}
                  </p>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-neutral-100">
                  {service.price && (
                    <span
                      className="text-lg md:text-xl font-semibold"
                      style={{ color: secondaryColor }}
                    >
                      {service.price}
                    </span>
                  )}
                  {service.duration && (
                    <span className="text-sm text-neutral-500">
                      {service.duration}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials && testimonials.length > 0 && (
        <section className="py-16 md:py-24 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16">
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-serif font-light mb-4"
                style={{ color: primaryColor }}
              >
                Client Reviews
              </h2>
              <div
                className="w-12 h-1 mx-auto rounded-full"
                style={{ backgroundColor: secondaryColor }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-white rounded-lg p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow"
                >
                  {testimonial.rating && (
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          className={
                            i < testimonial.rating
                              ? 'fill-current'
                              : 'text-neutral-300'
                          }
                          style={{
                            color:
                              i < testimonial.rating
                                ? secondaryColor
                                : '#d1d5db',
                          }}
                        />
                      ))}
                    </div>
                  )}
                  <p className="text-neutral-700 mb-4 leading-relaxed italic">
                    "{testimonial.comment}"
                  </p>
                  <p
                    className="font-semibold"
                    style={{ color: primaryColor }}
                  >
                    {testimonial.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            <div>
              <h2
                className="text-3xl md:text-4xl font-serif font-light mb-8"
                style={{ color: primaryColor }}
              >
                Get in Touch
              </h2>

              <div className="space-y-6">
                {address && (
                  <div className="flex gap-4">
                    <MapPin
                      size={24}
                      className="flex-shrink-0 mt-1"
                      style={{ color: secondaryColor }}
                    />
                    <div>
                      <p className="font-semibold text-neutral-900 mb-1">
                        Address
                      </p>
                      <p className="text-neutral-600">{address}</p>
                    </div>
                  </div>
                )}

                {phone && (
                  <div className="flex gap-4">
                    <Phone
                      size={24}
                      className="flex-shrink-0 mt-1"
                      style={{ color: secondaryColor }}
                    />
                    <div>
                      <p className="font-semibold text-neutral-900 mb-1">
                        Phone
                      </p>
                      <a
                        href={`tel:${phone}`}
                        className="text-neutral-600 hover:underline"
                      >
                        {phone}
                      </a>
                    </div>
                  </div>
                )}

                {email && (
                  <div className="flex gap-4">
                    <Mail
                      size={24}
                      className="flex-shrink-0 mt-1"
                      style={{ color: secondaryColor }}
                    />
                    <div>
                      <p className="font-semibold text-neutral-900 mb-1">
                        Email
                      </p>
                      <a
                        href={`mailto:${email}`}
                        className="text-neutral-600 hover:underline"
                      >
                        {email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              className="rounded-lg p-8 md:p-12"
              style={{ backgroundColor: `${secondaryColor}15` }}
            >
              <h3
                className="text-2xl font-serif font-light mb-6"
                style={{ color: primaryColor }}
              >
                Ready to Book?
              </h3>
              <p className="text-neutral-700 mb-8 leading-relaxed">
                Experience our premium services. Click below to reserve your
                appointment with us today.
              </p>
              <a
                href={bookingUrl}
                className="inline-block px-8 py-3 rounded-full font-medium text-white transition-all hover:shadow-lg"
                style={{ backgroundColor: secondaryColor }}
              >
                Book Your Appointment
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-100 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative w-8 h-8">
                  <Image
                    src={logoUrl}
                    alt={`${name} logo`}
                    fill
                    className="object-contain"
                  />
                </div>
                <span
                  className="font-serif text-lg font-light"
                  style={{ color: primaryColor }}
                >
                  {name}
                </span>
              </div>
              <p className="text-neutral-600 text-sm">
                Premium beauty salon experience for all your styling needs.
              </p>
            </div>

            {(address || phone || email) && (
              <div>
                <p className="font-semibold text-neutral-900 mb-4">Contact</p>
                <div className="space-y-2 text-sm text-neutral-600">
                  {address && <p>{address}</p>}
                  {phone && (
                    <p>
                      <a href={`tel:${phone}`} className="hover:underline">
                        {phone}
                      </a>
                    </p>
                  )}
                  {email && (
                    <p>
                      <a href={`mailto:${email}`} className="hover:underline">
                        {email}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            )}

            {socialLinks &&
              (socialLinks.instagram || socialLinks.facebook) && (
                <div>
                  <p className="font-semibold text-neutral-900 mb-4">Follow</p>
                  <div className="flex gap-4">
                    {socialLinks.instagram && (
                      <a
                        href={socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-600 hover:text-neutral-900 transition-colors"
                        aria-label="Instagram"
                      >
                        <Instagram size={20} />
                      </a>
                    )}
                    {socialLinks.facebook && (
                      <a
                        href={socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-600 hover:text-neutral-900 transition-colors"
                        aria-label="Facebook"
                      >
                        <Facebook size={20} />
                      </a>
                    )}
                  </div>
                </div>
              )}
          </div>

          <div className="border-t border-neutral-200 pt-8 text-center text-sm text-neutral-600">
            <p>
              &copy; {new Date().getFullYear()} {name}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
