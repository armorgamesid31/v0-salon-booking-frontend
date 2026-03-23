import type { Metadata } from 'next'
import { cache } from 'react'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { fetchCategoryCitySeo } from '@/lib/server-api'
import { isSupportedLocale, normalizeLocale } from '@/lib/locales'
import { extractTenantSlug } from '@/lib/tenant'
import { getRuntimeContent, getRuntimeText } from '@/lib/runtime-content'

interface Props {
  params: Promise<{ locale: string; categorySlug: string; citySlug: string }>
}

const getCategoryCitySeo = cache(async (locale: string, categorySlug: string, citySlug: string, tenantSlug: string) => {
  return fetchCategoryCitySeo({ locale, categorySlug, citySlug, tenantSlug })
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, categorySlug, citySlug } = await params
  const normalizedLocale = normalizeLocale(locale)

  const headerStore = await headers()
  const host = headerStore.get('host') || ''
  const tenantSlug = extractTenantSlug(host)

  if (!tenantSlug || !isSupportedLocale(normalizedLocale)) {
    return {}
  }

  try {
    const data = await getCategoryCitySeo(normalizedLocale, categorySlug, citySlug, tenantSlug)
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

export default async function CategoryCityPage({ params }: Props) {
  const { locale, categorySlug, citySlug } = await params
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
    const data = await getCategoryCitySeo(normalizedLocale, categorySlug, citySlug, tenantSlug)
    const runtimeContent = await getRuntimeContent({
      surface: 'booking_page',
      page: 'category_city',
      locale: normalizedLocale,
      tenantSlug,
    })
    const salonsLabel = getRuntimeText(runtimeContent, 'labels.salons', 'Salons')
    const bookLabel = getRuntimeText(runtimeContent, 'labels.book', 'Book')

    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-semibold text-neutral-900">
          {data.city.name || data.city.slug} - {data.category.name}
        </h1>
        <p className="mt-3 text-neutral-700">{data.category.marketingDescription}</p>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-neutral-900">{salonsLabel}</h2>
          <ul className="mt-3 space-y-3">
            {data.salons.map((salon) => (
              <li key={salon.id} className="rounded-lg border border-neutral-200 px-4 py-3">
                <p className="font-medium text-neutral-900">{salon.name}</p>
                <p className="text-sm text-neutral-600">
                  {salon.city} {salon.district ? `- ${salon.district}` : ''}
                </p>
                <a href={salon.bookingUrl} className="mt-2 inline-flex text-sm font-semibold text-neutral-900 underline">
                  {bookLabel}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
    )
  } catch {
    notFound()
  }
}
