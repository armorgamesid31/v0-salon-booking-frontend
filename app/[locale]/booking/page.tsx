import { notFound } from 'next/navigation'
import BookingDashboard from '@/components/booking-dashboard'
import { isSupportedLocale } from '@/lib/locales'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function BookingPage({ params }: Props) {
  const { locale } = await params
  if (!isSupportedLocale(locale)) {
    notFound()
  }

  return <BookingDashboard forcedLanguage={locale} />
}
