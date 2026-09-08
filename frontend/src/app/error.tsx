"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[v0] Route rendering error", error)
  }, [error])

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <section className="flex w-full max-w-md flex-col gap-5 rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="flex items-center gap-3 text-destructive">
          <AlertTriangle aria-hidden="true" />
          <h1 className="text-xl font-semibold">Unable to load this view</h1>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          The command center encountered a temporary rendering problem. Refresh the view to try again.
        </p>
        <button type="button" onClick={() => reset()} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <RefreshCw aria-hidden="true" />
          Try again
        </button>
      </section>
    </main>
  )
}
