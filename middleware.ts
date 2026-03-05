import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, getLocaleFromAcceptLanguage } from './lib/locales'

const PUBLIC_FILE = /\.[^/]+$/

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname === '/favicon.ico' || PUBLIC_FILE.test(pathname)) {
    return NextResponse.next()
  }

  const segments = pathname.split('/').filter(Boolean)
  const first = segments[0]

  if (first && SUPPORTED_LOCALES.includes(first as (typeof SUPPORTED_LOCALES)[number])) {
    return NextResponse.next()
  }

  const browserLocale = getLocaleFromAcceptLanguage(request.headers.get('accept-language'))
  let detectedLocale = browserLocale || DEFAULT_LOCALE

  const strippedSegments = [...segments]
  if (first && first.length === 2 && !SUPPORTED_LOCALES.includes(first as (typeof SUPPORTED_LOCALES)[number])) {
    strippedSegments.shift()
    detectedLocale = DEFAULT_LOCALE
  }

  const nextPath = `/${detectedLocale}${strippedSegments.length ? `/${strippedSegments.join('/')}` : ''}`
  const redirectUrl = new URL(nextPath, request.url)
  redirectUrl.search = request.nextUrl.search

  return NextResponse.redirect(redirectUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
