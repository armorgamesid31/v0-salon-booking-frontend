export const BASE_DOMAIN = 'kedyapp.com'
export const RESERVED_SLUGS = ['www', 'api', 'admin', 'portal']

export function extractTenantSlug(hostname: string): string | null {
  const cleanHost = (hostname || '').split(':')[0]

  if (!cleanHost.endsWith(`.${BASE_DOMAIN}`)) {
    return null
  }

  const slug = cleanHost.replace(`.${BASE_DOMAIN}`, '').trim().toLowerCase()
  if (!slug || RESERVED_SLUGS.includes(slug)) {
    return null
  }

  return slug
}
