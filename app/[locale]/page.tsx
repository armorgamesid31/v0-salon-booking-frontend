import { notFound } from 'next/navigation'
import HomePageClient from '@/components/pages/home-page-client'
import { isSupportedLocale } from '@/lib/locales'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function LocalizedHomePage({ params }: Props) {
  const { locale } = await params
  if (!isSupportedLocale(locale)) {
    notFound()
  }

  return <HomePageClient locale={locale} />
}
