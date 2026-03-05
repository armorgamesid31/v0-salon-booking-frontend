import { notFound, redirect } from 'next/navigation'
import { isSupportedLocale } from '@/lib/locales'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function LocalizedLegacyBookingRedirect({ params }: Props) {
  const { locale } = await params
  if (!isSupportedLocale(locale)) {
    notFound()
  }

  redirect(`/${locale}/booking`)
}
