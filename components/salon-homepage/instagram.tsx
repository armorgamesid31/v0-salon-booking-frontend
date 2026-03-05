interface InstagramProps {
  title: string
  instagramUrl?: string | null
}

export function Instagram({ title, instagramUrl }: InstagramProps) {
  if (!instagramUrl) return null

  return (
    <section className="py-14 bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-center">
        <h2 className="text-3xl font-semibold text-neutral-900">{title}</h2>
        <p className="mt-3 text-neutral-600">Follow us for latest transformations, campaigns, and daily beauty tips.</p>
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex rounded-full bg-neutral-900 px-7 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          Open Instagram
        </a>
      </div>
    </section>
  )
}
