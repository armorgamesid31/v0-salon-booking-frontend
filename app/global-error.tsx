'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
          <h1 className="text-3xl font-semibold text-neutral-900">Something went wrong</h1>
          <p className="mt-3 text-sm text-neutral-600">
            {error?.message || 'An unexpected error occurred while loading this page.'}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
