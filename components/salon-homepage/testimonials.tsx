'use client'

import { Star } from 'lucide-react'

export function Testimonials() {
  const testimonials = [
    {
      name: 'Ayşe K.',
      service: 'Facial Treatment',
      rating: 5,
      text: 'Amazing experience! The staff was so professional and made me feel completely relaxed.',
    },
    {
      name: 'Fatma D.',
      service: 'Hair Care',
      rating: 5,
      text: 'Best salon in the city. The quality of service is unmatched. Highly recommend!',
    },
    {
      name: 'Zeynep Y.',
      service: 'Laser Treatment',
      rating: 5,
      text: 'Professional, clean, and welcoming environment. Will definitely come back!',
    },
  ]

  return (
    <section className="py-16 md:py-24 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">
          What Our Clients Say
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="p-6 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex gap-1 mb-4">
                {Array(testimonial.rating).fill(0).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-slate-600 mb-4">"{testimonial.text}"</p>

              <div>
                <p className="font-semibold text-slate-900">{testimonial.name}</p>
                <p className="text-sm text-slate-600">{testimonial.service}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
