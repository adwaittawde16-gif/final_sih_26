"use client"

import { AlertTriangle } from "lucide-react"
import "./globals.css"

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <main className="flex min-h-screen items-center justify-center p-6">
          <section className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-border bg-card p-8 text-center shadow-sm">
            <AlertTriangle className="mx-auto text-destructive" aria-hidden="true" />
            <h1 className="text-xl font-semibold">System error</h1>
            <p className="text-sm leading-6 text-muted-foreground">The application needs to reload before it can continue.</p>
            <button type="button" onClick={() => reset()} className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Reload application</button>
          </section>
        </main>
      </body>
    </html>
  )
}
