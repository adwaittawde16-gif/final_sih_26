export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6 text-muted-foreground" aria-live="polite" aria-busy="true">
      <div className="flex items-center gap-3 text-sm">
        <span className="size-2 animate-pulse rounded-full bg-primary" aria-hidden="true" />
        Loading command center…
      </div>
    </main>
  )
}
