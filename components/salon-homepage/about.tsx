interface AboutProps {
  title: string
  about?: string | null
}

export function About({ title, about }: AboutProps) {
  return (
    <section className="py-14 bg-neutral-100">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-semibold text-neutral-900 mb-6">{title}</h2>
        <p className="text-base md:text-lg leading-relaxed text-neutral-700">
          {about ||
            'Our salon combines modern techniques, high hygiene standards, and personalized care to deliver a premium beauty experience from start to finish.'}
        </p>
      </div>
    </section>
  )
}
