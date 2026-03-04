'use client'

interface AboutProps {
  salon: any
}

export function About({ salon }: AboutProps) {
  return (
    <section className="py-16 md:py-24 px-4 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center">
          About {salon.name}
        </h2>

        <div className="bg-white p-8 md:p-12 rounded-lg border border-slate-200">
          <p className="text-lg text-slate-600 leading-relaxed mb-6">
            Experience premium beauty and wellness services at {salon.name}. Our team of highly trained professionals is dedicated to providing exceptional care and transformative results.
          </p>

          <p className="text-lg text-slate-600 leading-relaxed">
            With state-of-the-art facilities and cutting-edge treatments, we're committed to helping you look and feel your best every day.
          </p>

          {salon.workingHours && salon.workingHours.length > 0 && (
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Working Hours</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {salon.workingHours.map((hours: any, idx: number) => (
                  <div key={idx} className="text-sm">
                    <p className="font-medium text-slate-900">{hours.day}</p>
                    <p className="text-slate-600">{hours.open} - {hours.close}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
