import type { Metadata } from 'next'
import './globals.css'

// 404 for URLs that match no route at all (for example /missing.txt). It bypasses
// app/[locale]/layout.tsx, so it has no translations: Italian with an English line.
// Localized 404s are app/[locale]/not-found.tsx.

export const metadata: Metadata = {
  title: 'Pagina non trovata · Page not found',
}

export default function GlobalNotFound() {
  return (
    <html lang="it">
      <body className="grid min-h-dvh place-items-center px-4 text-center">
        <main>
          <h1 className="text-4xl font-bold tracking-tight">Pagina non trovata</h1>
          <p className="mt-2 opacity-70">Page not found.</p>
          {/* A full page load: this page has no router to hand the link to. */}
          {/* oxlint-disable-next-line nextjs/no-html-link-for-pages */}
          <a href="/" className="mt-8 inline-block font-semibold text-magenta dark:text-lime">
            Swiss Wall Printing
          </a>
        </main>
      </body>
    </html>
  )
}
