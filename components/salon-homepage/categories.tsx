import type { HomepageCategory } from '@/lib/types'

interface CategoriesProps {
  title: string
  categories: HomepageCategory[]
  servicesCount: (count: number) => string
}

export function Categories({ title, categories, servicesCount }: CategoriesProps) {
  return (
    <section className="py-14 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-semibold text-neutral-900 mb-8">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {categories.map((category) => (
            <article key={category.id} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xl font-semibold text-neutral-900">{category.name}</h3>
                <span className="text-xs rounded-full bg-neutral-200 px-3 py-1 text-neutral-700">
                  {servicesCount(category.serviceCount || 0)}
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-neutral-600">
                {category.marketingDescription || 'Professional treatments designed for visible, lasting results.'}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
