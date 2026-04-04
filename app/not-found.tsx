export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-semibold text-neutral-900">Page not found</h1>
      <p className="mt-3 text-sm text-neutral-600">
        The page you are looking for does not exist or may have been moved.
      </p>
    </main>
  )
}
