import type { HomepageGalleryItem } from '@/lib/types'

interface GalleryProps {
  title: string
  gallery: HomepageGalleryItem[]
}

export function Gallery({ title, gallery }: GalleryProps) {
  return (
    <section className="py-14 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-semibold text-neutral-900 mb-8">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {gallery.map((image) => (
            <div key={image.id} className="overflow-hidden rounded-xl border border-neutral-200">
              <img
                src={image.imageUrl}
                alt={image.altText || 'Salon gallery image'}
                className="h-44 md:h-56 w-full object-cover hover:scale-[1.03] transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
