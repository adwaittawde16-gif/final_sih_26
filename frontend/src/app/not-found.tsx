import Link from "next/link"

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <section className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">404 / unavailable</p>
        <h1 className="text-2xl font-semibold">Record not found</h1>
        <p className="text-sm leading-6 text-muted-foreground">The requested intelligence view does not exist.</p>
        <Link href="/" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Return to command center</Link>
      </section>
    </main>
  )
}
