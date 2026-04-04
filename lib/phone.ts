import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  isSupportedCountry,
  parsePhoneNumberFromString,
  type CountryCode,
} from 'libphonenumber-js/max'
import type { LanguageCode } from './i18n'

export type PhoneCountryOption = {
  iso: CountryCode
  callingCode: string
  label: string
}

export type ParsedPhoneInput = {
  countryIso: CountryCode
  display: string
  normalizedDigits: string
  e164: string | null
  isValid: boolean
  isMobile: boolean
  error: string | null
}

const LANGUAGE_DEFAULT_COUNTRY: Record<LanguageCode, CountryCode> = {
  tr: 'TR',
  en: 'US',
  es: 'ES',
  fr: 'FR',
  de: 'DE',
  pt: 'PT',
  ru: 'RU',
  zh: 'CN',
  ar: 'SA',
  hi: 'IN',
}

function getCountryName(iso: CountryCode, locale: string) {
  try {
    const formatter = new Intl.DisplayNames([locale], { type: 'region' })
    return formatter.of(iso) || iso
  } catch {
    return iso
  }
}

function formatTurkishInput(rawValue: string) {
  let digits = String(rawValue || '').replace(/\D/g, '')
  if (digits.startsWith('90')) digits = digits.slice(2)
  if (digits.startsWith('0')) digits = digits.slice(1)
  digits = digits.slice(0, 10)
  const a = digits.slice(0, 3)
  const b = digits.slice(3, 6)
  const c = digits.slice(6, 8)
  const d = digits.slice(8, 10)
  let display = ''
  if (a) display = `(${a}`
  if (a.length === 3) display += ')'
  if (b) display += `${display ? ' ' : ''}${b}`
  if (c) display += ` ${c}`
  if (d) display += ` ${d}`
  return { digits, display: display.trim() }
}

export function getDefaultCountryForLanguage(language: LanguageCode): CountryCode {
  return LANGUAGE_DEFAULT_COUNTRY[language] || 'US'
}

export function getPhoneCountryOptions(language: LanguageCode): PhoneCountryOption[] {
  const locale = `${language}-${language.toUpperCase()}`
  return getCountries()
    .filter((iso) => isSupportedCountry(iso))
    .map((iso) => ({
      iso,
      callingCode: getCountryCallingCode(iso),
      label: `${getCountryName(iso, locale)} (+${getCountryCallingCode(iso)})`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, locale))
}

export function parsePhoneInput(rawValue: string, countryIsoInput: string): ParsedPhoneInput {
  const fallbackCountry = (isSupportedCountry(countryIsoInput as CountryCode) ? countryIsoInput : 'US') as CountryCode
  const countryIso = fallbackCountry
  const preformatted =
    countryIso === 'TR'
      ? formatTurkishInput(rawValue)
      : {
          digits: String(rawValue || '').replace(/\D/g, ''),
          display: new AsYouType(countryIso).input(rawValue || ''),
        }

  const parsed = parsePhoneNumberFromString(rawValue || '', countryIso)
  if (!parsed || !parsed.isValid()) {
    return {
      countryIso,
      display: preformatted.display,
      normalizedDigits: '',
      e164: null,
      isValid: false,
      isMobile: false,
      error: 'invalid_phone',
    }
  }

  const type = parsed.getType()
  const isMobile = type === 'MOBILE' || type === 'FIXED_LINE_OR_MOBILE'
  return {
    countryIso,
    display: countryIso === 'TR' ? formatTurkishInput(parsed.nationalNumber).display || parsed.formatNational() : parsed.formatNational(),
    normalizedDigits: parsed.number.replace(/\D/g, ''),
    e164: parsed.number,
    isValid: parsed.isValid(),
    isMobile,
    error: isMobile ? null : 'mobile_phone_required',
  }
}

export function formatPhoneForDisplayFromDigits(phoneDigits: string | null | undefined, fallbackCountry: string): string {
  const digits = String(phoneDigits || '').replace(/\D/g, '')
  if (!digits) return ''
  const parsed = parsePhoneNumberFromString(`+${digits}`)
  if (parsed?.isValid()) {
    if (parsed.country === 'TR') {
      return formatTurkishInput(parsed.nationalNumber).display
    }
    return parsed.formatNational()
  }
  return countryIsoToPrefix(fallbackCountry) ? `+${digits}` : digits
}

export function countryIsoToPrefix(countryIsoInput: string): string {
  if (!isSupportedCountry(countryIsoInput as CountryCode)) return ''
  return `+${getCountryCallingCode(countryIsoInput as CountryCode)}`
}
