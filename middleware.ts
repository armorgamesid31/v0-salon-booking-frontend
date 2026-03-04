import { NextRequest, NextResponse } from 'next/server'

/**
 * Multi-tenant middleware for subdomain-based tenant resolution
 * 
 * Flow:
 * palmbeauty.kedyapp.com → extracts "palmbeauty" → sets x-salon-slug header
 * kedyapp.com → root domain, no tenant resolution
 */

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  
  // Extract subdomain from host
  // Examples:
  // - palmbeauty.kedyapp.com → palmbeauty
  // - localhost:3000 → null (for development)
  // - kedyapp.com → null (root domain)
  const subdomainMatch = host.match(/^([a-z0-9-]+)\./) 
  const subdomain = subdomainMatch ? subdomainMatch[1] : null
  
  // Don't process root domain (kedyapp.com) or localhost without subdomain
  const isRootDomain = !subdomain || host === 'localhost:3000'
  
  const response = NextResponse.next()
  
  // Set tenant context header if subdomain exists
  if (!isRootDomain && subdomain) {
    response.headers.set('x-salon-slug', subdomain)
  }
  
  return response
}

// Configure middleware to run only on specified paths
// Skip static assets, images, and API routes
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}
