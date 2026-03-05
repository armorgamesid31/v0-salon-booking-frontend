import type { HomepageExpert, HomepageSalon } from '@/lib/types'

interface ContactProps {
  title: string
  expertsTitle: string
  openWhatsappLabel: string
  workingScheduleLabel: string
  salon: HomepageSalon
  experts: HomepageExpert[]
  whatsappUrl?: string
  locale?: string
}

function formatWorkingDays(days: number[] = [], locale = 'en-US') {
  if (days.length === 0) return '-'
  return days
    .map((day) => {
      const base = new Date(Date.UTC(2026, 0, 4 + day))
      return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(base)
    })
    .join(', ')
}

export function Contact({
  title,
  expertsTitle,
  openWhatsappLabel,
  workingScheduleLabel,
  salon,
  experts,
  whatsappUrl,
  locale,
}: ContactProps) {
  const workingDays = salon.workingHours?.workingDays || []

  return (
    <section className="py-14 bg-neutral-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="text-2xl font-semibold text-neutral-900">{title}</h2>
          {salon.workingHours && (
            <div className="mt-4 rounded-xl bg-neutral-50 p-4 text-sm text-neutral-700">
              <p>
                {workingScheduleLabel}: {salon.workingHours.workStartHour}:00 - {salon.workingHours.workEndHour}:00 (
                {salon.workingHours.timezone})
              </p>
              <p className="mt-1">{formatWorkingDays(workingDays, locale)}</p>
            </div>
          )}
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              {openWhatsappLabel}
            </a>
          )}
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h3 className="text-2xl font-semibold text-neutral-900">{expertsTitle}</h3>
          <div className="mt-4 space-y-3">
            {experts.slice(0, 6).map((expert) => (
              <div key={expert.id} className="rounded-xl border border-neutral-200 p-4">
                <div className="flex items-start gap-3">
                  <img
                    src={expert.profileImageUrl || '/placeholder-logo.png'}
                    alt={expert.name}
                    className="h-12 w-12 rounded-full border border-neutral-200 object-cover"
                  />
                  <div>
                    <p className="font-semibold text-neutral-900">{expert.name}</p>
                    {expert.title && <p className="text-sm text-neutral-600">{expert.title}</p>}
                    {expert.bio && <p className="text-sm text-neutral-500 mt-1">{expert.bio}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
