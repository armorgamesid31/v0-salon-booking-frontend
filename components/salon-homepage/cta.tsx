interface CtaProps {
  title: string
  description: string
  buttonLabel: string
  href: string
}

export function Cta({ title, description, buttonLabel, href }: CtaProps) {
  return (
    <section className="py-14 bg-card">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-primary bg-primary p-8 md:p-10 text-primary-foreground text-center">
          <h2 className="text-2xl md:text-3xl font-semibold">{title}</h2>
          <p className="mt-3 text-primary-foreground/80">{description}</p>
          <a
            href={href}
            className="mt-6 inline-flex rounded-full bg-card px-8 py-3 text-sm font-semibold text-foreground hover:bg-background"
          >
            {buttonLabel}
          </a>
        </div>
      </div>
    </section>
  )
}
