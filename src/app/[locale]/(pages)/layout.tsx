import type { ReactNode } from 'react'

// Pages in this group exist only for the four locales. Any other first segment
// (/missing.txt, /favicon.ico) matches no route and gets app/global-not-found.tsx.
// The catch-all [locale]/[...rest] stays outside this group, so /it/missing still
// reaches [locale]/not-found.tsx with translations.
export const dynamicParams = false

export default function PagesLayout({ children }: { children: ReactNode }) {
  return children
}
