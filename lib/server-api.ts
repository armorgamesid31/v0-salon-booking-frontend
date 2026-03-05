import { API_BASE_URL } from './constants'
import { DEFAULT_LOCALE, normalizeLocale, type SupportedLocale } from './locales'

export interface SeoMetadataDto {
  title: string
  description: string
  canonical: string
  ogTitle: string
  ogDescription: string
}

export interface CategoryLandingDto {
  category: {
    id: number
    key: string
    slug: string
    name: string
    image?: string | null
    marketingDescription?: string | null
    benefits: string[]
  }
  services: Array<{
    id: number
    name: string
    duration: number
    price: number
    requiresSpecialist?: boolean | null
  }>
  cta: {
    bookingUrl: string
  }
  seo: SeoMetadataDto
}

export interface CategoryCitySeoDto {
  category: {
    id: number
    key: string
    slug: string
    name: string
    marketingDescription?: string | null
    image?: string | null
  }
  city: {
    name?: string | null
    slug: string
  }
  salons: Array<{
    id: number
    slug?: string | null
    name: string
    logoUrl?: string | null
    city?: string | null
    district?: string | null
    bookingUrl: string
    serviceCount: number
  }>
  seo: SeoMetadataDto
}

export interface CategoryLocationSeoDto {
  category: {
    id: number
    key: string
    slug: string
    name: string
    marketingDescription?: string | null
    image?: string | null
  }
  location: {
    city: {
      name?: string | null
      slug: string
    }
    district: {
      name?: string | null
      slug: string
    }
  }
  salons: Array<{
    id: number
    slug?: string | null
    name: string
    logoUrl?: string | null
    city?: string | null
    district?: string | null
    bookingUrl: string
    serviceCount: number
  }>
  seo: SeoMetadataDto
}

async function requestServerApi<T>(url: string, tenantSlug?: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      ...(tenantSlug ? { 'x-tenant-slug': tenantSlug } : {}),
    },
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    throw new Error(`API request failed (${response.status})`)
  }

  return response.json() as Promise<T>
}

export async function fetchCategoryLanding(params: {
  categorySlug: string
  locale: string
  tenantSlug: string
}): Promise<CategoryLandingDto> {
  const locale = normalizeLocale(params.locale)
  const url = `${API_BASE_URL}/api/categories/${params.categorySlug}/landing?locale=${locale}`
  return requestServerApi<CategoryLandingDto>(url, params.tenantSlug)
}

export async function fetchCategoryCitySeo(params: {
  categorySlug: string
  citySlug: string
  locale: string
  tenantSlug: string
}): Promise<CategoryCitySeoDto> {
  const locale = normalizeLocale(params.locale)
  const url = `${API_BASE_URL}/api/seo/category-city?categorySlug=${encodeURIComponent(params.categorySlug)}&citySlug=${encodeURIComponent(
    params.citySlug,
  )}&locale=${locale}`
  return requestServerApi<CategoryCitySeoDto>(url, params.tenantSlug)
}

export async function fetchCategoryLocationSeo(params: {
  categorySlug: string
  citySlug: string
  districtSlug: string
  locale: string
  tenantSlug: string
}): Promise<CategoryLocationSeoDto> {
  const locale = normalizeLocale(params.locale)
  const url = `${API_BASE_URL}/api/seo/category-location?categorySlug=${encodeURIComponent(
    params.categorySlug,
  )}&citySlug=${encodeURIComponent(params.citySlug)}&districtSlug=${encodeURIComponent(params.districtSlug)}&locale=${locale}`
  return requestServerApi<CategoryLocationSeoDto>(url, params.tenantSlug)
}

export function normalizeLocaleParam(locale?: string): SupportedLocale {
  return normalizeLocale(locale || DEFAULT_LOCALE)
}
