import type { Metadata } from 'next'
import { cache } from 'react'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { fetchCategoryLocationSeo } from '@/lib/server-api'
import { isSupportedLocale, normalizeLocale } from '@/lib/locales'
import { extractTenantSlug } from '@/lib/tenant'

interface Props {
  params: Promise<{ locale: string; categorySlug: string; citySlug: string; districtSlug: string }>
}

const getCategoryLocationSeo = cache(
  async (locale: string, categorySlug: string, citySlug: string, districtSlug: string, tenantSlug: string) => {
    return fetchCategoryLocationSeo({ locale, categorySlug, citySlug, districtSlug, tenantSlug })
  },
)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, categorySlug, citySlug, districtSlug } = await params
  const normalizedLocale = normalizeLocale(locale)

  const headerStore = await headers()
  const host = headerStore.get('host') || ''
  const tenantSlug = extractTenantSlug(host)

  if (!tenantSlug || !isSupportedLocale(normalizedLocale)) {
    return {}
  }

  try {
    const data = await getCategoryLocationSeo(normalizedLocale, categorySlug, citySlug, districtSlug, tenantSlug)
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

export default async function CategoryLocationPage({ params }: Props) {
  const { locale, categorySlug, citySlug, districtSlug } = await params
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
    const data = await getCategoryLocationSeo(normalizedLocale, categorySlug, citySlug, districtSlug, tenantSlug)

    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-semibold text-neutral-900">
          {data.location.district.name || data.location.district.slug}, {data.location.city.name || data.location.city.slug} -{' '}
          {data.category.name}
        </h1>
        <p className="mt-3 text-neutral-700">{data.category.marketingDescription}</p>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-neutral-900">Salons</h2>
          <ul className="mt-3 space-y-3">
            {data.salons.map((salon) => (
              <li key={salon.id} className="rounded-lg border border-neutral-200 px-4 py-3">
                <p className="font-medium text-neutral-900">{salon.name}</p>
                <p className="text-sm text-neutral-600">
                  {salon.city} {salon.district ? `- ${salon.district}` : ''}
                </p>
                <a href={salon.bookingUrl} className="mt-2 inline-flex text-sm font-semibold text-neutral-900 underline">
                  Book
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
