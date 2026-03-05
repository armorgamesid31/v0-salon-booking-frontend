import type { HomepageExpert, HomepageSalon } from '@/lib/types'

interface ContactProps {
  title: string
  expertsTitle: string
  openWhatsappLabel: string
  salon: HomepageSalon
  experts: HomepageExpert[]
  whatsappUrl?: string
}

export function Contact({ title, expertsTitle, openWhatsappLabel, salon, experts, whatsappUrl }: ContactProps) {
  return (
    <section className="py-14 bg-neutral-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="text-2xl font-semibold text-neutral-900">{title}</h2>
          {salon.workingHours && (
            <p className="mt-4 text-sm text-neutral-700">
              Working hours: {salon.workingHours.workStartHour}:00 - {salon.workingHours.workEndHour}:00 ({salon.workingHours.timezone})
            </p>
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
                <p className="font-semibold text-neutral-900">{expert.name}</p>
                {expert.title && <p className="text-sm text-neutral-600">{expert.title}</p>}
                {expert.bio && <p className="text-sm text-neutral-500 mt-1">{expert.bio}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
