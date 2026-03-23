import { API_BASE_URL } from './constants'

export type RuntimeContentValue =
  | string
  | number
  | boolean
  | null
  | RuntimeContentValue[]
  | { [key: string]: RuntimeContentValue }

export type RuntimeContentMap = Record<string, RuntimeContentValue>

interface RuntimeContentParams {
  surface: string
  locale?: string
  page?: string
  tenantSlug?: string
  salonId?: string | number
  timeoutMs?: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function normalizeRuntimePayload(payload: unknown): RuntimeContentMap {
  if (!isRecord(payload)) return {}

  if (isRecord(payload.values)) {
    return payload.values as RuntimeContentMap
  }

  if (isRecord(payload.content)) {
    return payload.content as RuntimeContentMap
  }

  if (isRecord(payload.data)) {
    return payload.data as RuntimeContentMap
  }

  return payload as RuntimeContentMap
}

export async function getRuntimeContent({
  surface,
  locale,
  page,
  tenantSlug,
  salonId,
  timeoutMs = 1200,
}: RuntimeContentParams): Promise<RuntimeContentMap> {
  const params = new URLSearchParams()
  params.set('surface', surface)
  if (locale) params.set('locale', locale)
  if (page) params.set('page', page)
  if (tenantSlug) params.set('tenantSlug', tenantSlug)
  if (salonId !== undefined && salonId !== null && `${salonId}`.trim()) params.set('salonId', `${salonId}`)

  const url = `${API_BASE_URL}/api/content/runtime?${params.toString()}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    })

    if (!response.ok) {
      return {}
    }

    const payload = await response.json().catch(() => null)
    return normalizeRuntimePayload(payload)
  } catch {
    return {}
  } finally {
    clearTimeout(timeout)
  }
}

export function getRuntimeValue(content: RuntimeContentMap, key: string): RuntimeContentValue | undefined {
  if (!key) return undefined

  const direct = content[key]
  if (direct !== undefined) return direct

  const parts = key.split('.')
  let current: unknown = content

  for (const part of parts) {
    if (!isRecord(current) || !(part in current)) {
      return undefined
    }
    current = current[part]
  }

  return current as RuntimeContentValue
}

export function getRuntimeText(content: RuntimeContentMap, key: string, fallback: string): string {
  const value = getRuntimeValue(content, key)
  if (typeof value === 'string' && value.trim().length > 0) {
    return value
  }
  return fallback
}
