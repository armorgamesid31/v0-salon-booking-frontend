import { notFound, redirect } from 'next/navigation'
import { isSupportedLocale } from '@/lib/locales'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function LocalizedLegacyBookingRedirect({ params, searchParams }: Props) {
  const { locale } = await params
  if (!isSupportedLocale(locale)) {
    notFound()
  }

  const entries = Object.entries((await searchParams) || {})
  const qp = new URLSearchParams()
  for (const [key, value] of entries) {
    if (Array.isArray(value)) {
      value.forEach((v) => qp.append(key, v))
    } else if (value !== undefined) {
      qp.append(key, value)
    } else {
      qp.append(key, '')
    }
  }
  const query = qp.toString()
  redirect(query ? `/${locale}/booking?${query}` : `/${locale}/booking`)
}
