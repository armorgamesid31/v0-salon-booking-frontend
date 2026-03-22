interface InstagramProps {
  title: string
  instagramUrl?: string | null
}

export function Instagram({ title, instagramUrl }: InstagramProps) {
  if (!instagramUrl) return null

  return (
    <section className="py-14 bg-card">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 rounded-2xl border border-border bg-background p-8 text-center">
        <h2 className="text-3xl font-semibold text-foreground">{title}</h2>
        <p className="mt-3 text-muted-foreground">Follow us for latest transformations, campaigns, and daily beauty tips.</p>
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex rounded-full bg-secondary px-7 py-3 text-sm font-semibold text-secondary-foreground hover:opacity-90"
        >
          Open Instagram
        </a>
      </div>
    </section>
  )
}
