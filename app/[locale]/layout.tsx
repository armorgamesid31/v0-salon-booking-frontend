import { notFound } from 'next/navigation'
import { isSupportedLocale } from '@/lib/locales'

interface Props {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!isSupportedLocale(locale)) {
    notFound()
  }

  return <div lang={locale}>{children}</div>
}
