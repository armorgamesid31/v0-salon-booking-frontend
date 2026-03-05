export const SUPPORTED_LOCALES = ['tr', 'en', 'es', 'fr', 'de', 'pt', 'ru', 'zh', 'ar', 'hi'] as const

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: SupportedLocale = 'tr'

export function isSupportedLocale(value?: string | null): value is SupportedLocale {
  if (!value) return false
  return SUPPORTED_LOCALES.includes(value as SupportedLocale)
}

export function normalizeLocale(value?: string | null): SupportedLocale {
  if (!value) return DEFAULT_LOCALE
  const short = value.toLowerCase().split('-')[0]
  return isSupportedLocale(short) ? short : DEFAULT_LOCALE
}

export function getLocaleFromAcceptLanguage(headerValue?: string | null): SupportedLocale {
  if (!headerValue) return DEFAULT_LOCALE

  const parts = headerValue
    .split(',')
    .map((item) => item.trim().split(';')[0])
    .filter(Boolean)

  for (const part of parts) {
    const normalized = normalizeLocale(part)
    if (normalized) return normalized
  }

  return DEFAULT_LOCALE
}
