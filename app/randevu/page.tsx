import { redirect } from 'next/navigation'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function LegacyBookingRedirect({ searchParams }: Props) {
  const entries = Object.entries((await searchParams) || {})
  const qp = new URLSearchParams()
  for (const [key, value] of entries) {
    if (Array.isArray(value)) {
      value.forEach((v) => qp.append(key, v))
    } else if (value !== undefined) {
      qp.append(key, value)
    } else {
      qp.append(key, '')
    }
  }
  const query = qp.toString()
  redirect(query ? `/tr/booking?${query}` : '/tr/booking')
}
