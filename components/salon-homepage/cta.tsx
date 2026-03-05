interface CtaProps {
  title: string
  description: string
  buttonLabel: string
  href: string
}

export function Cta({ title, description, buttonLabel, href }: CtaProps) {
  return (
    <section className="py-14 bg-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-neutral-900 bg-neutral-900 p-8 md:p-10 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-semibold">{title}</h2>
          <p className="mt-3 text-neutral-300">{description}</p>
          <a
            href={href}
            className="mt-6 inline-flex rounded-full bg-white px-8 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
          >
            {buttonLabel}
          </a>
        </div>
      </div>
    </section>
  )
}
