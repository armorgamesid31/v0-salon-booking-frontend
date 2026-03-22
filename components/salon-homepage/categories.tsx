'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'
import type { HomepageCategory } from '@/lib/types'

interface CategoriesProps {
  title: string
  categories: HomepageCategory[]
  servicesCount: (count: number) => string
}

function isImageUrl(value?: string | null): boolean {
  if (!value) return false
  return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')
}

export function Categories({ title, categories, servicesCount }: CategoriesProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const scrollByCard = (direction: 'prev' | 'next') => {
    if (!containerRef.current) return
    const cardWidth = Math.max(containerRef.current.clientWidth * 0.82, 280)
    const delta = direction === 'next' ? cardWidth : -cardWidth
    containerRef.current.scrollBy({ left: delta, behavior: 'smooth' })
  }

  return (
    <section className="py-14 bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-3">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground">{title}</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByCard('prev')}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:bg-background"
              aria-label="Previous category"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard('next')}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:bg-background"
              aria-label="Next category"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={containerRef}
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {categories.map((category) => {
            const imageSrc = category.coverImageUrl || (isImageUrl(category.icon) ? category.icon : null)
            return (
              <article
                key={category.id}
                className="min-w-[82%] sm:min-w-[56%] lg:min-w-[38%] xl:min-w-[30%] snap-start overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary via-secondary to-accent text-white shadow-sm"
              >
                <div className="relative h-44 w-full">
                  {imageSrc ? (
                    <img src={imageSrc} alt={category.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-primary via-secondary to-accent" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
                    {servicesCount(category.serviceCount || 0)}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-2xl font-semibold">{category.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-100/90">
                    {category.marketingDescription ||
                      'Expert touch, premium products, and carefully tailored treatments for visible, lasting results.'}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
