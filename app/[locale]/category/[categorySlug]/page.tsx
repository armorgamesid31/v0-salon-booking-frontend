import type { Metadata } from 'next'
import { cache } from 'react'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { fetchCategoryLanding } from '@/lib/server-api'
import { isSupportedLocale, normalizeLocale } from '@/lib/locales'
import { extractTenantSlug } from '@/lib/tenant'

interface Props {
  params: Promise<{ locale: string; categorySlug: string }>
}

const getCategoryLanding = cache(async (locale: string, categorySlug: string, tenantSlug: string) => {
  return fetchCategoryLanding({ locale, categorySlug, tenantSlug })
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, categorySlug } = await params
  const normalizedLocale = normalizeLocale(locale)

  const headerStore = await headers()
  const host = headerStore.get('host') || ''
  const tenantSlug = extractTenantSlug(host)

  if (!tenantSlug || !isSupportedLocale(normalizedLocale)) {
    return {}
  }

  try {
    const data = await getCategoryLanding(normalizedLocale, categorySlug, tenantSlug)
    return {
      title: data.seo.title,
      description: data.seo.description,
      alternates: { canonical: data.seo.canonical },
      openGraph: {
        title: data.seo.ogTitle,
        description: data.seo.ogDescription,
        url: data.seo.canonical,
        type: 'website',
      },
    }
  } catch {
    return {}
  }
}

export default async function CategoryLandingPage({ params }: Props) {
  const { locale, categorySlug } = await params
  const normalizedLocale = normalizeLocale(locale)

  if (!isSupportedLocale(normalizedLocale)) {
    notFound()
  }

  const headerStore = await headers()
  const host = headerStore.get('host') || ''
  const tenantSlug = extractTenantSlug(host)

  if (!tenantSlug) {
    notFound()
  }

  try {
    const data = await getCategoryLanding(normalizedLocale, categorySlug, tenantSlug)

    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-semibold text-neutral-900">{data.category.name}</h1>
        <p className="mt-3 text-neutral-700">{data.category.marketingDescription}</p>

        {data.category.benefits.length > 0 && (
          <ul className="mt-6 list-disc space-y-2 pl-6 text-neutral-700">
            {data.category.benefits.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>
        )}

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-neutral-900">Services</h2>
          <ul className="mt-3 space-y-2">
            {data.services.map((service) => (
              <li key={service.id} className="rounded-lg border border-neutral-200 px-4 py-3 text-sm">
                {service.name} - {service.duration} dk
              </li>
            ))}
          </ul>
        </section>

        <a
          href={data.cta.bookingUrl}
          className="mt-8 inline-flex rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white"
        >
          Book Now
        </a>
      </main>
    )
  } catch {
    notFound()
  }
}
