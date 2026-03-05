import type { HomepageTestimonial } from '@/lib/types'

interface TestimonialsProps {
  title: string
  testimonials: HomepageTestimonial[]
}

export function Testimonials({ title, testimonials }: TestimonialsProps) {
  return (
    <section className="py-14 bg-neutral-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-semibold text-neutral-900 mb-8">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <article key={testimonial.id} className="rounded-2xl border border-neutral-200 bg-white p-6">
              <p className="text-sm leading-relaxed text-neutral-700">"{testimonial.generatedText}"</p>
              {(testimonial.expert || testimonial.category) && (
                <p className="mt-4 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  {testimonial.expert?.name || 'Expert'}
                  {testimonial.category ? ` • ${testimonial.category.name}` : ''}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
